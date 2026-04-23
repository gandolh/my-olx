---
name: backend-development
description: Use when adding features, endpoints, business logic, or DB changes to the Rust/Axum backend of this project (my-olx / PiațăRo)
---

# Backend Development — my-olx (Rust/Axum)

## Architecture Layers (bottom-up)

```
models/ → repositories/ → services/ → handlers/ → routes/
(DB row)   (sqlx queries)  (business)   (HTTP)       (router)
```

Logic belongs in `services/`. DB queries belong in `repositories/`. Handlers are thin: parse → call service → return response. Never put sqlx in services or business logic in handlers.

## Task Checklists

### New endpoint (full stack)
1. Migration first (see below)
2. Update/create model in `models/`
3. Extend repository trait + `Pg*` impl in `repositories/`
4. Add business logic in `services/`
5. Write thin handler in `handlers/`
6. Wire route in `routes/` and `router.rs`
7. Write tests alongside implementation (services layer minimum)

### New business rule only
- Touch `services/` only
- Add/update unit test with mock repo

### New DB column or table
1. Migration first
2. Update `models/`
3. Update repository queries
4. Update affected DTOs in `dto/`

### New endpoint security gate (before marking done)
- [ ] Needs `AuthUser` extractor? Add it.
- [ ] Input validated via `#[validate(...)]` on DTO?
- [ ] Returns correct `AppError` variant (not `Internal` for user errors)?

## Migrations First — Always

No sqlx query compiles without the schema existing. Always create the migration before writing Rust code.

```bash
# From backend/
sqlx migrate add <description>
# e.g.: sqlx migrate add create_users_table
```

This creates `migrations/{timestamp}_{description}.sql`. Write UP logic inside it:

```sql
-- UP
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DOWN (optional but recommended)
-- DROP TABLE users;
```

Apply before running the server or tests:
```bash
sqlx migrate run
```

## Repository Pattern

Reference `repositories/users.rs` and `repositories/listings.rs` as the canonical pattern:
- Define a `trait *Repository` with `async-trait`
- Implement as `struct Pg*Repository { db: PgPool }`
- Use the trait in services (enables mock testing)

## Testing

Tests live in the same file (`#[cfg(test)]` module). Services are the primary test target — mock the repository trait.

Reference `services/auth.rs` and `services/listings.rs` for the mock repo pattern. Tests required; write them alongside or immediately after implementation.

## Error Handling

All layers return `Result<T, AppError>`. Use the most specific variant:

| Situation | Variant |
|-----------|---------|
| Not found in DB | `AppError::NotFound` |
| Bad JWT / no token | `AppError::Unauthorized` |
| Wrong owner | `AppError::Forbidden` |
| Invalid input | `AppError::Validation(msg)` |
| Duplicate (email, etc.) | `AppError::Conflict(msg)` |
| Weekly limit hit | `AppError::RateLimit` |
| Unexpected failures | `AppError::Internal(err)` |

## Key Business Rules

- Free tier: 5 listings/week per user (`WEEKLY_POST_LIMIT` in `services/listings.rs`)
- Listings expire 30 days after creation (`expires_at`)
- Currency: `price_ron: Option<i64>` — `None` = free listing
- Romanian localization: use diacritics (ă, â, î, ș, ț) in user-facing strings

## Commands

```bash
cargo build          # compile check
cargo run            # start server (0.0.0.0:8080)
cargo test           # all tests
cargo clippy         # lint
sqlx migrate run     # apply pending migrations
```

Requires PostgreSQL, Redis, and AWS S3 (or LocalStack) to be running. See `backend/.env.example`.
