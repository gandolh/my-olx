# Four-Layer Architecture

**Decision:** Backend is structured in four layers: Router → Handler → Service → Repository.

**Why:** Each layer has a single responsibility and communicates only with the layer directly below it. This makes the codebase predictable — business logic never leaks into handlers, DB queries never appear in services. Services are generic over repository traits, which means they can be unit-tested with mock repositories without spinning up a real database.

**Trade-offs:** More files and indirection than a flat structure. For simple CRUD endpoints the layering can feel ceremonial. Worth it as the codebase grows beyond a few domains.

**Context:** The `AppState` struct (`db: PgPool`, `redis: Client`, `s3: Client`, `config: Arc<Config>`) is passed via Axum's `State` extractor to all handlers. All layers return `Result<T, AppError>` using the unified error enum in `error.rs`.
