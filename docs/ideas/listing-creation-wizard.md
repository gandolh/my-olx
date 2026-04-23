---
name: listing-creation-wizard
priority: 1
depends_on: [auth-complete.md, image-upload.md]
area: listings
status: idea
---

# 5-step listing creation wizard (`/adauga-anunt`)

## Context

[Navbar "Adaugă Anunț" button](../../frontend/src/components/layout/Navbar.tsx#L40-L45) and HomePage CTA link to `/adauga-anunt`, which doesn't exist → [`ComingSoon`](../../frontend/src/components/ui/ComingSoon.tsx). Backend `POST /listings/` already accepts `{title, description, price_ron, is_negotiable, category, city}` ([backend/src/dto/listing.rs](../../backend/src/dto/listing.rs)) and enforces the 5/week limit at [backend/src/services/listings.rs:10](../../backend/src/services/listings.rs#L10). The business rule in [docs/requirements-summary.md] is `< 3 min to create first listing on mobile`.

This spec delivers the `/adauga-anunt` route: a 5-step wizard (category → details → photos → location+price → review), reusing the existing POST endpoint and the image upload flow from [image-upload.md](image-upload.md). Creation happens as a **draft** first, then photos attach, then the review step publishes (flips `active = true`).

## User stories

- As a logged-in, email-verified seller, I can post a listing end-to-end in under 3 minutes on mobile.
- As a seller, I can save a draft at any step and resume later.
- As a seller, step-by-step validation prevents me from moving forward with invalid fields.
- As a seller, I can upload and reorder photos before publishing.
- As a seller hitting the 5/week limit, I see a clear Romanian message with my post count + reset time.
- As a non-email-verified user, I'm blocked at the wizard entry with a "verifică-ți emailul" screen + resend button.

## Backend

### Endpoints

The wizard can function on top of existing endpoints + images API with **minor** additions:

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/listings/` | yes | **Existing** — extend to accept `active: Option<bool>` (default `true`). If `false`, the listing is saved as a draft (not returned from public search). |
| PATCH | `/listings/:id` | yes, owner | **Delivered by [listing-edit-and-renewal.md](listing-edit-and-renewal.md)** — wizard uses this to update the draft as the user progresses. |
| POST | `/listings/:id/publish` | yes, owner | Flips `active = true`, validates images count ≥ 1, returns the final listing. Optional: skip this and just send `PATCH {"active": true}` via the edit endpoint. Spec **recommends** adding an explicit `publish` endpoint for clarity + future side-effects (e.g. indexing, notifications). |
| GET | `/listings/my-drafts` | yes | Returns listings where `user_id = me AND active = false`. Small convenience for resuming. Alternative: reuse `GET /me/listings` with an `active=false` filter. Pick one; spec prefers a query param on `/me/listings`. |

### Business rules

- Wizard creates a draft on step 1 completion (category chosen). Subsequent steps PATCH.
- Publish is gated on:
  - `email_verified = true` (handled by the existing 403 from [auth-complete.md](auth-complete.md)).
  - At least 1 image attached.
  - Valid title (≥ 5 chars, ≤ 200), description (≥ 10 chars), category, city.
  - Weekly post limit: counted only at `publish` time, not at draft creation. Update [backend/src/services/listings.rs:22](../../backend/src/services/listings.rs#L22) so `count_this_week` excludes drafts:
    ```sql
    SELECT COUNT(*) FROM listings
    WHERE user_id = $1 AND active = TRUE
      AND created_at >= NOW() - INTERVAL '7 days'
    ```
- Draft auto-cleanup: a scheduled job or periodic query deletes drafts older than 7 days. **Defer** to post-MVP; acceptable MVP behavior is drafts live forever.

### Files to touch

- [backend/src/routes/listings.rs](../../backend/src/routes/listings.rs) — add `/publish` route + (optional) `/my-drafts` or query param on `/me/listings`.
- `backend/src/handlers/listings.rs` — add `publish_listing`.
- [backend/src/services/listings.rs](../../backend/src/services/listings.rs) — add `publish(id, owner_id)` that runs validation + flips `active`. Adjust `count_this_week` to `active = TRUE`.
- [backend/src/repositories/listings.rs](../../backend/src/repositories/listings.rs) — add `publish(id, owner_id)` and adjust `count_this_week` query.
- [backend/src/dto/listing.rs](../../backend/src/dto/listing.rs) — add `active: Option<bool>` to `CreateListingRequest` or introduce a separate `CreateDraftRequest`. Prefer the Option on the existing DTO for minimal surface.

### Reuse

- `POST /listings/` handler skeleton at [backend/src/handlers/listings.rs:17](../../backend/src/handlers/listings.rs#L17).
- `ListingService::create` + `WEEKLY_POST_LIMIT = 5` at [services/listings.rs:10](../../backend/src/services/listings.rs#L10).
- Image upload from [image-upload.md](image-upload.md) — `POST /listings/:id/images/upload-url` takes the draft's `id`.
- `AuthUser`, `AppError`.

## Frontend

### Route

| Path | Component |
|---|---|
| `/adauga-anunt` | `CreateListingPage` wrapping a step machine. |
| `/adauga-anunt/:draftId` | Same component; resumes an existing draft. |

Guard the route:
- Not logged in → redirect to `/autentificare?next=/adauga-anunt`.
- Logged in but `email_verified = false` → render an inline "Verifică-ți emailul" panel with resend button (don't redirect).

### Step model

Use a state machine (simple `useState<Step>` + typed context is fine; or `xstate` if the team prefers). Steps:

1. **Categorie** — 9 big tiles matching the homepage design. Selecting advances.
2. **Detalii** — title input, description textarea (char counter), `is_negotiable` toggle.
3. **Fotografii** — drop-in `ImageUploader` from [image-upload.md](image-upload.md). Minimum 1 required to publish. At least 3 "recommended" badge. Reorder + delete here.
4. **Locație și preț** — city picker (autocomplete on `CITIES` from [frontend/src/modules/categories/types/index.ts:31](../../frontend/src/modules/categories/types/index.ts#L31)), price input (RON, integer, allow `null` = "Gratuit" toggle).
5. **Verifică și publică** — read-only preview exactly as the detail page will render, with "Înapoi" / "Publică anunțul" buttons.

### State transitions

- Step 1 → on category select: `POST /listings/` with `{category, active: false, placeholder title/desc/city/price}`. Store `draftId` in URL (`navigate('/adauga-anunt/<id>')`) and in React Query cache.
- Step 2 → on "Continuă" with valid fields: `PATCH /listings/:id {title, description, is_negotiable}`.
- Step 3 → images save via their own endpoints (commit each after S3 PUT).
- Step 4 → `PATCH /listings/:id {city, price_ron}`.
- Step 5 → `POST /listings/:id/publish`. On success: React Query invalidates `['me', 'listings']`, `['listings', ...]`; redirect to `/anunturi/<id>`.

### Zod schemas

```ts
// src/modules/create-listing/schemas.ts
import { z } from 'zod'

const CATEGORY_SLUGS = [
  'electronice','auto','imobiliare','casa-gradina','moda',
  'joburi','servicii','sport','gratuit',
] as const

export const categoryStepSchema = z.object({
  category: z.enum(CATEGORY_SLUGS, { message: 'Alege o categorie' }),
})

export const detailsStepSchema = z.object({
  title: z.string().min(5, 'Minimum 5 caractere').max(200, 'Maximum 200 caractere'),
  description: z.string().min(10, 'Minimum 10 caractere').max(5000, 'Maximum 5000 caractere'),
  is_negotiable: z.boolean(),
})

export const locationPriceStepSchema = z.object({
  city: z.string().min(1, 'Selectează un oraș'),
  price_ron: z.number().int().positive('Preț invalid').nullable(),
})
```

The photos step has no zod schema (images are managed imperatively); the wizard tracks `imagesCount` in state and blocks publishing when `imagesCount < 1`.

### Services + hooks

```ts
// src/modules/create-listing/services/drafts.ts
export async function createDraft(category: string)
export async function updateDraft(id: string, patch: Partial<...>)
export async function publishDraft(id: string)
export async function fetchMyDrafts()   // optional; for "Continue draft" prompt

// src/modules/create-listing/hooks/
useCreateDraftMutation()
useUpdateDraftMutation()
usePublishDraftMutation()
useDraft(id)   // GET /listings/:id for resume
```

### Files to touch

- `frontend/src/modules/create-listing/pages/CreateListingPage.tsx` — new (≈200 LOC, wizard shell).
- `frontend/src/modules/create-listing/steps/{Category,Details,Photos,LocationPrice,Review}Step.tsx` — new.
- `frontend/src/modules/create-listing/schemas.ts` — new (see above).
- `frontend/src/modules/create-listing/services/drafts.ts` — new.
- `frontend/src/modules/create-listing/hooks/*.ts` — new.
- `frontend/src/modules/create-listing/components/{WizardProgress,StepFooter,CityAutocomplete,PriceInput}.tsx` — new.
- [frontend/src/routes/index.tsx](../../frontend/src/routes/index.tsx) — register `/adauga-anunt` and `/adauga-anunt/:draftId` (lazy).
- [frontend/public/locales/ro/common.json](../../frontend/public/locales/ro/common.json) — add `createListing.*` namespace (step titles, labels, placeholder text, validation messages, review-step copy, post-success toast, limit-exceeded message).
- [frontend/src/components/layout/Navbar.tsx](../../frontend/src/components/layout/Navbar.tsx#L40) — Navbar link is already correct; just make sure redirect-to-auth works when the user isn't logged in.

### Existing reuse

- `ImageUploader` + `ImageGalleryEditor` from [image-upload.md](image-upload.md).
- `CITIES` constant from [categories/types/index.ts:31](../../frontend/src/modules/categories/types/index.ts#L31) — move to `src/shared/constants/cities.ts` if repeated.
- Design tokens + `PricingCard` layout from [ListingDetailPage](../../frontend/src/modules/listings/pages/ListingDetailPage.tsx) for the review step's preview (can reuse components).
- `react-hook-form` + `zod` + `@hookform/resolvers` (needs install: `npm i @hookform/resolvers`).
- `axiosInstance` for API calls.

## Acceptance criteria

- [ ] `/adauga-anunt` renders the 5-step wizard when logged in + email verified.
- [ ] Step 1 tile-select creates a draft and updates the URL to `/adauga-anunt/<id>`.
- [ ] Reloading the page after step 2 resumes at the latest valid step.
- [ ] Validation blocks advancing with visible Romanian error messages.
- [ ] Photo step enforces 1–10 photos, shows previews, allows reorder + delete.
- [ ] Review step preview matches the final `/anunturi/<id>` layout (no surprise).
- [ ] "Publică" calls publish endpoint; on success navigates to `/anunturi/<id>`.
- [ ] 6th listing in 7 days shows a clear "Ai atins limita de 5 anunțuri pe săptămână" message with post count + reset date.
- [ ] Unverified email shows an inline gate with "Retrimite emailul".
- [ ] Unauthenticated visit redirects to `/autentificare?next=/adauga-anunt` and returns after login.
- [ ] Mobile usability: buttons tap-sized (44x44 min), step footer fixed, no horizontal scroll on 360px width.
- [ ] Full flow measured at < 3 minutes for the target user (stopwatch check).
- [ ] No console errors on happy-path publish.

## Out of scope

- Category-specific custom fields (e.g. car make/model, apartment floorspace). MVP is one free-text description. Structured fields post-MVP.
- Autosave without explicit "Continuă" clicks.
- Drag-and-drop reorder of steps (steps are linear).
- Bulk upload / CSV listing import.
- AI-assisted description or auto-category suggestion.
- Scheduled publishing.

## Verification

- Manual: time the full flow on a 360px-wide viewport using the dev tools device emulation. End-to-end target < 3 min.
- Automated:
  - Unit: each zod schema.
  - Frontend integration: Playwright or Cypress test that completes the wizard against a mocked API (MSW).
  - Backend: `services/listings.rs::tests` for `publish()` validation (no images → error; email unverified → error; exceeds weekly limit → RateLimit).
  - Backend integration: end-to-end "register → verify email → create draft → upload image → patch → publish → GET public detail".
