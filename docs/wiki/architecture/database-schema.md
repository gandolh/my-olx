# Database Schema & Migrations

**Decision:** Use `sqlx` migrations with a strictly versioned schema.

**Why:** Compile-time checked queries require the schema to be present. Migrations ensure all environments (local, CI, prod) are in sync.

**Trade-offs:** Manual SQL management (no ORM DSL like Diesel).

**Context:**
- Core tables: `users`, `listings`, `listing_images`, `favorites`, `conversations`, `messages`.
- Postgres-specific features: `tsvector` for search, `unaccent` extension.
- FK constraints with `ON DELETE CASCADE` for clean data lifecycle.
