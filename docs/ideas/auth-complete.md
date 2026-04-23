---
name: auth-complete
priority: 1
depends_on: [migrations-and-schema.md]
area: auth
status: idea
---

# Complete auth flow: register, login, email verify, password reset

## Context

Backend has [`POST /auth/register`](../../backend/src/handlers/auth.rs#L12) and [`POST /auth/login`](../../backend/src/handlers/auth.rs#L23) returning a JWT via [`AuthService`](../../backend/src/services/auth.rs). Missing: email verification, password reset, logout, and re-fetching the current user. Frontend has a Zustand auth store stub at [frontend/src/lib/auth.ts](../../frontend/src/lib/auth.ts) and an axios 401→`/autentificare` redirect at [frontend/src/lib/axios.ts:18](../../frontend/src/lib/axios.ts#L18), but zero auth pages — `/autentificare` falls through to `<ComingSoon />`.

This spec delivers:
- Backend endpoints for email verification + password reset + logout (stateless) + `GET /users/me` returning a full `UserResponse`.
- Email verification gate: unverified users can log in and browse but cannot POST a listing.
- Frontend pages: login, register, email-verify-callback, forgot-password, reset-password.

## User stories

- As a new user, I can register with email + password and receive a verification email.
- As a new user, clicking the link in my email marks my account verified and redirects me home.
- As a registered user, I can log in and the app remembers my session across reloads.
- As a user who forgot their password, I can request a reset email and set a new password via the link.
- As a logged-in user, I can log out and my token is discarded.
- As a logged-in user who hasn't verified their email, attempting to post a listing shows a clear "please verify your email" message with a "resend email" button.

## Backend

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | no | **Existing.** Extend to send verification email. Return user status. |
| POST | `/auth/login` | no | **Existing.** Return `email_verified` in response so FE can gate UI. |
| POST | `/auth/logout` | yes | No-op server-side (JWT is stateless); endpoint exists for symmetry + future token blacklist. Always 204. |
| POST | `/auth/email/verify` | no | Body `{ "token": "..." }`. Marks `users.email_verified = true`, consumes token. |
| POST | `/auth/email/resend` | yes | Regenerate + resend verification email if not already verified. |
| POST | `/auth/password/forgot` | no | Body `{ "email": "..." }`. Always returns 204 (don't leak whether email exists). Sends reset email if user exists. |
| POST | `/auth/password/reset` | no | Body `{ "token": "...", "password": "..." }`. Updates password, invalidates token. |
| GET | `/users/me` | yes | **Existing — extend.** Return full profile (id, email, display_name, avatar_url, email_verified, phone_verified, created_at). |

### Request/response shapes

```rust
// dto/auth.rs (add to existing file)

#[derive(Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: UserSummary,        // replaces bare user_id
}

#[derive(Serialize)]
pub struct UserSummary {
    pub id: Uuid,
    pub email: String,
    pub display_name: Option<String>,
    pub email_verified: bool,
    pub phone_verified: bool,
}

#[derive(Deserialize, Validate)]
pub struct VerifyEmailRequest { pub token: String }

#[derive(Deserialize, Validate)]
pub struct ForgotPasswordRequest {
    #[validate(email)]
    pub email: String,
}

#[derive(Deserialize, Validate)]
pub struct ResetPasswordRequest {
    pub token: String,
    #[validate(length(min = 8, message = "password must be at least 8 characters"))]
    pub password: String,
}
```

### Business rules

- Verification tokens: 32-byte random, base64-URL-encoded, TTL 24h, single-use.
- Password reset tokens: 32-byte random, TTL 1h, single-use.
- Hash rate-limits (Redis counter or Postgres table; acceptable to skip in MVP and document):
  - Forgot-password: max 3/hour per email.
  - Login: max 10 failed attempts per 15min per email (handled by returning generic `Unauthorized`; harder limits post-MVP).
- Email sender identity: `PiațăRo <noreply@piataro.ro>` from `SMTP_FROM` env var.
- Gating rule: `POST /listings/` must fail with `AppError::Forbidden("email_not_verified")` if the posting user has `email_verified = false`. Add this check in [backend/src/services/listings.rs](../../backend/src/services/listings.rs) — service needs a `UserRepository` handle (pass via constructor).

### Email sending

Use [`lettre`](https://crates.io/crates/lettre) crate (not yet a dependency — add to [backend/Cargo.toml](../../backend/Cargo.toml)):

```toml
lettre = { version = "0.11", default-features = false, features = ["builder", "smtp-transport", "tokio1-rustls-tls"] }
```

Config additions in [backend/src/config.rs](../../backend/src/config.rs):

```rust
pub smtp_host: String,
pub smtp_port: u16,
pub smtp_username: String,
pub smtp_password: String,
pub smtp_from: String,
pub frontend_base_url: String,   // for verify/reset links, e.g. http://localhost:5173
```

In dev, set `SMTP_HOST=mailhog` and add Mailhog to [infrastructure/local/docker-compose.yml](../../infrastructure/local/docker-compose.yml) (port 1025 SMTP, 8025 web UI). This is optional but recommended — spec calls it out as "nice to have"; acceptable to just log the email body to stdout in dev mode.

### Files to touch

- `backend/migrations/` — delivered by [migrations-and-schema.md](migrations-and-schema.md) (tables already there).
- [backend/src/routes/auth.rs](../../backend/src/routes/auth.rs) — add 5 new routes.
- `backend/src/handlers/auth.rs` — add handlers for verify, resend, forgot, reset, logout.
- [backend/src/services/auth.rs](../../backend/src/services/auth.rs) — extend with `send_verification_email`, `verify_email`, `forgot_password`, `reset_password`, `refresh_user_summary`.
- `backend/src/services/email.rs` — **new.** `EmailService` trait + `SmtpEmailService` impl + `LogOnlyEmailService` for dev fallback.
- `backend/src/repositories/email_tokens.rs` — **new.** CRUD for `email_verification_tokens`.
- `backend/src/repositories/password_tokens.rs` — **new.** CRUD for `password_reset_tokens`.
- `backend/src/repositories/users.rs` — add `set_email_verified(id)`, `update_password_hash(id, hash)`.
- [backend/src/dto/auth.rs](../../backend/src/dto/auth.rs) — add DTOs above.
- [backend/src/handlers/users.rs](../../backend/src/handlers/users.rs) — expand `me()` to return `UserSummary` from DB (not just `user_id` from token).
- [backend/src/state.rs](../../backend/src/state.rs) — add `email: Arc<dyn EmailService>` to `AppState`.
- [backend/src/config.rs](../../backend/src/config.rs) — add SMTP + `frontend_base_url` fields.
- [backend/src/services/listings.rs:21](../../backend/src/services/listings.rs#L21) — add email-verified check before creating listing.
- [backend/src/services/auth.rs:39](../../backend/src/services/auth.rs#L39) and [L51](../../backend/src/services/auth.rs#L51) — change `AuthResponse { user_id }` to return the fuller `UserSummary`.

### Reuse

- `AuthService` skeleton and JWT/argon2 in [backend/src/services/auth.rs](../../backend/src/services/auth.rs).
- [`AuthUser` extractor](../../backend/src/middleware/auth.rs#L18) for the logout/resend/me endpoints.
- [`AppError`](../../backend/src/error.rs) — already has `Conflict`, `Unauthorized`, `Forbidden`, `Validation`, `NotFound` variants; add `Forbidden("email_not_verified")` usage (no new variant needed).
- [`validator`](https://crates.io/crates/validator) crate already wired.

## Frontend

### Routes

Register these in [frontend/src/routes/index.tsx](../../frontend/src/routes/index.tsx) (same lazy-load pattern as `CategoryPage`):

| Path | Component | Module path |
|---|---|---|
| `/autentificare` | `LoginPage` | `src/modules/auth/pages/LoginPage.tsx` |
| `/inregistrare` | `RegisterPage` | `src/modules/auth/pages/RegisterPage.tsx` |
| `/verifica-email` | `EmailVerifyPage` | `src/modules/auth/pages/EmailVerifyPage.tsx` |
| `/parola-uitata` | `ForgotPasswordPage` | `src/modules/auth/pages/ForgotPasswordPage.tsx` |
| `/reseteaza-parola` | `ResetPasswordPage` | `src/modules/auth/pages/ResetPasswordPage.tsx` |

The axios 401-redirect target `/autentificare` in [frontend/src/lib/axios.ts:18](../../frontend/src/lib/axios.ts#L18) now resolves to a real page.

### Components

- `AuthCardShell` — shared rounded card layout with logo, heading, description slot, form slot. Uses tokens from [design/design-system/carpathian-clear.json](../../design/design-system/carpathian-clear.json).
- `FormField` — label + input + error message, controlled via `react-hook-form`'s `register`. Reuse across all 5 pages.
- `SubmitButton` — primary button with loading spinner.

Reuse existing [`ErrorCard`](../../frontend/src/components/ui/ErrorCard.tsx), [`Skeleton`](../../frontend/src/components/ui/Skeleton.tsx).

### Zod schemas

```ts
// src/modules/auth/schemas.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email invalid'),
  password: z.string().min(1, 'Parola este obligatorie'),
})

export const registerSchema = z.object({
  email: z.string().email('Email invalid'),
  password: z.string().min(8, 'Parola trebuie să aibă cel puțin 8 caractere'),
  passwordConfirm: z.string(),
}).refine((v) => v.password === v.passwordConfirm, {
  path: ['passwordConfirm'],
  message: 'Parolele nu coincid',
})

export const forgotSchema = z.object({ email: z.string().email('Email invalid') })

export const resetSchema = z.object({
  password: z.string().min(8, 'Parola trebuie să aibă cel puțin 8 caractere'),
  passwordConfirm: z.string(),
}).refine((v) => v.password === v.passwordConfirm, {
  path: ['passwordConfirm'],
  message: 'Parolele nu coincid',
})
```

### Services + hooks

```ts
// src/modules/auth/services/auth.ts
import { axiosInstance } from '@/lib/axios'

export async function register(data: { email: string; password: string }) {
  const res = await axiosInstance.post('/auth/register', data)
  return res.data  // { token, user }
}
// ...mirror for login, logout, forgotPassword, resetPassword, verifyEmail, resendVerification

// src/modules/auth/hooks/useLoginMutation.ts
import { useMutation } from '@tanstack/react-query'
import { login } from '../services/auth'
import { useAuth } from '@/lib/auth'
import { useNavigate } from 'react-router-dom'
```

### Zustand auth store

Extend [frontend/src/lib/auth.ts](../../frontend/src/lib/auth.ts):
- Replace `User { id, email, name }` with `User { id, email, display_name, email_verified, phone_verified }`.
- Add `hydrate()` that calls `GET /users/me` on app mount if a token exists in localStorage; populates state or clears token on 401.
- Call `hydrate()` in [frontend/src/App.tsx](../../frontend/src/App.tsx) inside a `useEffect`.

### Files to touch

- `frontend/src/modules/auth/pages/{Login,Register,EmailVerify,ForgotPassword,ResetPassword}Page.tsx` — new.
- `frontend/src/modules/auth/schemas.ts` — new.
- `frontend/src/modules/auth/services/auth.ts` — new.
- `frontend/src/modules/auth/hooks/` — new hooks per mutation.
- `frontend/src/modules/auth/components/{AuthCardShell,FormField,SubmitButton}.tsx` — new.
- [frontend/src/routes/index.tsx](../../frontend/src/routes/index.tsx) — register 5 routes.
- [frontend/src/lib/auth.ts](../../frontend/src/lib/auth.ts) — extend store + add `hydrate()`.
- [frontend/src/App.tsx](../../frontend/src/App.tsx) — call `hydrate()` on mount.
- [frontend/src/components/layout/Navbar.tsx](../../frontend/src/components/layout/Navbar.tsx) — swap the placeholder `<button aria-label="Profil">` for: show "Conectare" / "Înregistrare" links when logged out; show avatar + dropdown (Contul meu, Deconectare) when logged in.
- [frontend/public/locales/ro/common.json](../../frontend/public/locales/ro/common.json) and `en/common.json` — add `auth.*` keys (login, register, forgot, reset, verify — titles, labels, errors, buttons).

### i18n keys to add

Under a new `auth` namespace. Include Romanian copy like:
`auth.login.title = "Autentifică-te"`, `auth.register.title = "Creează un cont"`, `auth.verify.pending = "Verificăm emailul tău..."`, `auth.verify.success = "Email verificat cu succes!"`, `auth.forgot.submitted = "Dacă emailul există, îți vom trimite un link de resetare."`, etc.

## Acceptance criteria

- [ ] `POST /auth/register` with valid body returns `{ token, user }` and sends (or logs) a verification email with a link `{frontend_base_url}/verifica-email?token=<token>`.
- [ ] Clicking the link on a fresh user succeeds; a second click shows "token already used" error.
- [ ] Token expires after 24h.
- [ ] `POST /auth/login` works for unverified users (returns 200) — gating is post-login, not pre-login.
- [ ] `POST /listings/` returns 403 with `email_not_verified` code when the user hasn't verified their email.
- [ ] `POST /auth/password/forgot` returns 204 whether or not the email exists (no account enumeration).
- [ ] `/reseteaza-parola?token=<valid>` accepts a new password and invalidates the token; reused token returns 410 / 422.
- [ ] Logging out clears `localStorage.auth_token` and navigates to `/`.
- [ ] On page reload with a valid token, the user's identity is restored via `GET /users/me` before the first render that depends on auth.
- [ ] An expired/revoked token triggers the axios interceptor and redirects to `/autentificare`.
- [ ] All 5 new pages are covered by the existing `<Suspense>` fallback and use `AuthCardShell` for consistent design.
- [ ] Navbar shows the correct profile UI based on auth state.
- [ ] Form validation messages appear in Romanian with correct diacritics.

## Out of scope

- Social auth (Google, Facebook) — post-MVP.
- Multi-factor auth / TOTP.
- Refresh tokens / rotating JWTs — MVP uses a single 24h JWT; user re-logs in.
- Server-side token blacklist for logout — stateless logout (client drops token) is good enough for MVP; `POST /auth/logout` is a no-op.
- Email templates as HTML (send plaintext with the link; HTML + branded templates post-MVP).
- SSO / magic-link login.

## Verification

- Manual:
  1. Register at `/inregistrare`; expect the email body in backend stdout (dev) or Mailhog (`http://localhost:8025`).
  2. Click verification link; see "Email verificat!"; `email_verified` becomes true in DB.
  3. Log out; log in with same creds; navbar shows avatar dropdown.
  4. Trigger forgot-password with a bogus email → still 204.
  5. With a valid user, reset password, log in with new password.
  6. Before verifying, attempt to open `/adauga-anunt` and submit a listing — get a clear "verifică-ți emailul" message with a resend button.
- Automated:
  - Extend [backend/src/services/auth.rs tests](../../backend/src/services/auth.rs#L66-L152) with: verify-email happy path, expired token, reused token, reset-password happy path, forgot-password idempotency.
  - Add [`backend/tests/auth_integration.rs`] hitting a real Postgres via `sqlx::PgPool` to cover the repository side.
  - Frontend: snapshot `/autentificare` render; unit test the `loginSchema` zod validation.
