# sqlx Over Diesel

**Decision:** Use `sqlx` for database access, not Diesel or SeaORM.

**Why:** `sqlx` provides compile-time checked queries against a live database schema without requiring a heavy ORM or generated code. It's async-native and integrates cleanly with Tokio. Queries are plain SQL — no DSL to learn, no abstraction fighting. The `#[derive(sqlx::FromRow)]` derive on model structs keeps mapping straightforward.

**Trade-offs:** No query builder — complex dynamic queries (e.g., search with many optional filters) require careful string construction or a helper. Migrations must be managed separately (`sqlx migrate`). Diesel would offer stronger compile-time safety for complex queries but at the cost of a heavy DSL and sync-first design.

**Context:** Migrations live in `backend/migrations/`. The `sqlx` CLI is used for migration management.
