---
name: listing-edit-and-renewal
priority: 2
depends_on: [listing-creation-wizard.md]
area: listings
status: idea
---

# Listing edit + free renewal

## Context

[backend/src/repositories/listings.rs](../../backend/src/repositories/listings.rs) supports `create`, `find_by_id`, `list_by_user`, `delete`, `count_this_week` — **no `update`**. Business rules call for a 30-day auto-expiry with free manual renewal (see [docs/requirements-summary.md](../requirements-summary.md) + [docs/wiki/features/listing-lifecycle.md](../wiki/features/listing-lifecycle.md)). The user dashboard ([user-dashboard.md](user-dashboard.md)) consumes both endpoints — don't ship the dashboard without these.

This spec delivers: `PATCH /listings/:id` for owner edits, `POST /listings/:id/renew` to reset `expires_at`, and a frontend edit page (same wizard chrome in "edit" mode) + a "Reînnoiește" action on dashboard cards.

## User stories

- As a seller, I can edit any field of my active or expired listing (except photos — those use the image endpoints).
- As a seller, I can "Reînnoiește" an expiring or expired listing with one click to extend it another 30 days; no new post count against the weekly limit.
- As a seller, I can deactivate a listing without deleting it ("Pauzează"), and reactivate it later.
- As an admin (post-MVP), editing is auditable. (MVP: no audit.)

## Backend

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| PATCH | `/listings/:id` | yes, owner | Partial update. All fields optional. |
| POST | `/listings/:id/renew` | yes, owner | Sets `expires_at = NOW() + INTERVAL '30 days'`. No limit on how often it can be called but rate-limit to 1/hour per listing. |
| POST | `/listings/:id/deactivate` | yes, owner | `active = false`. |
| POST | `/listings/:id/activate` | yes, owner | `active = true` only if `expires_at > NOW()`. |

### Request body

```rust
// dto/listing.rs (add)

#[derive(Deserialize, Validate)]
pub struct UpdateListingRequest {
    #[validate(length(min = 5, max = 200))]
    pub title: Option<String>,
    #[validate(length(min = 10, max = 5000))]
    pub description: Option<String>,
    pub price_ron: Option<Option<i64>>,   // double Option: outer = "present in patch", inner = null → free
    pub is_negotiable: Option<bool>,
    #[validate(length(min = 1))]
    pub category: Option<String>,
    #[validate(length(min = 1))]
    pub city: Option<String>,
    pub active: Option<bool>,             // allows the wizard's publish step too
}
```

The double-Option (`Option<Option<T>>`) is the idiomatic way to represent "optional in patch, nullable in value". `serde` handles it when field is absent (outer `None`) vs explicitly `null` (outer `Some(None)`).

### Business rules

- **Owner check**: `PATCH/POST` routes verify `AuthUser.user_id == listing.user_id` before any mutation. 403 otherwise.
- **Edit doesn't reset expiry**: only `renew` touches `expires_at`.
- **Renewal rate limit**: once per hour per listing (`expires_at - INTERVAL '29 days 23 hours' > NOW()` means a renewal happened recently → 429). Prevents accidental spam.
- **Editing an expired listing**: allowed (user may be correcting typos before renewing); listing remains hidden from public until renewed.
- **Activate** returns 409 if listing is past `expires_at` — frontend should route such clicks to renew instead.

### SQL

```sql
-- update (partial): build dynamic SET clause server-side; or use COALESCE pattern
UPDATE listings
SET title          = COALESCE($2, title),
    description    = COALESCE($3, description),
    price_ron      = CASE WHEN $4 THEN $5 ELSE price_ron END,   -- flag for "price was in patch"
    is_negotiable  = COALESCE($6, is_negotiable),
    category       = COALESCE($7, category),
    city           = COALESCE($8, city),
    active         = COALESCE($9, active),
    updated_at     = NOW()
WHERE id = $1 AND user_id = $10
RETURNING *;

-- renew:
UPDATE listings SET expires_at = NOW() + INTERVAL '30 days', active = TRUE, updated_at = NOW()
WHERE id = $1 AND user_id = $2
RETURNING *;
```

The COALESCE pattern is simpler than dynamic SQL. The `$4/$5` pair handles the nullable-price case: `$4 = true` means "patch included price", then `$5` is the new value (possibly NULL).

### Files to touch

- [backend/src/routes/listings.rs](../../backend/src/routes/listings.rs) — add `.patch()`, `/renew`, `/deactivate`, `/activate`.
- `backend/src/handlers/listings.rs` — add 4 handlers.
- [backend/src/services/listings.rs](../../backend/src/services/listings.rs) — add `update`, `renew`, `set_active`.
- [backend/src/repositories/listings.rs](../../backend/src/repositories/listings.rs) — add `update`, `renew`, `set_active`.
- [backend/src/dto/listing.rs](../../backend/src/dto/listing.rs) — add `UpdateListingRequest`.

### Reuse

