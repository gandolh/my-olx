# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**my-olx** ("PiațăRo") is a Romanian classifieds marketplace (OLX competitor). Monorepo with a Rust/Axum backend and React/TypeScript frontend. Early stage — structure and boilerplate are in place but most features are unimplemented.

## Commands

### Backend (Rust/Axum)

```bash
cd backend
cp .env.example .env          # first time setup
cargo build                   # build
cargo run                     # start server (default: 0.0.0.0:8080)
cargo test                    # all tests
cargo test <module_name>      # single module tests
cargo clippy                  # lint
```

Requires: PostgreSQL, Redis, AWS S3 (or LocalStack). See `backend/.env.example` for required env vars.

### Frontend (React/Vite)

```bash
cd frontend
npm install
npm run dev                   # dev server with HMR
npm run build                 # tsc -b && vite build
npm run lint                  # ESLint
npm run preview               # preview production build
```

## Architecture

### Backend: 4-Layer Architecture

```
handlers/  →  services/  →  repositories/  →  models/
(HTTP)        (business)    (DB queries)       (sqlx::FromRow)
```

- **`routes/`** — Axum router definitions (auth, listings, users)
- **`handlers/`** — Thin: parse request, call service, return response
- **`services/`** — Business logic and validation orchestration
- **`repositories/`** — sqlx queries only; defined as traits for testability
- **`models/`** — DB row structs (`#[derive(sqlx::FromRow)]`)
- **`dto/`** — Request/response JSON shapes (separate from models)
- **`middleware/auth.rs`** — JWT extractor as Axum `FromRequestParts` → `AuthUser`
- **`error.rs`** — Single `AppError` enum, all layers return `Result<T, AppError>`
- **`state.rs`** — `AppState` holds `PgPool`, Redis client, S3 client, Config

Auth: JWT (jsonwebtoken) + Argon2 password hashing. Passwords stored as `password_hash`, never plaintext.

Database migrations live in `backend/migrations/` (currently empty — none created yet).

### Frontend: React Router + React Query

- **Routing:** React Router DOM v7 with `BrowserRouter`
- **Server state:** `@tanstack/react-query` + `axios`
- **Styling:** Tailwind CSS v4 (loaded via Vite plugin, no `tailwind.config.js` needed)
- **Validation:** Zod schemas for forms
- **Headless UI:** `@base-ui/react`

Route layout in `src/App.tsx`: `Navbar` + `<Routes>` + `Footer`. Only `/` (HomePage) is implemented; all other routes render `<ComingSoon />`.

### Design System: Carpathian Clear

Tokens in `design/design-system/carpathian-clear.json`.
- Primary: `#0056D2` (blue), Secondary: `#008B8B` (teal), Tertiary: `#2E7D32` (green)
- Fonts: Manrope (headlines), Inter (body)
- Border radius: 8px (`rounded-xl`)
- Design screens (HTML mockups): `design/screens/`

### Key Business Rules

- Free tier: 5 listings/week limit per user
- Listings expire after 30 days (`expires_at` field)
- Currency: RON (`price_ron: Option<i64>`, nullable = free listing)
- Romanian localization required (diacritics: ă, â, î, ș, ț)
- Target: < 3 min listing creation, WCAG 2.1 AA accessibility
