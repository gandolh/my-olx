---
name: listing-detail-real-api
priority: 1
depends_on: [public-browse-and-search.md, image-upload.md]
area: listings
status: idea
---

# Public listing detail endpoint + rewire detail page

## Context

[backend/src/repositories/listings.rs:41](../../backend/src/repositories/listings.rs#L41) already defines `find_by_id` but nothing calls it. The frontend detail page at [frontend/src/modules/listings/pages/ListingDetailPage.tsx](../../frontend/src/modules/listings/pages/ListingDetailPage.tsx) renders from `fetchMockListingDetail` ([L3 in the hook](../../frontend/src/modules/listings/hooks/useListingDetail.ts#L3)) with extensive mock data including seller info, specs, features, and related listings ([frontend/src/modules/listings/data/mockListing.ts](../../frontend/src/modules/listings/data/mockListing.ts)).

This spec delivers the public `GET /listings/:id` endpoint, a related-listings endpoint, view-count increment, and rewires the page to real data. It does **not** introduce per-category "specs" (e.g. car mileage, phone RAM) — those land when the listing creation wizard adds category-specific fields ([listing-creation-wizard.md](listing-creation-wizard.md)). For MVP, `specs` + `features` are derived from description + basic fields.

## User stories

- As a visitor, visiting `/anunturi/:id` shows the full listing: title, price, all images, description, seller card, posted date.
- As a visitor, the page works without logging in.
- As a seller, I can see my own expired/inactive listings (owner-only override).
- As a visitor, each page view increments the listing's view_count (eventual consistency is fine).
- As a visitor, the "Related listings" section shows 4 active listings in the same category.

## Backend

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/listings/:id` | **no** (public) | Full listing detail including seller summary + images. 404 if `active = false` or `expires_at < NOW()` **unless** the caller is the owner. |
| POST | `/listings/:id/view` | no | Increments `view_count`. Best-effort; dedupe by client IP in MVP is optional (skip; noisy but honest). Always 204. |
| GET | `/listings/:id/related` | no | Up to 4 active listings in the same category, excluding the target. |

Alternative for view count: include it in the GET response and increment server-side on each GET. That's simpler and removes a client round-trip — **do this instead** unless analytics requires a separate call. Spec assumes "increment on GET" going forward.

### Response shape

```rust
// dto/listing.rs (add)

#[derive(Serialize)]
pub struct ListingDetailResponse {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub price_ron: Option<i64>,
    pub is_negotiable: bool,
    pub category: String,
    pub category_label: String,   // derived server-side from the category slug
    pub city: String,
    pub images: Vec<ListingImageResponse>,
    pub view_count: i64,
    pub posted_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub active: bool,
    pub seller: SellerSummary,
}

#[derive(Serialize)]
pub struct ListingImageResponse {
    pub id: Uuid,
    pub url: String,
    pub position: i32,
}

#[derive(Serialize)]
pub struct SellerSummary {
    pub id: Uuid,
    pub display_name: Option<String>,
    pub avatar_url: Option<String>,
    pub phone_verified: bool,
    pub member_since: DateTime<Utc>,
    pub active_listings_count: i64,
    // rating/reviews reserved for post-MVP — omit from MVP response or return 0/0
}
```

Related endpoint returns `Vec<ListingCardResponse>` (same type from [public-browse-and-search.md](public-browse-and-search.md)).

### SQL

```sql
-- find_detail:
SELECT l.*, u.display_name, u.avatar_url, u.phone_verified, u.created_at AS user_created_at
FROM listings l
JOIN users u ON u.id = l.user_id
WHERE l.id = $1;

-- images:
SELECT id, s3_key, position FROM listing_images WHERE listing_id = $1 ORDER BY position ASC;

-- active_listings_count for seller:
SELECT COUNT(*) FROM listings WHERE user_id = $1 AND active = TRUE AND expires_at > NOW();

-- increment view:
UPDATE listings SET view_count = view_count + 1 WHERE id = $1 AND active = TRUE;

-- related:
SELECT ... FROM listings WHERE category = $1 AND id != $2 AND active = TRUE AND expires_at > NOW()
ORDER BY created_at DESC LIMIT 4;
```

Hide expired/inactive unless caller is owner:
- Extract `Option<AuthUser>` via a non-failing extractor wrapper (Axum pattern: `Option<AuthUser>` implementation that returns `None` on missing/invalid token instead of erroring).
- If listing is inactive or expired AND caller is not owner → `AppError::NotFound`.

### Image URL construction

`url = format!("{}/{}", config.s3_public_base_url, s3_key)`. Compute in the service/handler; don't persist full URLs in the DB (CDN domains change).

### Category label mapping

Server-side map of category slug → Romanian label (source of truth). Derive from [frontend CATEGORIES](../../frontend/src/modules/home/pages/HomePage.tsx#L7-L17). Hardcode for MVP in `backend/src/services/listings.rs`:

```rust
pub fn category_label(slug: &str) -> &'static str {
    match slug {
        "electronice" => "Electronice",
        "auto" => "Auto, moto și ambarcațiuni",
        "imobiliare" => "Imobiliare",
        "casa-gradina" => "Casă și grădină",
        "moda" => "Modă și frumusețe",
        "joburi" => "Locuri de muncă",
        "servicii" => "Servicii, afaceri",
        "sport" => "Sport și timp liber",
        "gratuit" => "Oferite gratuit",
        _ => "Diverse",
    }
}
```

### Files to touch

- [backend/src/routes/listings.rs](../../backend/src/routes/listings.rs) — add `/:id` (GET) and `/:id/related` (GET).
- `backend/src/handlers/listings.rs` — add `get_listing`, `get_related`.
- [backend/src/services/listings.rs](../../backend/src/services/listings.rs) — add `get_detail(id, viewer_id: Option<Uuid>)`, `get_related(id)`.
- [backend/src/repositories/listings.rs](../../backend/src/repositories/listings.rs) — add `find_detail(id) -> Option<ListingDetailRow>`, `increment_view_count(id)`, `list_related(category, exclude_id, limit)`.
- `backend/src/repositories/images.rs` — expose `list_by_listing` (already needed by [image-upload.md](image-upload.md); this spec just consumes it).
- [backend/src/dto/listing.rs](../../backend/src/dto/listing.rs) — add the response DTOs.
- `backend/src/middleware/auth.rs` — add `OptionalAuthUser` wrapper (returns `None` on missing/invalid token) or implement `FromRequestParts` for `Option<AuthUser>` explicitly (Axum does this automatically if the extractor is `Option<T>` where `T: FromRequestParts`; test this).

### Reuse

- `find_by_id` at [repositories/listings.rs:41](../../backend/src/repositories/listings.rs#L41) — likely extended or supplemented with `find_detail` that JOINs users.
- `AppError::NotFound` for hidden/missing.

## Frontend

### Rewire the detail page

Today: [useListingDetail](../../frontend/src/modules/listings/hooks/useListingDetail.ts) calls `fetchMockListingDetail`. Replace with:

```ts
// src/modules/listings/services/listings.ts
export async function fetchListingDetail(id: string) {
  const res = await axiosInstance.get(`/listings/${id}`)
  return res.data   // ListingDetailResponse
}
export async function fetchRelatedListings(id: string) {
  const res = await axiosInstance.get(`/listings/${id}/related`)
  return res.data   // ListingCardResponse[]
}

