---
name: dead-s3-redis-wiring
type: issue
severity: low
area: backend
status: open
fixed_by: ideas/image-upload.md
---

# S3 and Redis clients initialized at startup but never used

## Problem

`AppState` at [backend/src/state.rs:8-9](../../backend/src/state.rs#L8-L9) holds:

```rust
pub redis: redis::Client,
pub s3: aws_sdk_s3::Client,
```

Both are built in [backend/src/main.rs:28-33](../../backend/src/main.rs#L28-L33):

```rust
let redis = redis::Client::open(cfg.redis_url.clone())?;
let aws_cfg = aws_config::from_env().region(...).load().await;
let s3 = aws_sdk_s3::Client::new(&aws_cfg);
```

But `grep -r "state.redis\|state.s3" backend/src/` returns zero matches. Both clients are constructed, held in memory, dropped on shutdown, and never used.

## Impact

- Adds ~500ms–2s to cold start while AWS SDK resolves credentials / region (especially if no env vars → default-provider chain scans IMDS, config file, etc.).
- Noise on startup (tracing logs from the AWS SDK credential resolution).
- False signal to code readers that these subsystems are in-use.
- Requires `REDIS_URL` and AWS env vars set in `.env.example` that don't need to be set → easy to hit misleading panics during cold dev setup.
- Docker compose runs `redis` and `localstack` containers that consume resources for no reason in current codebase.

## Repro

```bash
cd backend
cargo run
# observe startup logs include AWS SDK chatter.
```

Then:

```bash
grep -r "state\.redis\|state\.s3\|state_redis\|AppState" backend/src/ | grep -v state.rs | grep -v main.rs
# Only finds type imports — no actual usage.
```

## Root cause

Infrastructure scaffolded early, before the features that would use it. Fine to have S3/Redis planned — the cost is low once the features ship. But shipping them dead in `AppState` creates the illusion of working integration and slows down startup.

## Recommended fix

Two good paths; pick based on how close image-upload and Redis-backed features are:

### Option A — "re-hydrate when needed" (recommended if image-upload is imminent)

Leave them in. Ship [image-upload.md](../ideas/image-upload.md) soon, then the S3 client is used. Redis use case (rate limiting, session blacklist, background job queue) is further out; keep it.

### Option B — remove dead wiring now

If image-upload isn't on the next sprint:

1. Remove `redis` and `s3` fields from `AppState`.
2. Remove their initialization in `main.rs`.
3. Remove AWS / Redis fields from `Config` and `.env.example`.
4. Remove `redis` and `aws-sdk-s3` + `aws-config` from `Cargo.toml`.
5. Stop `redis` and `localstack` services in [infrastructure/local/docker-compose.yml](../../infrastructure/local/docker-compose.yml).
6. Re-add deliberately when the first using feature lands.

**Decision**: Option A wins if [image-upload.md](../ideas/image-upload.md) is in the current sprint (P1). Otherwise Option B.

## Affected files

- [backend/src/state.rs:8-9](../../backend/src/state.rs#L8-L9) — the unused fields.
- [backend/src/main.rs:28-33](../../backend/src/main.rs#L28-L33) — initialization.
- [backend/src/config.rs:6-10](../../backend/src/config.rs#L6-L10) — Redis + AWS config fields.
- [backend/Cargo.toml:13,34-35](../../backend/Cargo.toml) — `redis`, `aws-sdk-s3`, `aws-config`.
- [infrastructure/local/docker-compose.yml:20-31](../../infrastructure/local/docker-compose.yml#L20-L31) — Redis + localstack services.

## Verification after fix

- Option A verification is part of the image-upload spec (uploads succeed against LocalStack).
- Option B verification: `cargo build` succeeds; startup is noticeably faster; `grep aws_sdk_s3` returns nothing.
