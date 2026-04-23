---
name: frontend-mock-data-everywhere
type: issue
severity: medium
area: frontend
status: open
fixed_by: ideas/public-browse-and-search.md, ideas/listing-detail-real-api.md
---

# All three implemented frontend pages render mock data — axios client is unused

## Problem

The frontend has a configured axios client ([frontend/src/lib/axios.ts](../../frontend/src/lib/axios.ts)) with Bearer-token injection and 401 redirect, a React Query client ([frontend/src/lib/queryClient.ts](../../frontend/src/lib/queryClient.ts)), and a Zustand auth store ([frontend/src/lib/auth.ts](../../frontend/src/lib/auth.ts)). None of these are used by real feature code.

Every displayed listing is hardcoded:

- [HomePage FEATURED_LISTINGS](../../frontend/src/modules/home/pages/HomePage.tsx#L19-L56) — 4 hand-written objects with Unsplash URLs.
- [CategoryPage via useCategoryListings](../../frontend/src/modules/categories/hooks/useCategoryListings.ts#L2) — calls `fetchMockListings` that reads from [data/mockListings.ts](../../frontend/src/modules/categories/data/mockListings.ts).
- [ListingDetailPage via useListingDetail](../../frontend/src/modules/listings/hooks/useListingDetail.ts#L2) — calls `fetchMockListingDetail` from [data/mockListing.ts](../../frontend/src/modules/listings/data/mockListing.ts).
- [MOCK_RELATED_LISTINGS](../../frontend/src/modules/listings/pages/ListingDetailPage.tsx#L11) — imported directly and rendered.

`grep -r 'axiosInstance' frontend/src/` returns **only** the definition in `lib/axios.ts` — nothing imports or uses it.

## Impact

- The app is effectively a Figma-accurate clickable prototype — the backend is bypassed entirely.
- Any backend change (new field, renamed endpoint, auth gate) has zero effect on the UI. Integration drift will be painful when real wiring lands.
- The 401-redirect at [lib/axios.ts:18](../../frontend/src/lib/axios.ts#L18) never fires because no logged-in code path exists in the frontend.
- Users posting listings via `curl` can't see them in the UI (search, browse, and detail are disconnected from DB state).
- CI has no end-to-end smoke test worth running.

## Repro

1. `cd backend && cargo run` (once migrations are in from [missing-migrations](missing-migrations.md)).
2. `curl -X POST /auth/register ...` → real user.
3. Create a listing via API.
4. Open the frontend and browse — your real listing is nowhere; the UI only shows the hardcoded mocks.

## Root cause

Intentional "mock-first design" approach while building the UI. The transition to real APIs wasn't scheduled, and the mock data paths were wired through React Query so the swap is mechanical, not structural.

## Recommended fix

Delivered by two specs:

1. [public-browse-and-search.md](../ideas/public-browse-and-search.md) — replaces HomePage featured listings + CategoryPage with real `/listings` + `/listings/featured` calls. Deletes `data/mockListings.ts`.
2. [listing-detail-real-api.md](../ideas/listing-detail-real-api.md) — replaces ListingDetailPage + RelatedListings with real `/listings/:id` + `/listings/:id/related` calls. Deletes `data/mockListing.ts`.

No separate fix required — this issue is resolved when those specs ship. Close-out criteria below.

## Affected files

Files the fix will modify or delete:

- [frontend/src/modules/home/pages/HomePage.tsx](../../frontend/src/modules/home/pages/HomePage.tsx) — remove hardcoded `FEATURED_LISTINGS` array, use hook.
- [frontend/src/modules/categories/data/mockListings.ts](../../frontend/src/modules/categories/data/mockListings.ts) — delete (constants move to `types/` or `constants/`).
- [frontend/src/modules/categories/hooks/useCategoryListings.ts](../../frontend/src/modules/categories/hooks/useCategoryListings.ts) — rewrite to real service.
- [frontend/src/modules/listings/data/mockListing.ts](../../frontend/src/modules/listings/data/mockListing.ts) — delete.
- [frontend/src/modules/listings/hooks/useListingDetail.ts](../../frontend/src/modules/listings/hooks/useListingDetail.ts) — rewrite to real service.
- [frontend/src/modules/listings/pages/ListingDetailPage.tsx](../../frontend/src/modules/listings/pages/ListingDetailPage.tsx) — remove `MOCK_RELATED_LISTINGS` import/usage.

Files introduced for real wiring (see the specs):

- `frontend/src/modules/categories/services/listings.ts`
- `frontend/src/modules/listings/services/listings.ts`
- `frontend/src/modules/home/hooks/useFeaturedListings.ts`

## Verification after fix

- `grep -r 'fetchMock\|MOCK_\|mockListing\|mockListings' frontend/src/` returns no matches.
- `grep -r 'axiosInstance' frontend/src/` finds multiple real feature imports.
- Seeding a listing via API and reloading the FE shows it on HomePage/CategoryPage/detail.
- Revoking a token (e.g. deleting `auth_token` from localStorage while browsing a gated page) triggers the 401 interceptor and redirects to `/autentificare` (no longer dormant).

## Related

- This issue's close-out unblocks meaningful e2e smoke tests (Playwright / Cypress).
- Depends on [missing-migrations.md](missing-migrations.md) being fixed so the backend actually works.
