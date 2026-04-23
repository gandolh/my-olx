---
name: phone-verification-stubbed
priority: 2
depends_on: [auth-complete.md]
area: auth
status: idea
---

# Phone verification with stubbed SMS provider

## Context

[backend/src/models/user.rs](../../backend/src/models/user.rs) already has `phone` + `phone_verified` columns. No endpoints hit them. A "verified seller" badge flag surfaces in [frontend FilterState.verificat](../../frontend/src/modules/categories/types/index.ts#L19) and the listing card UI, but nothing writes the underlying boolean. Real SMS providers (Twilio, SMS.ro, Plivo) cost money per message and need vendor selection + integration work that isn't MVP-critical.

This spec delivers the full phone-verification UX and backend contract **against a stubbed provider**. The stub accepts the code `123456` in all environments flagged as dev/MVP; swapping in Twilio or SMS.ro later is a drop-in trait implementation.

Related requirement: from [../requirements-summary.md](../requirements-summary.md) — phone verify was originally required before posting. This spec makes it **optional** for MVP (only gates the "verified seller" badge + filter); posting is gated on email verification only. When the real provider arrives, flipping one setting makes phone verification mandatory for posting.

## User stories

- As a seller, I can go to my profile and add + verify my phone number.
- As a seller in dev/MVP, entering `123456` as the verification code accepts it.
- As a seller, once verified, my listings show a "Vânzător verificat" badge.
- As a visitor, I can filter listings to show only verified sellers.
- As a developer, I can swap in a real SMS provider by implementing a single trait.

## Backend

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/phone/request-code` | yes | Body `{ "phone": "+40712345678" }`. Generates a 6-digit code, hashes + stores, calls `PhoneProvider::send_sms`. Stub logs the code. Always 204. Rate-limited: max 3 attempts per user per 10 min. |
| POST | `/auth/phone/verify` | yes | Body `{ "code": "123456" }`. Validates code against the most recent non-consumed row for the user. On success sets `users.phone_verified = true`, `users.phone = <phone>`. |

### Request/response

```rust
// dto/auth.rs (extend)

#[derive(Deserialize, Validate)]
pub struct RequestPhoneCodeRequest {
    #[validate(regex(path = "PHONE_RE", message = "invalid phone number"))]
    pub phone: String,
}
// PHONE_RE: match Romanian mobile e.g. +40 7x xxxx xxxx. Accept +40 or 0 prefix.

#[derive(Deserialize, Validate)]
pub struct VerifyPhoneRequest {
    #[validate(length(equal = 6, message = "code must be 6 digits"))]
    pub code: String,
}
```

### PhoneProvider trait

```rust
// backend/src/services/phone.rs

#[async_trait]
pub trait PhoneProvider: Send + Sync {
    async fn send_sms(&self, phone: &str, body: &str) -> Result<(), AppError>;
}

pub struct StubPhoneProvider;

#[async_trait]
impl PhoneProvider for StubPhoneProvider {
    async fn send_sms(&self, phone: &str, body: &str) -> Result<(), AppError> {
        tracing::info!("[stub-sms] to={} body={}", phone, body);
        Ok(())
    }
}

// Future: TwilioPhoneProvider { client, account_sid, from_number }
//         SmsRoPhoneProvider { api_key, sender_id }
```

Add `phone: Arc<dyn PhoneProvider>` to [backend/src/state.rs](../../backend/src/state.rs). In [backend/src/main.rs](../../backend/src/main.rs), pick provider based on `PHONE_PROVIDER=stub|twilio|smsro` env var; default `stub`.

### Business rules

- Phone number is stored in E.164 format (e.g. `+40712345678`). Normalize before insert: strip spaces, convert `07…` to `+407…`.
- Generated code: 6 digits, zero-padded, e.g. `042195`.
- **MVP stub shortcut**: when `PHONE_PROVIDER=stub`, the hash-compare in `/verify` additionally accepts the hardcoded `123456` regardless of DB state. Log a warning on every such acceptance.
- Code TTL: 10 minutes.
- Max 5 verify attempts per code; after that the row is marked consumed and user must request a new one.
- Max 3 `request-code` calls per user per 10 minutes.
- On successful verify: mark all prior non-consumed codes for that user as consumed.

### Files to touch

- `backend/src/routes/auth.rs` — add 2 routes (or nest a new `/auth/phone` router).
- `backend/src/handlers/auth.rs` — add `request_phone_code`, `verify_phone`.
- `backend/src/services/auth.rs` — add `request_phone_code`, `verify_phone`.
- `backend/src/services/phone.rs` — new (trait + stub).
- `backend/src/repositories/phone_tokens.rs` — new. CRUD for `phone_verification_codes`.
- `backend/src/repositories/users.rs` — add `set_phone_verified(user_id, phone)`.
- [backend/src/dto/auth.rs](../../backend/src/dto/auth.rs) — add DTOs.
- [backend/src/state.rs](../../backend/src/state.rs) — add `phone: Arc<dyn PhoneProvider>`.
- [backend/src/main.rs](../../backend/src/main.rs) — instantiate the provider.
- [backend/src/config.rs](../../backend/src/config.rs) — add `phone_provider: String` (defaults "stub").

### Reuse

- `AuthUser`, `AppError`.
- Same migration table (`phone_verification_codes`) from [migrations-and-schema.md](migrations-and-schema.md).
- `validator` crate.
- Argon2 is overkill for 6-digit codes; use a simple SHA-256 or bcrypt(cost=4) to store hashes. `sha2` is already transitively pulled in; add an explicit dep if not.

## Frontend

### Entry points for verification

Phone verification is triggered from two places in MVP:

1. **Profile settings page** (part of [user-profile-and-public.md](user-profile-and-public.md) but the modal itself is built here): "Verifică numărul de telefon" button.
2. **During listing creation wizard's review step** (from [listing-creation-wizard.md](listing-creation-wizard.md)): a banner "Adaugă numărul de telefon verificat pentru a apărea ca vânzător verificat" with a "Verifică acum" button.

Both open the same modal component.

### `PhoneVerifyModal` component

Two internal states:
1. **Phone entry**: input (Romanian format helper, mask `+40 7__ ___ ___`), validate, call `POST /auth/phone/request-code`. On 204: transition to code entry. Show a dev-only tip "Cod: 123456" when `import.meta.env.DEV` (tiny banner).
2. **Code entry**: 6 single-digit inputs or one `<input maxlength=6 inputMode=numeric>`; auto-submit when 6 digits present. Call `POST /auth/phone/verify`. On success: close modal, invalidate user cache, show toast "Telefon verificat cu succes".

### Services + hooks

```ts
// src/modules/auth/services/phone.ts
export async function requestPhoneCode(phone: string) { ... }
export async function verifyPhoneCode(code: string) { ... }

// src/modules/auth/hooks/usePhoneVerify.ts
export function usePhoneVerify() {
  const request = useMutation({ mutationFn: requestPhoneCode })
  const verify = useMutation({
    mutationFn: verifyPhoneCode,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })
  return { request, verify }
}
```

### Files to touch

- `frontend/src/modules/auth/components/PhoneVerifyModal.tsx` — new. Uses `@base-ui/react`'s dialog primitives.
- `frontend/src/modules/auth/services/phone.ts` — new.
- `frontend/src/modules/auth/hooks/usePhoneVerify.ts` — new.
- [frontend/public/locales/ro/common.json](../../frontend/public/locales/ro/common.json) — add `phoneVerify.*` keys (modal title, phone format help, rate limit error, invalid code, resend after countdown, dev-hint).

### Reuse

- `@base-ui/react` dialog (already installed).
- Shared `FormField`, `SubmitButton` from [auth-complete.md](auth-complete.md).
- `axiosInstance`.

## Acceptance criteria

- [ ] `POST /auth/phone/request-code` with a valid Romanian number returns 204 and logs the generated code in dev.
- [ ] `POST /auth/phone/verify` with code `123456` succeeds in stub mode.
- [ ] `users.phone_verified` flips to true and `users.phone` is populated in E.164 format.
- [ ] Re-sending a code within the 10-minute window beyond 3 attempts returns 429.
- [ ] Entering the wrong code 5 times consumes the row; user must request a new code.
- [ ] `GET /users/me` returns `phone_verified: true` after successful verification.
- [ ] "Verificat" badge appears on the user's listings once verified.
- [ ] `GET /listings?verified=true` excludes listings from unverified users.
- [ ] UI dev-hint "Cod: 123456" shows only when `import.meta.env.DEV` is true.
- [ ] Swapping `PHONE_PROVIDER=twilio` (even without a real impl) fails fast at startup with a clear error, not silent stub behavior.
- [ ] No unverified user can be shown as "Vânzător verificat" under any filter.

## Out of scope

- Real SMS provider integration (Twilio, SMS.ro, Plivo) — delivered by a dedicated post-MVP spec.
- WhatsApp / Viber verification.
- Phone-first auth (login via OTP instead of password).
- Changing a verified phone number (MVP: user must contact support; the column update path is covered by the stub endpoint but UX hides it).
- Rate-limiting by IP (only per-user).

## Verification

- Manual:
  1. Log in, go to settings, click "Verifică telefon".
  2. Enter `+40 712 345 678`, click "Trimite cod".
  3. In backend logs, see `[stub-sms] to=+40712345678 body=Codul tău PiațăRo: 042195`.
  4. In the UI enter `123456` — verify succeeds.
  5. Reload; navbar shows the verified badge on profile.
  6. Create a listing → it appears in `/listings?verified=true`.
- Automated:
  - Backend: `services/phone.rs::tests` covering stub-mode acceptance of `123456`, expiry, attempt limit, rate limit.
  - Integration: `tests/phone_verify.rs` happy path + request-too-often → 429.
  - Frontend: PhoneVerifyModal snapshot + submit test with MSW.
