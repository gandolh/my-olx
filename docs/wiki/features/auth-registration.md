# Authentication & Registration

**Status:** Done

**Summary:** Email/password registration with email verification; social auth (Google, Facebook)

## Requirements

- Email + password signup
- Email verification (confirmation link) via SMTP
- Phone verification required before first listing post
- JWT token response with stateless auth
- Password hashing with Argon2
- User re-hydration on app mount (GET /users/me)

## Design Notes

- Stateless JWT auth via type-level Axum extractor
- Email verification gate for listing creation
- Rate limiting on auth endpoints (MVP documented/minimal)
- Frontend re-hydration restores session on reload

## Acceptance Criteria

- User can register, verify email, and log in
- Unverified users cannot post listings
- JWT token returned on successful login
- Password reset flow (forgot/reset) implemented
- Logout discarding token client-side
