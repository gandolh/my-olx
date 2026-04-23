# Backend Setup Design

_Date: 2026-04-23_

## Overview

Rust REST API backend for the my-olx Romanian classifieds marketplace. Built with Axum 0.7 using a layered architecture. The backend serves the existing React/Next.js frontend and handles auth, listings, messaging, search, and file uploads.

---

## Framework Choice

**Axum 0.7** with a layered service structure.

Chosen over Rocket because:

- Best ecosystem momentum in Rust web today
- Explicit, type-driven design — no macro magic hiding behavior
- First-class WebSocket support (needed for future real-time messaging)
- Built on `tower`/`hyper` — standard async Rust stack
- Clear compiler errors, good DX for a mixed-experience Rust team

---

## Architecture

Four-layer stack. Each layer communicates only with the layer directly below it.

```
HTTP Request
     ↓
  Router       — route definitions, middleware wiring
     ↓
  Handler      — extracts request data, calls service, returns response
     ↓
  Service      — business logic, validation, orchestration
     ↓
  Repository   — database queries only, no business logic
     ↓
  PostgreSQL / Redis / Elasticsearch
```

`AppState` is passed via Axum's `State` extractor to all handlers:

```rust
#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub redis: redis::Client,
    pub s3: aws_sdk_s3::Client,
    pub config: Arc<Config>,
}
```

---

## Directory Structure

```
backend/
├── src/
│   ├── main.rs                  # server bootstrap, state init
│   ├── config.rs                # env-based config struct
│   ├── state.rs                 # AppState definition
│   ├── error.rs                 # unified AppError → HTTP response
│   ├── router.rs                # top-level route assembly
│   │
│   ├── routes/                  # route modules grouped by domain
│   │   ├── auth.rs
│   │   ├── listings.rs
│   │   ├── users.rs
│   │   ├── messages.rs
│   │   └── search.rs
│   │
│   ├── handlers/                # one fn per endpoint, thin glue
│   │   ├── auth.rs
│   │   ├── listings.rs
│   │   ├── users.rs
│   │   ├── messages.rs
│   │   └── search.rs
│   │
│   ├── services/                # business logic, one struct per domain
│   │   ├── auth.rs
│   │   ├── listings.rs
│   │   ├── users.rs
│   │   ├── messages.rs
│   │   └── search.rs
│   │
│   ├── repositories/            # DB queries via sqlx, one struct per domain
│   │   ├── listings.rs
│   │   ├── users.rs
│   │   └── messages.rs
│   │
│   ├── models/                  # DB-mapped domain structs
│   │   ├── listing.rs
│   │   ├── user.rs
│   │   └── message.rs
│   │
│   ├── dto/                     # JSON request/response shapes
│   │   ├── listing.rs
│   │   ├── auth.rs
│   │   └── user.rs
│   │
│   └── middleware/              # tower middleware
│       ├── auth.rs              # JWT extractor (FromRequestParts)
│       └── rate_limit.rs        # Redis-backed sliding window
│
├── migrations/                  # sqlx migration files
├── Cargo.toml
└── .env.example
```

`models/` holds DB-mapped structs. `dto/` holds JSON shapes. Kept separate to avoid leaking DB internals into the API contract.

---

## Key Dependencies

```toml
[dependencies]
axum          = { version = "0.7", features = ["multipart", "ws"] }
tokio         = { version = "1", features = ["full"] }
tower         = { version = "0.4", features = ["full"] }
tower-http    = { version = "0.5", features = ["cors", "trace", "compression-br"] }

sqlx          = { version = "0.7", features = ["runtime-tokio", "postgres", "uuid", "chrono", "migrate"] }
redis         = { version = "0.25", features = ["tokio-comp"] }

serde         = { version = "1", features = ["derive"] }
serde_json    = "1"

jsonwebtoken  = "9"
argon2        = "0.5"

dotenvy       = "0.15"
config        = "0.14"

uuid          = { version = "1", features = ["v4", "serde"] }
chrono        = { version = "0.4", features = ["serde"] }
validator     = { version = "0.18", features = ["derive"] }

thiserror     = "1"
anyhow        = "1"

tracing              = "0.1"
tracing-subscriber   = { version = "0.3", features = ["env-filter"] }

aws-sdk-s3    = "1"
aws-config    = "1"
```

- `sqlx` over Diesel: compile-time checked queries, async-native, no heavy ORM.
- `argon2` for password hashing (current best practice).
- `ws` feature included now for future WebSocket messaging support.

---

## Error Handling

Single `AppError` enum in `error.rs`. All layers return `Result<T, AppError>` and use `?`. `IntoResponse` implemented once — maps variants to HTTP status + JSON body. Internal errors log the real cause via `tracing` but return a generic message to the client.

```rust
#[derive(thiserror::Error, Debug)]
pub enum AppError {
    #[error("not found")]
    NotFound,
    #[error("unauthorized")]
    Unauthorized,
    #[error("forbidden")]
    Forbidden,
    #[error("validation error: {0}")]
    Validation(String),
    #[error("conflict: {0}")]
    Conflict(String),
    #[error("rate limit exceeded")]
    RateLimit,
    #[error("internal error")]
    Internal(#[from] anyhow::Error),
    #[error("database error")]
    Database(#[from] sqlx::Error),
}
```

---

## Middleware Stack

Applied at router level in this order:

1. `TraceLayer` — request/response logging
2. `CompressionLayer` — br/gzip response compression
3. `CorsLayer` — configured per environment
4. JWT auth extractor — route-specific, implemented as `FromRequestParts`
5. `RateLimitLayer` — Redis-backed, route-specific

**JWT auth** is a custom Axum extractor, not blanket middleware. A handler that takes `AuthUser` as a parameter is protected at the type level. No risk of accidentally exposing a protected route.

**Rate limiting** applied only on:

- `POST /auth/register` and `POST /auth/login`
- `POST /listings` (enforces the 5 posts/week business rule)

---

## Testing Strategy

Unit tests only (`#[cfg(test)]` inside each module). No integration tests, no E2E.

All repositories are defined behind traits. Services receive mock repository implementations in tests — no real DB, no HTTP server, no external dependencies.

```rust
#[async_trait]
pub trait ListingRepository: Send + Sync {
    async fn create(&self, data: CreateListing) -> Result<Listing, AppError>;
    async fn find_by_id(&self, id: Uuid) -> Result<Listing, AppError>;
    async fn list_by_user(&self, user_id: Uuid) -> Result<Vec<Listing>, AppError>;
    async fn delete(&self, id: Uuid, owner_id: Uuid) -> Result<(), AppError>;
}
```

Every domain (auth, listings, users, messages, search) gets its own repository trait and mock. Tests cover business logic, validation, error mapping, and rate limit rules. Fast enough to run on every save.
