# Wiki Index — PiațăRo

## Architecture

- [OpenAPI Documentation](architecture/openapi-documentation.md) — use utoipa and utoipa-swagger-ui for automated API docs
- [Why Axum](architecture/why-axum.md) — chose Axum 0.7 over Rocket for ecosystem momentum, type safety, and WebSocket support
- [Four-Layer Architecture](architecture/four-layer-architecture.md) — Router → Handler → Service → Repository; each layer talks only to the one below
- [Auth: JWT + Argon2](architecture/auth-jwt-argon2.md) — stateless JWT auth via type-level Axum extractor; Argon2 for password hashing
- [sqlx Over Diesel](architecture/sqlx-over-diesel.md) — compile-time checked plain SQL queries; async-native; no ORM DSL
- [Testing Strategy](architecture/testing-strategy.md) — unit tests with mock repositories; no integration tests at this stage
- [CORS Policy](architecture/cors-policy.md) — env-gated allowlist for production safety
- [Database Schema](architecture/database-schema.md) — versioned migrations and core table structure
- [Infrastructure Wiring](architecture/infrastructure-wiring.md) — centralized AppState for DB, S3, and Mail

## Features

- [Listing Creation Wizard](features/listing-creation-wizard.md) — 5-step posting flow targeting < 3 min on mobile [Done]
- [Authentication & Registration](features/auth-registration.md) — email/password signup with SMTP verification [Done]
- [Listing Lifecycle](features/listing-lifecycle.md) — 30-day expiry, free manual renewal, 5 posts/week limit [Done]
- [Search & Discovery](features/search-and-discovery.md) — Postgres FTS with Romanian diacritic support [Done]
- [Messaging System](features/messaging.md) — REST polling chat with content filtering [Done]
- [Favorites](features/favorites.md) — save listings for later via heart toggle [Done]
- [Image Upload](features/image-upload.md) — S3-backed image management with pre-signed URLs [Done]
- [Listing Detail](features/listing-detail.md) — full-page view with seller info and related items [Done]
- [User Dashboard](features/user-dashboard.md) — manage own listings and profile [Done]
- [Seller Phone Reveal](features/seller-phone-reveal.md) — auth-gated reveal of seller's verified phone number on listing detail [Done]
- [TanStack Router Migration](features/tanstack-router-migration.md) — plan for replacing react-router-dom with typed TanStack router [Planned]
- [Shared UI Component Library](features/shared-ui-components.md) — Base-ui-powered shared primitives: Tabs, ConfirmDialog, Dropdown, Tooltip, Pagination, Alert [Done]
