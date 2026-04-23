---
name: favorites
priority: 2
depends_on: [listing-detail-real-api.md]
area: listings
status: idea
---

# Favorites (save listings for later)

## Context

The [Navbar "Favorite" link](../../frontend/src/components/layout/Navbar.tsx#L17) and the `/favorite` route both exist in the UI but resolve to [`ComingSoon`](../../frontend/src/components/ui/ComingSoon.tsx). No heart icon anywhere on `ListingCard` or the listing detail page. Zero backend endpoints.

This spec adds the `favorites` table (already in [migrations-and-schema.md](migrations-and-schema.md)), CRUD endpoints, a heart toggle on cards and detail pages, and the `/favorite` page listing saved items.

## User stories

- As a logged-in visitor, I can heart any listing and see it added to my Favorites.
- As a logged-in visitor, I can remove a listing from Favorites from the heart toggle or the Favorites page.
- As a logged-in visitor, on my `/favorite` page I see the full cards of my saved listings.
- As a not-logged-in visitor, clicking a heart redirects me to log in, then completes the action.
- As a logged-in visitor, listings I've hearted show a filled heart wherever they appear in the UI.

## Backend

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/favorites/:listing_id` | yes | Insert row; idempotent (ON CONFLICT DO NOTHING). Returns 201 or 200. |
| DELETE | `/favorites/:listing_id` | yes | Remove row; idempotent (returns 204 even if not present). |
| GET | `/me/favorites` | yes | Paginated list of saved listings. Response shape = [`ListingsPageResponse`](public-browse-and-search.md). |
| GET | `/me/favorites/ids` | yes | Small response: `{ "ids": ["<uuid>", ...] }`. Used by the frontend to render filled hearts on cards without a full listings fetch. |

### Files to touch

- `backend/src/routes/favorites.rs` — new.
- `backend/src/handlers/favorites.rs` — new.
- `backend/src/services/favorites.rs` — new.
- `backend/src/repositories/favorites.rs` — new. `add(user_id, listing_id)`, `remove(user_id, listing_id)`, `list_ids(user_id)`, `list(user_id, page, per_page) -> (rows, total)`.
- [backend/src/router.rs](../../backend/src/router.rs) — mount `/favorites` and `/me/favorites`.

### SQL

```sql
-- add:
INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2)
ON CONFLICT (user_id, listing_id) DO NOTHING;

-- remove:
DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2;

-- list_ids:
SELECT listing_id FROM favorites WHERE user_id = $1;

-- list (paginated, joined):
SELECT l.*, u.phone_verified AS seller_verified,
       (SELECT li.s3_key FROM listing_images li WHERE li.listing_id = l.id ORDER BY li.position LIMIT 1) AS cover_key
FROM favorites f
JOIN listings l ON l.id = f.listing_id
JOIN users u ON u.id = l.user_id
WHERE f.user_id = $1
ORDER BY f.created_at DESC
LIMIT $2 OFFSET $3;
```

Note: favorites can point to inactive/expired listings (the user saved them when active). Show those with an "Expirat" badge; don't 404 or remove.

### Reuse

- `AuthUser`, `AppError`.
- The `favorites` table migration (already in [migrations-and-schema.md](migrations-and-schema.md)).
- `ListingCardResponse` shape from [public-browse-and-search.md](public-browse-and-search.md).

## Frontend

### Route

| Path | Component |
|---|---|
| `/favorite` | `FavoritesPage` — grid of `ListingCard`, paginated, with empty-state CTA to browse categories. |

### Heart toggle component

`FavoriteToggle` — a floating icon button placed on `ListingCard` (top-right) and inside `PricingCard` on the detail page. Two states: outline heart (not favorited) and filled heart (favorited). Animates on click.

Behavior:
- **Not logged in**: click → redirect to `/autentificare?next=<current-path>`. Show a toast "Conectează-te pentru a salva anunțuri".
- **Logged in, not favorited**: optimistic flip, call `POST /favorites/:id`. On error, revert + toast.
- **Logged in, favorited**: optimistic flip, call `DELETE /favorites/:id`. On error, revert + toast.

### Global favorites state

One React Query for `/me/favorites/ids`:

```ts
// src/modules/favorites/hooks/useFavoriteIds.ts
export function useFavoriteIds() {
  const isAuthed = useAuth((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['favorites', 'ids'],
    queryFn: async () => (await axiosInstance.get('/me/favorites/ids')).data.ids as string[],
    enabled: isAuthed,
    staleTime: 60_000,
  })
}

