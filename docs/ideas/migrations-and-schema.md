---
name: migrations-and-schema
priority: 1
depends_on: []
area: infra
status: idea
---

# Initial database schema + sqlx migrations

## Context

[backend/migrations/](../../backend/migrations/) is empty (only `.gitkeep`). The code already queries `users` and `listings` tables — see [backend/src/repositories/users.rs:19](../../backend/src/repositories/users.rs#L19) and [backend/src/repositories/listings.rs:21-37](../../backend/src/repositories/listings.rs#L21-L37). On a fresh Postgres, `cargo run` panics on the first query. This spec delivers every table needed by MVP features (listings, auth, images, messaging, favorites) in one migration pass so downstream specs don't each need their own DB migration chapter.

Corresponding bug: [docs/issues/missing-migrations.md](../issues/missing-migrations.md).

## User stories

- As a developer, I can `cargo sqlx migrate run` against a clean Postgres and every MVP feature works.
- As a developer, I can wipe the DB and recreate state with zero manual SQL.

## Backend

### Migration files

Create `backend/migrations/` with the following files (timestamp prefix = ordering; use `YYYYMMDDHHMMSS` e.g. `20260423120000_init.sql`). sqlx CLI is installed via `cargo install sqlx-cli --features postgres` or the migration ships already-applied.

```
backend/migrations/
  20260423120000_init_extensions.sql
  20260423120100_users.sql
  20260423120200_email_verification.sql
  20260423120300_password_reset.sql
  20260423120400_phone_verification.sql
  20260423120500_listings.sql
  20260423120600_listing_images.sql
  20260423120700_listings_search.sql
  20260423120800_favorites.sql
  20260423120900_conversations_messages.sql
```

### 1. Extensions (`_init_extensions.sql`)

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "unaccent";    -- Romanian diacritic folding
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- trigram for fuzzy fallback
```

### 2. Users (`_users.sql`)

Matches [backend/src/models/user.rs](../../backend/src/models/user.rs) and the expanded shape needed by [auth-complete.md](auth-complete.md) and [user-profile-and-public.md](user-profile-and-public.md).

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    display_name    TEXT,
    avatar_url      TEXT,
    phone           TEXT,
    phone_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX users_email_lower_idx ON users (LOWER(email));
```

Note: the existing `User` model does **not** yet have `display_name`, `avatar_url`, or `email_verified`. Update [backend/src/models/user.rs](../../backend/src/models/user.rs) as part of this migration PR so sqlx derive matches.

### 3. Email verification (`_email_verification.sql`)

```sql
CREATE TABLE email_verification_tokens (
    token       TEXT PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX email_verification_tokens_user_idx ON email_verification_tokens (user_id);
```

### 4. Password reset (`_password_reset.sql`)

```sql
CREATE TABLE password_reset_tokens (
    token       TEXT PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX password_reset_tokens_user_idx ON password_reset_tokens (user_id);
```

### 5. Phone verification (`_phone_verification.sql`)

```sql
CREATE TABLE phone_verification_codes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    phone       TEXT NOT NULL,
    code_hash   TEXT NOT NULL,  -- store hash, never plaintext
    attempts    INT NOT NULL DEFAULT 0,
    expires_at  TIMESTAMPTZ NOT NULL,
    consumed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX phone_verification_codes_user_idx ON phone_verification_codes (user_id);
```

### 6. Listings (`_listings.sql`)

Matches [backend/src/models/listing.rs](../../backend/src/models/listing.rs) + `location` and `view_count` extensions that frontend types already expect ([frontend/src/modules/listings/types/index.ts](../../frontend/src/modules/listings/types/index.ts)).

```sql
CREATE TABLE listings (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    description   TEXT NOT NULL,
    price_ron     BIGINT,                     -- NULL = free
    is_negotiable BOOLEAN NOT NULL DEFAULT FALSE,
    category      TEXT NOT NULL,              -- slug from HomePage CATEGORIES
    city          TEXT NOT NULL,              -- slug from frontend CITIES
    active        BOOLEAN NOT NULL DEFAULT TRUE,
    view_count    BIGINT NOT NULL DEFAULT 0,
    expires_at    TIMESTAMPTZ NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX listings_user_id_idx        ON listings (user_id);
CREATE INDEX listings_category_idx       ON listings (category) WHERE active = TRUE;
CREATE INDEX listings_city_idx           ON listings (city) WHERE active = TRUE;
CREATE INDEX listings_created_at_idx     ON listings (created_at DESC) WHERE active = TRUE;
CREATE INDEX listings_expires_at_idx     ON listings (expires_at) WHERE active = TRUE;
```

### 7. Listing images (`_listing_images.sql`)

See [image-upload.md](image-upload.md) for the upload flow.

```sql
CREATE TABLE listing_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    s3_key      TEXT NOT NULL,     -- e.g. listings/<listing_id>/<uuid>.jpg
    position    INT NOT NULL,      -- 0 = primary, 1..9 = rest
    width       INT,
    height      INT,
    bytes       BIGINT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (listing_id, position)
);
CREATE INDEX listing_images_listing_idx ON listing_images (listing_id, position);
```

### 8. Listings full-text search (`_listings_search.sql`)

Generated tsvector column over `title` + `description` with Romanian diacritic folding. `simple` config chosen because Postgres has no `romanian` dictionary bundled; combined with `unaccent` this gives good-enough recall for MVP.

```sql
ALTER TABLE listings
    ADD COLUMN search_tsv tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', unaccent(coalesce(title, ''))), 'A') ||
        setweight(to_tsvector('simple', unaccent(coalesce(description, ''))), 'B')
    ) STORED;

CREATE INDEX listings_search_tsv_idx ON listings USING GIN (search_tsv);
```

Usage at query time: `WHERE search_tsv @@ plainto_tsquery('simple', unaccent($1))`.

### 9. Favorites (`_favorites.sql`)

See [favorites.md](favorites.md).

```sql
CREATE TABLE favorites (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, listing_id)
);
CREATE INDEX favorites_listing_idx ON favorites (listing_id);
```

### 10. Conversations + messages (`_conversations_messages.sql`)

See [messaging-rest-polling.md](messaging-rest-polling.md).

```sql
CREATE TABLE conversations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id   UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (listing_id, buyer_id)      -- one conversation per buyer per listing
);
CREATE INDEX conversations_buyer_idx  ON conversations (buyer_id, last_message_at DESC);
CREATE INDEX conversations_seller_idx ON conversations (seller_id, last_message_at DESC);

CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body            TEXT NOT NULL,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX messages_conv_created_idx ON messages (conversation_id, created_at ASC);
```

### Files to touch

- `backend/migrations/*.sql` — new (see list above).
- [backend/src/models/user.rs](../../backend/src/models/user.rs) — add `display_name`, `avatar_url`, `email_verified` fields.
- [backend/src/models/listing.rs](../../backend/src/models/listing.rs) — add `view_count` field.
- [backend/src/main.rs:27](../../backend/src/main.rs#L27) — after `PgPool::connect`, call `sqlx::migrate!("./migrations").run(&db).await?` so the backend applies migrations on startup.
- `backend/.env.example` — no changes (already has `DATABASE_URL`).
- `backend/README.md` (create if missing) — document `cargo sqlx migrate run` and the embedded-migrate auto-apply.

### Reuse

- sqlx's `migrate!` macro + `migrate` feature already enabled in [backend/Cargo.toml:12](../../backend/Cargo.toml#L12).
- Existing [backend/src/models/*](../../backend/src/models/) structs — extend, don't recreate.

## Acceptance criteria

- [ ] `docker-compose down -v && docker-compose up -d` then `cd backend && cargo run` starts cleanly; log shows "applied N migrations".
- [ ] `psql -U postgres -d my_olx -c '\dt'` lists all 9 tables.
- [ ] `psql -U postgres -d my_olx -c "SELECT * FROM pg_extension WHERE extname IN ('unaccent','pg_trgm','pgcrypto');"` returns 3 rows.
- [ ] Inserting a listing and running `SELECT search_tsv FROM listings` shows a non-null tsvector.
- [ ] `unaccent('Timișoara') = 'Timisoara'` returns true.
- [ ] Existing tests still pass: `cargo test` — no regressions in auth/listings service tests that use mock repos.
- [ ] New integration test (optional but recommended): `tests/db_smoke.rs` inserts a user + listing against a real Postgres and round-trips them.

## Out of scope

- Seeding demo data (separate spec / seed script).
- Per-category custom field schemas (deferred to the listing wizard spec; stored flat as `category TEXT` for MVP).
- Romanian stopword tuning / custom FTS dictionary (post-MVP; `simple` config + `unaccent` is good enough).
- Sharding, partitioning, read replicas.

## Verification

- Manual:
  1. `cd infrastructure/local && docker-compose down -v && docker-compose up -d` (fresh DB).
  2. `cd backend && cargo run` — confirm migrations apply and server binds.
  3. `curl -X POST http://localhost:8080/auth/register -H 'Content-Type: application/json' -d '{"email":"a@b.com","password":"password1"}'` → 200.
- Automated:
  - `cargo test` — existing 12 tests still green.
  - Add `backend/tests/migrations_apply.rs` that connects to `$TEST_DATABASE_URL`, runs `sqlx::migrate!`, asserts all 9 tables exist via `information_schema.tables`.
