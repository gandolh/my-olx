# Wiki Index — PiațăRo

## Architecture

- [Why Axum](architecture/why-axum.md) — chose Axum 0.7 over Rocket for ecosystem momentum, type safety, and WebSocket support
- [Four-Layer Architecture](architecture/four-layer-architecture.md) — Router → Handler → Service → Repository; each layer talks only to the one below
- [Auth: JWT + Argon2](architecture/auth-jwt-argon2.md) — stateless JWT auth via type-level Axum extractor; Argon2 for password hashing
- [sqlx Over Diesel](architecture/sqlx-over-diesel.md) — compile-time checked plain SQL queries; async-native; no ORM DSL
- [Testing Strategy](architecture/testing-strategy.md) — unit tests with mock repositories; no integration tests at this stage

## Features

- [Listing Creation Wizard](features/listing-creation-wizard.md) — step-by-step posting flow targeting < 3 min on mobile [Planned]
- [Authentication & Registration](features/auth-registration.md) — email/password signup with verification; social auth deferred [Planned]
- [Listing Lifecycle](features/listing-lifecycle.md) — 30-day expiry, free manual renewal, 5 posts/week limit [Planned]
- [Search & Discovery](features/search-and-discovery.md) — Elasticsearch with Romanian diacritic support, filters, homepage discovery [Planned]
- [Messaging System](features/messaging.md) — real-time WebSocket chat with optional phone number reveal [Planned]
