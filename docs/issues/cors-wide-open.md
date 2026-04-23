---
name: cors-wide-open
type: issue
severity: high
area: backend
status: open
---

# CORS accepts any origin, method, and header

## Problem

[backend/src/router.rs:9-13](../../backend/src/router.rs#L9-L13) applies:

```rust
let cors = CorsLayer::new()
    .allow_origin(Any)
    .allow_methods(Any)
    .allow_headers(Any);
```

This is fine in development but unsafe for production. It enables any website on the internet to make authenticated-style requests against the API (though browsers still block `Authorization` header use with `allow_origin(Any)` unless credentials are also allowed — the combination is inconsistent rather than maximally permissive, but the intent is wrong for prod).

## Impact

- Production launch risk. Any third-party site can call the public endpoints; misconfiguration could later allow credentialed requests if someone flips `.allow_credentials(true)`.
- Breaks the principle of least privilege.
- Makes it harder to detect actual FE-BE integration bugs (the FE can call from anywhere; origin drift goes unnoticed).

## Repro

- Serve the frontend from `http://localhost:5173`, backend on `:8080` — works.
- From `http://evil.example/` (or a random localhost port), `fetch('http://localhost:8080/listings')` — also succeeds. This should be rejected in prod.

## Root cause

The layer was added for fast initial development and never narrowed.

## Recommended fix

Env-gated allowlist:

```rust
// backend/src/router.rs
use axum::http::{HeaderValue, Method};

fn build_cors(cfg: &Config) -> CorsLayer {
    let origins: Vec<HeaderValue> = cfg
        .cors_allowed_origins
        .split(',')
        .filter_map(|s| s.trim().parse().ok())
        .collect();

    CorsLayer::new()
        .allow_origin(origins)
        .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::DELETE, Method::OPTIONS])
        .allow_headers([
            axum::http::header::AUTHORIZATION,
            axum::http::header::CONTENT_TYPE,
            axum::http::header::ACCEPT,
        ])
        .allow_credentials(false)   // flip to true only if we move to cookie sessions
}
```

Config additions in [backend/src/config.rs](../../backend/src/config.rs):

```rust
pub cors_allowed_origins: String,   // comma-separated
```

Set:
- Dev: `CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000`
- Prod: `CORS_ALLOWED_ORIGINS=https://piataro.ro,https://www.piataro.ro`

## Affected files

- [backend/src/router.rs](../../backend/src/router.rs) — replace `Any` with the allowlist.
- [backend/src/config.rs](../../backend/src/config.rs) — add `cors_allowed_origins` field.
- `backend/.env.example` — add `CORS_ALLOWED_ORIGINS=http://localhost:5173`.

## Verification after fix

- Dev: FE at `localhost:5173` still works end-to-end.
- `curl -H 'Origin: https://evil.example' http://localhost:8080/listings` — response lacks `Access-Control-Allow-Origin` (or explicitly mismatches).
- Preflight `OPTIONS` requests with unsupported headers get rejected.
