---
name: user-profile-and-public
priority: 3
depends_on: [auth-complete.md]
area: auth
status: idea
---

# Edit own profile + public seller page

## Context

[backend/src/handlers/users.rs:10-15](../../backend/src/handlers/users.rs#L10-L15) exposes only a minimal `GET /users/me` returning `{ user_id }`. After [auth-complete.md](auth-complete.md) this returns `UserSummary` with `display_name`, `avatar_url`, `email_verified`, `phone_verified`. Still missing: a way for users to edit their own profile (`display_name`, `avatar_url`) and a public seller profile page that buyers can click from `SellerCard` on the listing detail page.

## User stories

- As a logged-in user, I can set my display name and avatar from `/cont/setari`.
- As a visitor, clicking a seller's avatar/name on a listing takes me to `/utilizator/:id` showing their active listings and member-since date.
- As a seller, the avatar I upload is used across the app (navbar, listings, messages).

## Backend

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| PATCH | `/users/me` | yes | Partial update: `display_name`, `avatar_s3_key`. |
| POST | `/users/me/avatar/upload-url` | yes | Presigned S3 PUT for avatar. Similar to [image-upload.md](image-upload.md). |
| GET | `/users/:id` | no | Public profile. Returns `SellerSummary` + count of active listings. |
| GET | `/users/:id/listings` | no | Same shape as `GET /listings` but filtered to `user_id = :id AND active = true`. |

### Request/response

```rust
// dto/user.rs (add)

#[derive(Deserialize, Validate)]
pub struct UpdateProfileRequest {
    #[validate(length(min = 2, max = 60, message = "display name must be 2–60 characters"))]
    pub display_name: Option<String>,
    pub avatar_s3_key: Option<String>,   // committed avatar image
}

#[derive(Serialize)]
pub struct PublicUserResponse {
    pub id: Uuid,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub phone_verified: bool,
    pub member_since: DateTime<Utc>,
    pub active_listings_count: i64,
}
```

### Business rules

- `display_name` is optional; if unset, UI falls back to the local-part of the email (`user@example.com` → `user`).
- Email is **not** editable via `PATCH /users/me` in MVP (requires re-verification). Surface a "Schimbă emailul" link that says "Această funcție va fi disponibilă în curând".
- Password change is **not** in this spec — covered by [auth-complete.md](auth-complete.md)'s reset flow or add a small `PATCH /users/me/password` taking `{ current_password, new_password }`. Decision: **add it here** for UX completeness.

Add:

| Method | Path | Auth | Purpose |
|---|---|---|---|
| PATCH | `/users/me/password` | yes | Body `{ current_password, new_password }`. Validates current password, updates hash. |

- Avatar: bucket prefix `users/<user_id>/avatar/<uuid>.<ext>`. Only one active avatar per user (overwrite the `avatar_url` column; old S3 objects may leak — acceptable for MVP).

### Files to touch

- [backend/src/routes/users.rs](../../backend/src/routes/users.rs) — add 4 routes.
- [backend/src/handlers/users.rs](../../backend/src/handlers/users.rs) — add 4 handlers.
- `backend/src/services/users.rs` — new (or extend from [user-dashboard.md](user-dashboard.md)): `update_profile`, `change_password`, `get_public_profile`.
- [backend/src/repositories/users.rs](../../backend/src/repositories/users.rs) — add `update_profile`, `update_avatar`, `get_public`.
- [backend/src/dto/user.rs](../../backend/src/dto/user.rs) — add DTOs.
- Reuse avatar upload scaffolding from [image-upload.md](image-upload.md); consider extracting a shared `presign_put(prefix, content_type) -> PresignedUpload` helper in `backend/src/services/storage.rs`.

### Reuse

- `AuthUser`, `AppError`.
- Argon2 utilities from [auth.rs](../../backend/src/services/auth.rs) for password change verification.
- S3 client + presign flow from [image-upload.md](image-upload.md).

## Frontend

### Routes

| Path | Component |
|---|---|
| `/cont/setari` | `SettingsPage` — edit profile, change password, phone verify entry point. |
| `/utilizator/:id` | `PublicProfilePage` — seller's public page. |

### SettingsPage layout

Single page, three sections:
1. **Profil** — avatar (click to upload), display name input, email (read-only with tooltip), phone (with "Verifică" button — see [phone-verification-stubbed.md](phone-verification-stubbed.md)).
2. **Securitate** — change password form (current + new + confirm).
3. **Sesiune** — "Deconectează-te" button.

### PublicProfilePage layout

- Header: avatar, display_name, verified badge if `phone_verified`, "Membru din [date]", `{active_listings_count}` listings.
- Grid of listings (same `ListingCard` + pagination from [public-browse-and-search.md](public-browse-and-search.md)).

### Avatar upload flow

Same presigned-PUT pattern as listing images. On SettingsPage: click avatar → file picker → upload to S3 via presigned URL → call `PATCH /users/me { avatar_s3_key }` to commit. Shows preview during upload.

### Files to touch

- `frontend/src/modules/settings/pages/SettingsPage.tsx` — new.
- `frontend/src/modules/settings/components/{ProfileSection,PasswordSection,AvatarUploader}.tsx` — new.
- `frontend/src/modules/settings/services/profile.ts` — new.
- `frontend/src/modules/settings/hooks/{useUpdateProfile,useChangePassword,useUploadAvatar}.ts` — new.
- `frontend/src/modules/public-profile/pages/PublicProfilePage.tsx` — new.
- `frontend/src/modules/public-profile/services/profile.ts` — new.
- `frontend/src/modules/public-profile/hooks/{usePublicProfile,useUserListings}.ts` — new.
- [frontend/src/routes/index.tsx](../../frontend/src/routes/index.tsx) — register 2 routes.
- [frontend/src/modules/listings/components/SellerCard.tsx](../../frontend/src/modules/listings/components/SellerCard.tsx) — wrap the seller's name/avatar in a `Link` to `/utilizator/:id`.
- [frontend/src/components/layout/Navbar.tsx](../../frontend/src/components/layout/Navbar.tsx) — dropdown "Setări" link already in [user-dashboard.md](user-dashboard.md) now resolves to a real page.
- [frontend/public/locales/ro/common.json](../../frontend/public/locales/ro/common.json) — add `settings.*` and `publicProfile.*` keys.

### Reuse

- `FormField`, `SubmitButton`, `AuthCardShell` from [auth-complete.md](auth-complete.md).
- `ListingCard`, `Pagination`.
- Presigned-upload helpers from [image-upload.md](image-upload.md).
- `PhoneVerifyModal` from [phone-verification-stubbed.md](phone-verification-stubbed.md).

## Acceptance criteria

- [ ] Updating display name persists; new value appears in navbar + seller cards within one cache invalidation.
- [ ] Avatar upload shows a progress state; on success the new image replaces the old one.
- [ ] Password change validates current password (fails with 422 if wrong) and logs user out (forces re-login with new password) — OR keeps session valid; pick one and document. **Recommendation**: keep the session valid; don't log out.
- [ ] `/utilizator/:id` for a non-existent or self-hidden user returns a 404 page (not `ComingSoon`).
- [ ] The seller's listings grid paginates (12/page) and excludes inactive/expired listings.
- [ ] Clicking seller avatar on listing detail navigates to `/utilizator/:sellerId`.
- [ ] Changing avatar updates the seller avatar in messaging inbox previews and on any cached listing card (invalidate `['me']`, `['listings']`, `['conversations']`).

## Out of scope

- Public seller pages for unlisted / deleted users.
- Rich bio / "About" text fields on profile.
- Social links.
- Follow / subscribe buttons.
- Reviews & ratings.
- Identity verification upload (gov ID, etc.).
- Business/company profiles (post-MVP premium).
- Email change flow.

## Verification

- Manual:
  1. Log in, go to `/cont/setari`, change display name and avatar.
  2. Open a listing detail page; seller card shows updated name + avatar.
  3. Click avatar → `/utilizator/<id>` shows matching profile + active listings.
  4. Change password with correct current → success toast; log out and log back in with new password.
  5. Attempt password change with wrong current → 422 error.
- Automated:
  - Backend: tests for `update_profile` partial update (display_name only, avatar only, both).
  - Backend: password-change test (wrong current → 422; hash changes after success).
  - Integration: public profile endpoint hides inactive listings.
  - Frontend: SettingsPage mutation tests + optimistic UI.