- Existing owner-check pattern from `delete` at [backend/src/repositories/listings.rs:59](../../backend/src/repositories/listings.rs#L59) — every write filters by `id = $1 AND user_id = $2`.
- `ListingResponse` for responses (unchanged).
- `AppError::{NotFound, Forbidden, RateLimit, Conflict}` variants already exist.

## Frontend

### Edit route

| Path | Component |
|---|---|
| `/anunturi/:id/editeaza` | `EditListingPage` — reuses the wizard's step components but starts pre-filled and lets the user jump directly between steps. |

Alternative: a single flat form (no wizard). Decision: **single flat form** is simpler for edits; wizard chrome is overkill when all data already exists. Reuse the step's form fields directly.

### Page layout

- Same header/footer.
- Single card with 4 sections: Detalii, Fotografii, Locație și preț, Status (active toggle, delete button).
- "Salvează modificările" at bottom (disabled unless dirty + valid).
- "Reînnoiește (+30 zile)" button visible when `expires_at < NOW() + INTERVAL '7 days'` (i.e. 7-day-before-expiry window). Shows remaining days.

### Dashboard integration (see [user-dashboard.md](user-dashboard.md))

Dashboard cards expose: Edit, Renew, Deactivate, Delete. The mutations live here:

```ts
// src/modules/listings/services/listings.ts
export async function updateListing(id: string, patch: UpdateListingRequest) { ... }
export async function renewListing(id: string) { ... }
export async function deactivateListing(id: string) { ... }
export async function activateListing(id: string) { ... }
export async function deleteListing(id: string) { ... }   // existing endpoint

// src/modules/listings/hooks/useListingMutations.ts
export function useListingMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['me', 'listings'] })
  return {
    update: useMutation({ mutationFn: (args: { id: string; patch: ... }) => updateListing(args.id, args.patch), onSuccess: invalidate }),
    renew: useMutation({ mutationFn: renewListing, onSuccess: invalidate }),
    deactivate: useMutation({ mutationFn: deactivateListing, onSuccess: invalidate }),
    activate: useMutation({ mutationFn: activateListing, onSuccess: invalidate }),
    remove: useMutation({ mutationFn: deleteListing, onSuccess: invalidate }),
  }
}
```

### Guards

- Only the owner can access `/anunturi/:id/editeaza`. If the GET `/listings/:id` response has `seller.id !== currentUser.id`, redirect to `/anunturi/:id` with a toast "Nu ai permisiunea să editezi acest anunț".

### Files to touch

- `frontend/src/modules/listings/pages/EditListingPage.tsx` — new.
- `frontend/src/modules/listings/services/listings.ts` — extend with the 5 functions above.
- `frontend/src/modules/listings/hooks/useListingMutations.ts` — new.
- `frontend/src/modules/listings/components/RenewButton.tsx` — new. Countdown of days until expiry + button.
- [frontend/src/routes/index.tsx](../../frontend/src/routes/index.tsx) — register `/anunturi/:id/editeaza`.
- [frontend/public/locales/ro/common.json](../../frontend/public/locales/ro/common.json) — add `edit.*`, `renew.*`, `status.active/paused/expired` keys.

### Reuse

- Image management via [image-upload.md](image-upload.md) endpoints — the edit page embeds the same `ImageGalleryEditor`.
- Zod schemas from [listing-creation-wizard.md](listing-creation-wizard.md).
- `axiosInstance`.

## Acceptance criteria

- [ ] Owner PATCH succeeds with a partial body; unchanged fields stay.
- [ ] Non-owner PATCH returns 403 with a clear error.
- [ ] Price can be set to `null` via explicit JSON null in the patch (listing becomes free).
- [ ] Renew extends `expires_at` by 30 days from now and sets `active = true` if the listing was expired.
- [ ] Calling renew twice within an hour returns 429.
- [ ] Renew does **not** count toward the weekly post limit.
- [ ] Deactivate hides the listing from public search but owner still sees it on dashboard.
- [ ] Activate fails with 409 if `expires_at < NOW()` — frontend prompts the user to renew instead.
- [ ] Delete still works (unchanged from current behavior).
- [ ] Edit page pre-fills all fields including image gallery.
- [ ] Submitting edits shows a toast "Anunț actualizat" and re-fetches listing detail.
- [ ] "Reînnoiește" button appears on the edit page and dashboard within the last 7 days before expiry.

## Out of scope

- Pro-rated or paid renewal (MVP is always free).
- Bulk renew.
- Versioned edits / audit log.
- Republishing expired listing with a new post (acts like a draft clone) — defer.
- Draft autosave during edit (post-MVP).

## Verification

- Manual:
  1. Create a listing, wait (or SQL-hack `expires_at`) to be within 7 days of expiry.
  2. Dashboard card shows "Reînnoiește (7 zile)".
  3. Click — `expires_at` jumps 30 days.
  4. Edit title, save, reload — change persists.
  5. Deactivate — public search no longer returns it; dashboard still does.
  6. Try renew twice in a minute — second call returns 429.
- Automated:
  - Service tests for partial update preserving unchanged fields (including price=NULL).
  - Owner-check test: impersonating user B gets 403 on user A's listing.
  - Renew rate-limit test.
  - Frontend: update mutation invalidates `['me', 'listings']` and `['listing', id]`.
