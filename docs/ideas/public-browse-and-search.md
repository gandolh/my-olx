---
name: public-browse-and-search
priority: 1
depends_on: [migrations-and-schema.md]
area: search
status: idea
---

# Public listings browse + search (Postgres FTS)

## Context

Backend has no public listings endpoint. [backend/src/routes/listings.rs](../../backend/src/routes/listings.rs) exposes only owner-scoped routes (`GET /listings/` = *my* listings). The frontend simulates discovery through two mock functions — [frontend/src/modules/categories/data/mockListings.ts](../../frontend/src/modules/categories/data/mockListings.ts) (used by [CategoryPage](../../frontend/src/modules/categories/pages/CategoryPage.tsx#L32)) and hardcoded `FEATURED_LISTINGS` at [frontend/src/modules/home/pages/HomePage.tsx:19](../../frontend/src/modules/home/pages/HomePage.tsx#L19). HomePage's search form at [L64-L70](../../frontend/src/modules/home/pages/HomePage.tsx#L64-L70) navigates to `/anunturi?q=...&loc=...`, which isn't a defined route.

This spec delivers: public `GET /listings`, Postgres FTS + unaccent powering `q`, a featured listings endpoint, and rewires HomePage + CategoryPage to the real API. Also adds the missing `/anunturi` (search results) and `/categorii` (category index) routes.

Related bugs closed by this: [docs/issues/frontend-mock-data-everywhere.md](../issues/frontend-mock-data-everywhere.md), partially [docs/issues/broken-nav-links.md](../issues/broken-nav-links.md).

## User stories

- As a visitor, I can browse all active listings at `/categorii/:slug` without logging in.
- As a visitor, I can free-text search "telefon samsung" and get relevance-ranked results, matching `Telefon Samsung`, `samsung telefoane`, and `Telefoane Samsung refurbished`.
- As a visitor, searching with diacritics (`Timișoara`) matches listings typed without (`Timisoara`) and vice-versa.
- As a visitor, I can filter by city, category, price range, date, "verificat" seller flag, and sort by newest/price-asc/price-desc/relevance.
- As a visitor, the homepage shows 4–8 fresh, real listings in the "Anunțuri Recomandate" section.

## Backend

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/listings` | **no** (public) | List active listings with filters + search + pagination. |
| GET | `/listings/featured` | **no** | Recent, non-expired, preferring verified sellers. 8 max. |

Note: `/listings/` (existing — owner-scoped) moves to `GET /me/listings` (or similar) to free the public path. Document the rename in the PR. Alternative: keep `/listings` as public and move owner-scoped list to `/listings/mine`. **Preferred:** `GET /listings` = public, `GET /me/listings` = owner — cleaner REST semantics.

### Query parameters

| Param | Type | Notes |
|---|---|---|
| `q` | string | Full-text search across title + description. |
| `category` | string | Slug. Match slugs from [CATEGORIES in HomePage](../../frontend/src/modules/home/pages/HomePage.tsx#L7) (`electronice`, `auto`, `imobiliare`, `casa-gradina`, `moda`, `joburi`, `servicii`, `sport`, `gratuit`). |
| `city` | string | Slug. Accepts both slugs and diacritic names. |
| `price_min` | int | RON. |
| `price_max` | int | RON. |
| `date` | enum | `24h` \| `saptamana` \| `oricand` (default). |
| `verified` | bool | `true` → only sellers with `phone_verified = true` (email verified is always required to post, see [auth-complete.md](auth-complete.md)). |
| `sort` | enum | `noi` (default, DESC by created_at) \| `pret_asc` \| `pret_desc` \| `relevanta` (only meaningful when `q` present). |
| `page` | int | 1-indexed. Default 1. |
| `per_page` | int | Default 12 (matches frontend `PAGE_SIZE`). Max 50. |

### SQL

Base query (Postgres):

```sql
SELECT l.*, u.phone_verified AS seller_verified,
       (SELECT url FROM listing_images WHERE listing_id = l.id ORDER BY position ASC LIMIT 1) AS cover_url,
       ts_rank(l.search_tsv, plainto_tsquery('simple', unaccent($1))) AS rank
FROM listings l
JOIN users u ON u.id = l.user_id
WHERE l.active = TRUE
  AND l.expires_at > NOW()
  AND ($1 = '' OR l.search_tsv @@ plainto_tsquery('simple', unaccent($1)))
  AND ($2::text IS NULL OR l.category = $2)
  AND ($3::text IS NULL OR l.city = $3 OR unaccent(l.city) = unaccent($3))
  AND ($4::bigint IS NULL OR l.price_ron >= $4)
  AND ($5::bigint IS NULL OR l.price_ron <= $5)
  AND ($6::timestamptz IS NULL OR l.created_at >= $6)
  AND ($7::bool = FALSE OR u.phone_verified = TRUE)
ORDER BY
  CASE WHEN $8 = 'relevanta' AND $1 <> '' THEN ts_rank(l.search_tsv, plainto_tsquery('simple', unaccent($1))) END DESC NULLS LAST,
  CASE WHEN $8 = 'pret_asc' THEN l.price_ron END ASC NULLS LAST,
  CASE WHEN $8 = 'pret_desc' THEN l.price_ron END DESC NULLS LAST,
  l.created_at DESC
LIMIT $9 OFFSET $10;
```

Count for pagination: same `WHERE` without `ORDER BY`/`LIMIT`. Can reuse by wrapping the query or doing a second query (fine for MVP).

### Response shape

```rust
// dto/listing.rs (add to existing file)
#[derive(Serialize)]
pub struct ListingCardResponse {
    pub id: Uuid,
    pub title: String,
    pub price_ron: Option<i64>,
    pub city: String,
    pub category: String,
    pub cover_url: Option<String>,
    pub seller_verified: bool,
    pub posted_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct ListingsPageResponse {
    pub listings: Vec<ListingCardResponse>,
    pub total_count: i64,
    pub total_pages: i64,
    pub page: i64,
}
```

`/listings/featured` returns `Vec<ListingCardResponse>` — same shape, no pagination envelope.

### Files to touch

- [backend/src/routes/listings.rs](../../backend/src/routes/listings.rs) — add public routes; move owner list to new router or keep under `/me/listings` (add a `routes/me.rs` module).
- [backend/src/router.rs](../../backend/src/router.rs) — mount `/me` if introduced.
- `backend/src/handlers/listings.rs` — add `list_public`, `list_featured`. Keep `list_my_listings`, `create_listing`, `delete_listing`.
- [backend/src/services/listings.rs](../../backend/src/services/listings.rs) — add `search(filters: ListingFilters) -> ListingsPageResponse`.
- [backend/src/repositories/listings.rs](../../backend/src/repositories/listings.rs) — add `search(&self, filters: &ListingFilters) -> Result<(Vec<ListingRow>, i64), AppError>` where `ListingRow` is a wider sqlx::FromRow struct including `seller_verified` and `cover_url`.
- `backend/src/dto/listing.rs` — add `ListingFilters`, `ListingCardResponse`, `ListingsPageResponse`, `FeaturedListingsResponse`.
- [backend/migrations/](../../backend/migrations/) — schema already provides `search_tsv` + indexes via [migrations-and-schema.md](migrations-and-schema.md).

### Reuse

- Existing `ListingRepository` trait — extend, don't replace.
- Existing `AppError` + validation helpers.
- [backend/src/dto/listing.rs](../../backend/src/dto/listing.rs) — keep `CreateListingRequest`, add new response types.

## Frontend

### New routes

| Path | Component | Notes |
|---|---|---|
| `/categorii` | `CategoryIndexPage` | Grid of all 9 categories, matches the design in [HomePage categories section](../../frontend/src/modules/home/pages/HomePage.tsx#L123). |
| `/anunturi` | `SearchResultsPage` | Same layout as CategoryPage but driven by `?q=...&city=...` query string, no `:slug`. |

Existing `/categorii/:slug` keeps working — rewired to real API.

### Rewire CategoryPage

Today: [frontend/src/modules/categories/hooks/useCategoryListings.ts](../../frontend/src/modules/categories/hooks/useCategoryListings.ts) calls `fetchMockListings`. Replace with a real service:

```ts
// src/modules/categories/services/listings.ts
import { axiosInstance } from '@/lib/axios'
import type { FilterState } from '../types'

export async function searchListings(params: {
  category?: string
  q?: string
  filters: FilterState
}) {
  const search: Record<string, string | number | boolean> = {}
  if (params.category) search.category = params.category
  if (params.q) search.q = params.q
  if (params.filters.loc) search.city = params.filters.loc
  if (params.filters.pret_min != null) search.price_min = params.filters.pret_min
  if (params.filters.pret_max != null) search.price_max = params.filters.pret_max
  if (params.filters.data !== 'oricand') search.date = params.filters.data
  if (params.filters.verificat) search.verified = true
  if (params.filters.sortare !== 'noi') search.sort = params.filters.sortare
  search.page = params.filters.pagina
  const res = await axiosInstance.get('/listings', { params: search })
  return res.data  // ListingsPageResponse
}
```

Adapt [useCategoryListings](../../frontend/src/modules/categories/hooks/useCategoryListings.ts) to call `searchListings({ category: slug, filters })`. Keep the `ListingsResponse` shape in [types/index.ts](../../frontend/src/modules/categories/types/index.ts) or map backend's `snake_case` to frontend's existing field names in the service layer.

### HomePage featured listings

Replace the hardcoded `FEATURED_LISTINGS` array at [HomePage.tsx:19-56](../../frontend/src/modules/home/pages/HomePage.tsx#L19-L56) with a React Query hook:

```ts
// src/modules/home/hooks/useFeaturedListings.ts
export function useFeaturedListings() {
  return useQuery({
    queryKey: ['featured-listings'],
    queryFn: async () => (await axiosInstance.get('/listings/featured')).data,
    staleTime: 60_000,
  })
}
```

Render skeleton during load. On error, fall back to empty grid with a retry.

### New SearchResultsPage

Structurally identical to CategoryPage: same `FilterSidebar`, `SortBar`, `ListingGrid`, `Pagination`, but no `CategoryHeader` (instead a "Rezultate pentru '<q>'" heading). Accepts all the same URL params. Reuse the new `useCategoryListings` hook by passing `category: undefined, q: searchParams.get('q')`.

### New CategoryIndexPage

Simple static page: hero + 9 category tiles. Reuse the grid markup from HomePage. Each tile links to `/categorii/<slug>`. Translations already exist for labels.

### Files to touch

- `frontend/src/modules/categories/services/listings.ts` — new.
- [frontend/src/modules/categories/hooks/useCategoryListings.ts](../../frontend/src/modules/categories/hooks/useCategoryListings.ts) — rewrite to call the new service.
- `frontend/src/modules/search/pages/SearchResultsPage.tsx` — new module.
- `frontend/src/modules/categories/pages/CategoryIndexPage.tsx` — new.
- `frontend/src/modules/home/hooks/useFeaturedListings.ts` — new.
- [frontend/src/modules/home/pages/HomePage.tsx](../../frontend/src/modules/home/pages/HomePage.tsx#L19-L56) — replace hardcoded array; use hook + skeleton.
- [frontend/src/routes/index.tsx](../../frontend/src/routes/index.tsx) — register `/categorii` and `/anunturi`.
- [frontend/src/modules/categories/data/mockListings.ts](../../frontend/src/modules/categories/data/mockListings.ts) — delete once search works (keep an export of `PAGE_SIZE` / `CITIES` / `CATEGORY_LABELS` if still referenced; move those to `types/` or `constants/`).
- [frontend/src/modules/listings/data/mockListing.ts](../../frontend/src/modules/listings/data/mockListing.ts) — left alone by *this* spec; [listing-detail-real-api.md](listing-detail-real-api.md) removes it.
- [frontend/public/locales/ro/common.json](../../frontend/public/locales/ro/common.json) — add `search.*` keys (results title, no-results message, filter names).

### Existing reuse

- [`FilterSidebar`](../../frontend/src/modules/categories/components/FilterSidebar.tsx), [`SortBar`](../../frontend/src/modules/categories/components/SortBar.tsx), [`ListingGrid`](../../frontend/src/modules/categories/components/ListingGrid.tsx), [`Pagination`](../../frontend/src/modules/categories/components/Pagination.tsx), [`CategoryHeader`](../../frontend/src/modules/categories/components/CategoryHeader.tsx) — drop-in.
- `ListingCard` from [home module](../../frontend/src/modules/home/components/ListingCard.tsx) — already renders `MockListing`. Adapt props or introduce a minimal `CardListing` type that both real and (remaining) mock data share. Prefer adapting once, removing the mock type, and centralizing in `frontend/src/types/listing.ts`.

## Acceptance criteria

- [ ] `GET /listings` (no params) returns up to 12 newest active listings with pagination envelope.
- [ ] `GET /listings?q=timisoara` matches listings whose city or description contains `Timișoara`.
- [ ] `GET /listings?category=auto&city=bucuresti&price_min=10000&price_max=50000` filters correctly.
- [ ] `GET /listings?q=samsung&sort=relevanta` ranks better-matching listings higher.
- [ ] `GET /listings?page=3&per_page=24` paginates correctly; `page` beyond last returns empty array with proper `total_pages`.
- [ ] `GET /listings/featured` returns ≤ 8 listings prioritizing `seller_verified = true`.
- [ ] HomePage renders live featured listings; loading state uses skeletons matching current design.
- [ ] CategoryPage filters, sorts, and paginates against the real API; URL-reflecting filter state still works.
- [ ] `/categorii` renders all 9 category tiles.
- [ ] `/anunturi?q=laptop` loads the SearchResultsPage and shows real results.
- [ ] No references to `fetchMockListings` remain in the frontend (verify with `grep`).
- [ ] All Romanian filter/sort labels render with correct diacritics.

## Out of scope

- Search typo tolerance / fuzzy match (`pg_trgm` is installed but MVP uses `plainto_tsquery` only). Upgrade post-MVP.
- Autocomplete / search suggestions.
- Saved searches with notifications.
- Elasticsearch migration (future upgrade; treat the service layer as the seam).
- Category-specific custom filters (e.g. auto transmission type). Ship generic filters first.
- Distance-based sort (requires geocoding).

## Verification

- Manual:
  1. Seed 30+ listings across categories/cities (add a seed script or insert by hand).
  2. `curl 'http://localhost:8080/listings?q=iasi'` returns JSON with listings whose city is `Iași`.
  3. Browse `/categorii/auto` in the dev server; filters update results; no console errors.
  4. Reload homepage; "Anunțuri Recomandate" populates from API.
- Automated:
  - `backend/tests/listings_search.rs` — integration test: insert fixtures, assert FTS matches diacritic variants, price range respects NULLs, `verified` filter works.
  - Service-layer test with a mock repo covering param mapping.
  - Frontend: unit test the `searchListings` param builder; snapshot the CategoryPage with `MSW` intercepting `/listings`.