// src/modules/listings/hooks/useListingDetail.ts — rewrite:
import { useQuery } from '@tanstack/react-query'
import { fetchListingDetail } from '../services/listings'

export function useListingDetail(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListingDetail(id),
    enabled: !!id,
  })
}
```

### Type adjustments

The existing `ListingDetail` type at [frontend/src/modules/listings/types/index.ts](../../frontend/src/modules/listings/types/index.ts) includes `specs`, `features`, and a richer seller (rating, reviewCount). Options:

- **Recommended**: simplify the type to match backend response. Drop `specs`, `features` arrays for MVP; replace the bento spec grid ([`SpecsBento`](../../frontend/src/modules/listings/components/SpecsBento.tsx)) with a simpler "key facts" component showing `price_ron`, `city`, `category`, `posted_at`, `view_count`, `is_negotiable`. `ListingDescription` takes just `description`.
- Alt: keep the type, compute `specs` from backend fields client-side. Less work but less clear.

`SellerSummary` shrinks: no `rating`, no `reviewCount` for MVP. SellerCard updates accordingly — show: avatar, display_name, "Membru din {member_since}", "{active_listings_count} anunțuri active", verified badge if `phone_verified`. No ratings section.

### Related listings

Replace `MOCK_RELATED_LISTINGS` at [ListingDetailPage.tsx:11](../../frontend/src/modules/listings/pages/ListingDetailPage.tsx#L11) and [L125](../../frontend/src/modules/listings/pages/ListingDetailPage.tsx#L125) with a second React Query call:

```ts
const { data: related } = useQuery({
  queryKey: ['listing-related', id],
  queryFn: () => fetchRelatedListings(id),
  enabled: !!data,        // wait until main listing loaded
})
```

`RelatedListings` component takes `listings: ListingCardResponse[]`.

### Files to touch

- `frontend/src/modules/listings/services/listings.ts` — new.
- [frontend/src/modules/listings/hooks/useListingDetail.ts](../../frontend/src/modules/listings/hooks/useListingDetail.ts) — rewrite.
- `frontend/src/modules/listings/hooks/useRelatedListings.ts` — new.
- [frontend/src/modules/listings/types/index.ts](../../frontend/src/modules/listings/types/index.ts) — simplify `ListingDetail`, `SellerSummary`.
- [frontend/src/modules/listings/components/SellerCard.tsx](../../frontend/src/modules/listings/components/SellerCard.tsx) — drop rating/review fields; add contact buttons wiring for [messaging](messaging-rest-polling.md) (separate spec, but leave seam: `onMessage` prop).
- [frontend/src/modules/listings/components/SpecsBento.tsx](../../frontend/src/modules/listings/components/SpecsBento.tsx) — rename + rewrite as "KeyFacts" or remove entirely. Decision noted in PR.
- [frontend/src/modules/listings/components/RelatedListings.tsx](../../frontend/src/modules/listings/components/RelatedListings.tsx) — accept real data shape; skeleton/empty states.
- [frontend/src/modules/listings/data/mockListing.ts](../../frontend/src/modules/listings/data/mockListing.ts) — delete entirely.
- [frontend/src/modules/listings/pages/ListingDetailPage.tsx](../../frontend/src/modules/listings/pages/ListingDetailPage.tsx) — remove `MOCK_RELATED_LISTINGS` import + related rendering moves to `useRelatedListings`.
- [frontend/public/locales/ro/common.json](../../frontend/public/locales/ro/common.json) — add `listing.keyFacts.*`, `listing.seller.*`, `listing.related.*` keys.

### Reuse

- [`ListingGallery`](../../frontend/src/modules/listings/components/ListingGallery.tsx) — works as-is once `data.images` is `string[]`. Either map backend `ListingImageResponse[]` → `string[]` in the hook, or make the gallery accept the richer shape.
- [`PricingCard`](../../frontend/src/modules/listings/components/PricingCard.tsx), [`ListingDescription`](../../frontend/src/modules/listings/components/ListingDescription.tsx) — minimal prop changes only.
- `ListingCard` for related grid.

## Acceptance criteria

- [ ] `GET /listings/:id` returns 200 with full detail for an active, non-expired listing.
- [ ] `GET /listings/:id` returns 404 for inactive/expired listings unless the caller is owner.
- [ ] `view_count` increments by 1 on each successful GET.
- [ ] Owner viewing their own expired listing sees it, with an obvious "Expirat" badge on the page.
- [ ] Related endpoint excludes the target listing and other categories; returns ≤ 4.
- [ ] `ListingDetailPage` renders real data including real image URLs from S3.
- [ ] Navigating between listings triggers new React Query fetches and view increments.
- [ ] No references to `fetchMockListingDetail` or `MOCK_RELATED_LISTINGS` remain in the frontend.
- [ ] 404 on detail page shows the existing [`ErrorCard`](../../frontend/src/components/ui/ErrorCard.tsx) with "Anunțul nu a fost găsit" + a "înapoi la pagina principală" link.
- [ ] Seller verified badge shows only when `phone_verified`.
- [ ] `view_count` displayed with localized formatting (`1.234 vizualizări`).

## Out of scope

- Per-category specs (phone RAM, car mileage, apartment floorspace). Storage decision deferred to the listing wizard; MVP keeps `description` free-form + key facts only.
- Seller ratings / reviews.
- "Recently viewed" personalized recommendations.
- Report listing endpoint (button exists in UI; non-functional in MVP; spec separately when moderation lands).
- Share-to-social-media buttons.
- Absolute view-count dedup by cookie/IP (MVP increments on every GET).

## Verification

- Manual:
  1. Create a listing via the existing API (or after [listing-creation-wizard.md](listing-creation-wizard.md) is shipped), upload 2 images.
  2. Open `/anunturi/<id>` in an incognito window → renders full page.
  3. Reload 3 times → `view_count` in response and UI is 3.
  4. Log in as non-owner, visit an inactive listing → 404.
  5. Log in as owner, visit same listing → visible with "Expirat" tag.
- Automated:
  - `backend/src/services/listings.rs` tests for `get_detail` owner-vs-visitor visibility.
  - Integration test: `get_detail` increments view count atomically.
  - Frontend: snapshot `ListingDetailPage` with MSW intercepting `/listings/:id` and `/listings/:id/related`.
