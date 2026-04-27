# Infrastructure Wiring

**Decision:** Centralized `AppState` in Axum for resource sharing (DB, S3, Redis).

**Why:** Avoids global state and makes testing easier by injecting dependencies.

**Trade-offs:** Requires passing `State` to every handler.

**Context:**
- Database: `sqlx::PgPool`
- Storage: `aws_sdk_s3::Client`
- Mail: `SmtpEmailService` (Lettre)
- All clients initialized in `main.rs` and wrapped in `Arc<AppState>`.