export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, on }: { id: string; on: boolean }) => {
      if (on) await axiosInstance.post(`/favorites/${id}`)
      else await axiosInstance.delete(`/favorites/${id}`)
    },
    onMutate: async ({ id, on }) => {
      await qc.cancelQueries({ queryKey: ['favorites', 'ids'] })
      const prev = qc.getQueryData<string[]>(['favorites', 'ids']) ?? []
      qc.setQueryData<string[]>(['favorites', 'ids'], on ? [...prev, id] : prev.filter((x) => x !== id))
      return { prev }
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(['favorites', 'ids'], ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  })
}
```

`ListingCard` uses `useFavoriteIds().data?.includes(listing.id)` to pick the icon state.

### Files to touch

- `frontend/src/modules/favorites/pages/FavoritesPage.tsx` — new.
- `frontend/src/modules/favorites/services/favorites.ts` — new.
- `frontend/src/modules/favorites/hooks/{useFavoriteIds,useToggleFavorite,useFavoritesPage}.ts` — new.
- `frontend/src/modules/favorites/components/FavoriteToggle.tsx` — new.
- [frontend/src/modules/home/components/ListingCard.tsx](../../frontend/src/modules/home/components/ListingCard.tsx) — add `<FavoriteToggle>` overlay in top-right corner.
- [frontend/src/modules/listings/components/PricingCard.tsx](../../frontend/src/modules/listings/components/PricingCard.tsx) — add `<FavoriteToggle>` inline.
- [frontend/src/routes/index.tsx](../../frontend/src/routes/index.tsx) — register `/favorite`.
- [frontend/src/components/layout/Navbar.tsx](../../frontend/src/components/layout/Navbar.tsx) — when logged in, add a count bubble next to "Favorite" using `useFavoriteIds().data?.length`.
- [frontend/public/locales/ro/common.json](../../frontend/public/locales/ro/common.json) — add `favorites.*` keys (empty state, toast messages, count label).

### Reuse

- `ListingCard`, `Pagination`, `Skeleton`, `ErrorCard`.
- `axiosInstance`.
- Existing [react-query client defaults (`retry: 1`)](../../frontend/src/lib/queryClient.ts#L7).

## Acceptance criteria

- [ ] Hearting from `ListingCard` optimistically flips icon and persists on reload.
- [ ] Double-click / rapid toggle works without race conditions (optimistic + invalidate).
- [ ] Unhearting on `/favorite` removes the card from the page without a full reload.
- [ ] 401 during toggle (expired token) triggers the existing axios redirect to `/autentificare`.
- [ ] `/favorite` page paginates (12/page) and shows an empty state with "Explorează categoriile" link when empty.
- [ ] A favorite whose listing becomes expired still renders with "Expirat" badge.
- [ ] Deleting a listing cascades via FK `ON DELETE CASCADE` and the favorite entry vanishes.
- [ ] Navbar shows count `(N)` next to "Favorite" when N > 0.
- [ ] Anonymous heart click redirects to login and the original action does **not** auto-complete on return (acceptable MVP; note in docs).

## Out of scope

- Auto-complete favoriting after login redirect (requires carrying intent through auth flow; post-MVP).
- Notifications when a favorited listing drops in price.
- Folders / tags for organizing favorites.
- Sharing favorite lists.

## Verification

- Manual:
  1. Log in, heart 5 listings from the homepage + category page.
  2. Visit `/favorite` — see all 5.
  3. Un-heart one from the detail page — count drops, card disappears.
  4. Log out → navbar count vanishes; hearts hidden or tapping redirects to login.
- Automated:
  - Backend: tests for idempotent add/remove, pagination, cascade on listing delete.
  - Frontend: unit test the optimistic mutation + revert path.
  - Frontend: snapshot of `/favorite` empty state + full state (MSW).
