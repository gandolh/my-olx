# Category Browsing & Filters Page — Design Spec

**Date:** 2026-04-23  
**Route:** `/categorii/:slug`  
**Status:** Approved

---

## Overview

A category listings page for PiațăRo. Users land here after clicking a category on the homepage. Listings are fetched from a simulated backend (mock data with 500ms delay via React Query). All filters, sorting, and pagination are URL-driven via `useSearchParams()` so links are shareable and the browser back button works correctly.

---

## Route & Navigation

- Route: `/categorii/:slug` (e.g. `/categorii/electronice`)
- Registered in `src/routes/index.tsx` with `React.lazy()` — same pattern as other routes
- `/categorii` (no slug) remains `<ComingSoon />` for now
- Unknown slug: show an inline "Categorie inexistentă" message with a link back to `/`

---

## URL Parameter Schema

All params are optional. Missing = no filter applied.

| Param | Values | Default |
|---|---|---|
| `loc` | city slug e.g. `bucuresti` | all Romania |
| `pret_min` | integer (RON) | none |
| `pret_max` | integer (RON) | none |
| `data` | `24h` \| `saptamana` \| `oricand` | `oricand` |
| `verificat` | `1` | unset (all sellers) |
| `sortare` | `noi` \| `pret_asc` \| `pret_desc` \| `relevanta` | `noi` |
| `pagina` | integer ≥ 1 | `1` |

Changing any filter param resets `pagina` to `1`.

---

## Component Structure

```
src/modules/categories/
  pages/
    CategoryPage.tsx          — route entry, reads :slug + useSearchParams
  components/
    FilterSidebar.tsx         — all filter controls (controlled, writes to URL)
    CategoryHeader.tsx        — category title + result count
    SortBar.tsx               — grid/list toggle + sort dropdown
    ListingGrid.tsx           — grid or list of ListingCard, shows skeletons while loading
    Pagination.tsx            — prev/page numbers/next, writes ?pagina=
  hooks/
    useCategoryListings.ts    — React Query hook, simulates backend fetch
  data/
    mockListings.ts           — ~20 listings per category slug
  types/
    index.ts                  — FilterState, MockListing interfaces
```

Reuses `ListingCard` from `src/modules/home/components/ListingCard.tsx` without modification. `MockListing` must include all fields that `ListingCard` expects (`HomeListing` shape: id, price, title, location, time, verified, image) — the mock data adapter maps `postedAt` → `time` string.

---

## Data Types

```ts
interface MockListing {
  id: string
  categorySlug: string
  title: string
  price: number | null   // null = gratis
  location: string       // city name for display
  locationSlug: string   // for URL matching
  postedAt: Date
  verified: boolean
  image: string
}

interface FilterState {
  loc: string | null
  pret_min: number | null
  pret_max: number | null
  data: '24h' | 'saptamana' | 'oricand'
  verificat: boolean
  sortare: 'noi' | 'pret_asc' | 'pret_desc' | 'relevanta'
  pagina: number
}

interface ListingsResponse {
  listings: MockListing[]
  totalCount: number
  totalPages: number
}
```

---

## Data Fetching — `useCategoryListings`

React Query hook. Every filter/sort/page change triggers a new fetch.

```ts
// Query key includes all filter params so React Query refetches on any change
queryKey: ['listings', slug, filterState]

// Mock fetch: applies all filters + sorting + pagination server-side,
// resolves after 500ms
queryFn: () => fetchMockListings(slug, filterState)
```

`fetchMockListings` filters `mockListings` array by all `FilterState` fields, sorts, paginates (12 per page), and returns `ListingsResponse` wrapped in `new Promise(resolve => setTimeout(() => resolve(result), 500))`.

Loading skeleton is shown whenever `isFetching` is true (covers both initial load and filter changes).

---

## FilterSidebar

Controlled component — all values come from `FilterState`, all changes call `setSearchParams()` using the functional updater form (`prev => ({ ...prev, [key]: value, pagina: '1' })`) so existing params are preserved and `pagina` is reset on every filter change.

Controls:
- **Locație** — `<select>` with Romanian cities + "Toată România". Updates `?loc=` using city slugs (e.g. `bucuresti`). A `CITIES` constant in `mockListings.ts` maps slug ↔ display name.
- **Preț (RON)** — two `<input type="number">` (Min / Max) + decorative dual-handle range slider (visual only, inputs are the source of truth). Updates `?pret_min=` and `?pret_max=`
- **Data Publicării** — three radio buttons: Ultimele 24 ore / Ultima săptămână / Oricând. Updates `?data=`
- **Vânzători Verificați** — toggle switch. Updates `?verificat=1` or removes param
- **Resetează Filtre** — clears all filter params, keeps `:slug`, resets to page 1

---

## CategoryHeader

Displays:
- Category name derived from slug (e.g. `electronice` → "Electronică") via a slug→label map in `mockListings.ts`
- Result count: `"1,248 de anunțuri în Electronică"` (uses `totalCount` from query)
- While loading: skeleton placeholder for the count

---

## SortBar

- **Grid/List toggle** — local `useState` (display preference, not in URL). Default: grid.
- **Sort dropdown** — controlled, writes to `?sortare=`. Options: Cele mai noi / Preț: Mic la Mare / Preț: Mare la Mic / Relevanță

---

## ListingGrid

- Grid mode: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, gap-8
- List mode: single column, cards render horizontally (image left, content right)
- While `isFetching`: renders 6 `CardSkeleton` components in place of real cards
- Empty state (0 results, not loading): "Niciun anunț găsit" message + "Resetează Filtrele" button

---

## Pagination

- Shows previous / up to 5 page numbers with ellipsis / next
- Current page highlighted with primary background
- Writes `?pagina=N` on click
- Hidden when `totalPages <= 1`
- Page size: 12 listings per page

---

## Loading & Error States

| State | UI |
|---|---|
| `isFetching` (any filter change) | 6 × `CardSkeleton` in grid, count shows skeleton |
| `isError` | `ErrorCard` with retry button (calls `refetch()`) |
| 0 results | Inline empty state with reset button |
| Unknown slug | Inline message "Categorie inexistentă" + link to `/` |

---

## Styling

Follows Carpathian Clear design system:
- Background: `bg-background` (`#faf8ff`)
- Cards: `bg-surface-container-lowest` with `hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]`
- Sidebar inputs: `bg-surface-container-low rounded-xl`, focus ring `ring-primary/20`
- Section labels: `text-xs font-bold uppercase tracking-widest text-outline`
- No 1px dividers — use `bg-surface-container` background shifts
- Reset button: `bg-secondary-container text-on-secondary-container rounded-full`
- Verified badge: `bg-tertiary-container text-white`
- Typography: Manrope for headings, Inter for body

---

## What's Out of Scope

- Real API integration (mock only for now)
- `/categorii` index page (stays ComingSoon)
- Listing detail page navigation (cards link to `/anunturi/:id` which stays ComingSoon)
- Saved/favorite functionality (heart button renders but does not persist)
- i18n translation keys (Romanian strings hardcoded for now)
