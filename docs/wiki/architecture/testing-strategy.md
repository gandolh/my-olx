# Testing Strategy

**Decision:** Unit tests only, using mock repositories. No integration tests, no E2E at this stage.

**Why:** All repositories are defined behind async traits. Services receive mock implementations in tests — no real DB, no HTTP server, no external dependencies. Tests run fast enough to execute on every save. This keeps the feedback loop tight during early development.

**Trade-offs:** Mock/prod divergence is a real risk — mocked tests can pass while a real migration breaks something. This is acceptable for MVP velocity but should be revisited before production launch. Integration tests against a real DB (e.g., using `sqlx::test`) should be added for critical paths (auth, listing creation, rate limiting).

**Context:** Each domain (auth, listings, users, messages, search) has its own repository trait and corresponding mock. Business logic, validation, error mapping, and rate limit rules are all covered at the unit level.
