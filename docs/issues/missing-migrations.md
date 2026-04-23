---
name: missing-migrations
type: issue
severity: blocker
area: infra
status: open
fixed_by: ideas/migrations-and-schema.md
---

# Backend ships without any DB migrations → won't run on a clean Postgres

## Problem

The `backend/migrations/` directory is empty except for `.gitkeep`. The code executes SQL like `SELECT * FROM users WHERE email = $1` ([backend/src/repositories/users.rs:19](../../backend/src/repositories/users.rs#L19)) and the whole listings CRUD against tables that don't exist on a fresh Postgres instance.

## Impact

- `docker-compose up -d` + `cargo run` against a new volume **panics** on the first query. The server never successfully handles a request.
- The project README / CLAUDE.md implies "start Postgres, run backend" → that path is broken.
- Anyone cloning the repo today cannot get a working local environment without writing their own SQL first.
- Tests that use real DB (none currently) can't be added.
- The project's [CLAUDE.md:64](../../CLAUDE.md) explicitly acknowledges this ("migrations/ — currently empty; no schema applied yet") but no work item tracks the fix.

## Repro

```bash
cd infrastructure/local
docker-compose down -v
docker-compose up -d

cd ../../backend
cp .env.example .env
cargo run
# In another terminal:
curl -X POST http://localhost:8080/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"a@b.com","password":"password1"}'
# → 500 Internal Server Error
# Server logs: "relation \"users\" does not exist"
```

## Root cause

- Empty `backend/migrations/` directory ([backend/migrations/.gitkeep](../../backend/migrations/.gitkeep)).
- `cargo run` in [backend/src/main.rs:27](../../backend/src/main.rs#L27) connects to the DB but does not apply migrations.
- sqlx's `migrate` feature **is** enabled in [backend/Cargo.toml:12](../../backend/Cargo.toml#L12), so the machinery exists — only the migration files themselves are missing.

## Recommended fix

1. Deliver the full schema via [docs/ideas/migrations-and-schema.md](../ideas/migrations-and-schema.md) — 10 SQL files covering users, listings, listing_images, favorites, conversations, messages, email/password/phone tokens, + FTS.
2. Add `sqlx::migrate!("./migrations").run(&db).await?` right after the pool connect in [backend/src/main.rs:27](../../backend/src/main.rs#L27) so startup is self-applying.
3. Document the auto-apply behavior in `backend/README.md` (create if missing).

Short-circuit fix (if the full schema spec isn't ready): at minimum, write `0001_users_listings.sql` containing just the two existing models' tables so `cargo run` doesn't panic. But don't ship this as the long-term solution — the full spec is the right target.

## Affected files

- [backend/migrations/.gitkeep](../../backend/migrations/.gitkeep) — replace with real migration files.
- [backend/src/main.rs:27](../../backend/src/main.rs#L27) — add `sqlx::migrate!` invocation.
- [backend/Cargo.toml:12](../../backend/Cargo.toml#L12) — `migrate` feature already enabled, no change.
- [CLAUDE.md:64](../../CLAUDE.md) — update to reflect migrations now exist.

## Verification after fix

- `docker-compose down -v && docker-compose up -d && (cd backend && cargo run)` — server binds and logs "applied N migrations".
- `psql -U postgres -d my_olx -c '\dt'` shows all tables.
- `curl -X POST /auth/register` returns 200.
