# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**my-olx** ("PiațăRo") is a Romanian classifieds marketplace (OLX competitor). Monorepo with a Rust/Axum backend and React/TypeScript frontend. Early stage — backend auth/listings implemented, most frontend routes are `<ComingSoon />`.

## Commands

### Local Infrastructure (start first)

```bash
cd infrastructure/local
docker-compose up -d          # starts PostgreSQL 16, Redis 7, LocalStack (S3)
```

### Backend (Rust/Axum)

```bash
cd backend
cp .env.example .env          # first time only
cargo run                     # start server on 0.0.0.0:8080
cargo test                    # all tests
cargo test <test_fn_name>     # single test (e.g. cargo test test_register)
cargo clippy                  # lint
```

Backend `.env` values must match docker-compose defaults (already do in `.env.example`).

### Frontend (React/Vite)

```bash
cd frontend
npm install
npm run dev                   # dev server with HMR (proxies API to localhost:8080)
npm run build                 # tsc + vite build
npm run lint                  # ESLint
```

Frontend reads `VITE_API_URL` (default: `http://localhost:8080`) from `.env`.

## Architecture

### Backend: 4-Layer Architecture

```
routes/ → handlers/ → services/ → repositories/ → models/
```

- **`routes/`** — Axum router assembly (`/auth`, `/listings`, `/users`)
- **`handlers/`** — Thin: extract request, call service, return response; protected endpoints use `AuthUser` extractor
- **`services/`** — Business logic; generic over repository traits (`AuthService<R: UserRepository>`)
- **`repositories/`** — sqlx queries only; defined as traits so services can be unit-tested with mocks
- **`models/`** — DB row structs (`#[derive(sqlx::FromRow)]`)
- **`dto/`** — Request/response JSON shapes (separate from models, use `validator` crate)
- **`middleware/auth.rs`** — JWT extractor as Axum `FromRequestParts` → `AuthUser { user_id }`
- **`error.rs`** — Single `AppError` enum; all layers return `Result<T, AppError>`; maps to HTTP status + JSON
- **`state.rs`** — `AppState { db: PgPool, redis: Client, s3: Client, config: Arc<Config> }`
- **`router.rs`** — Top-level router; middleware stack: CORS (Any), Brotli compression, tower-http tracing

Auth: JWT (`jsonwebtoken`) + Argon2 password hashing. `password_hash` only, never plaintext.

Database migrations: `backend/migrations/` — currently empty; no schema applied yet.

### Frontend: React Router + React Query

- **Routing:** React Router DOM v7 — `BrowserRouter` in `App.tsx`; routes defined in `src/routes/index.tsx`
- **Server state:** `@tanstack/react-query` + axios (`src/lib/axios.ts` — adds Bearer token, handles 401 redirect)
- **Styling:** Tailwind CSS v4 via Vite plugin (no `tailwind.config.js`); path alias `@/` → `src/`
- **Forms:** React Hook Form + Zod
- **Headless UI:** `@base-ui/react`
- **i18n:** `i18next` with Romanian (`ro`) default; translations in `public/locales/{lang}/common.json`
- **State:** Zustand installed but unused — prefer React Query for server state

Route layout: `Navbar` + `<AppRoutes>` + `Footer`. Only `/` (HomePage) is implemented.

Feature modules live under `src/modules/{feature}/` with sub-folders `pages/`, `components/`, `types/`.

### Design System: Carpathian Clear

Tokens: `design/design-system/carpathian-clear.json` (Material Design 3 conventions).
- Primary: `#0056D2` (blue), Secondary: `#008B8B` (teal), Tertiary: `#2E7D32` (green)
- Fonts: Manrope (headlines), Inter (body)
- Border radius: 8px (`rounded-xl`)
- HTML mockups for reference: `design/screens/` and `design/code/`

### Key Business Rules

- Free tier: 5 listings/week per user (`WEEKLY_POST_LIMIT` in `services/listings.rs`)
- Listings auto-expire after 30 days (`expires_at = NOW() + INTERVAL '30 days'` set at creation)
- Currency: RON (`price_ron: Option<i64>`; `None` = free listing)
- Romanian localization required throughout UI (diacritics: ă, â, î, ș, ț)
- Target: < 3 min listing creation, WCAG 2.1 AA accessibility
