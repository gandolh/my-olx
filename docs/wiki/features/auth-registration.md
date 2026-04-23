# Authentication & Registration

**Status:** Planned

**Summary:** Email/password registration with email verification; social auth (Google, Facebook) deferred post-MVP.

## Requirements

- Email + password signup
- Email verification (confirmation link)
- Phone verification required before first listing post
- OTP via SMS or Authenticator app
- Login with JWT token response
- Password hashing with Argon2

## Design Notes

- Social auth (Google, Facebook) is in the design brief but backend currently only implements email/password — social auth deferred
- Identity verification for seller badges (Romanian e-ID or manual review) is post-MVP
- Rate limiting on `/auth/register` and `/auth/login` to prevent brute force

## Acceptance Criteria

- User can register, verify email, and log in
- Unverified users cannot post listings
- JWT token returned on successful login, used for all subsequent authenticated requests
