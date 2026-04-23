# Auth: JWT + Argon2

**Decision:** Authentication uses JWT tokens (`jsonwebtoken` crate) with Argon2 password hashing (`argon2` crate).

**Why:** JWT is stateless — no DB lookup on every request. The `AuthUser` extractor is implemented as Axum's `FromRequestParts`, so protected endpoints are enforced at the type level: a handler that takes `AuthUser` as a parameter simply won't compile without valid auth. This eliminates the risk of accidentally exposing a protected route.

Argon2 is the current best practice for password hashing — winner of the Password Hashing Competition, memory-hard, resistant to GPU cracking. Only `password_hash` is ever stored; plaintext never touches the DB.

**Trade-offs:** JWT tokens can't be invalidated before expiry without a token denylist (e.g., Redis). This is a known limitation — acceptable for MVP, should be revisited if account compromise becomes a concern.

**Context:** Rate limiting on `/auth/register` and `/auth/login` is Redis-backed to prevent brute-force attacks.
