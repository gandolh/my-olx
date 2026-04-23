---
name: Listing Detail Page Design
description: Design spec for implementing the listing detail page in the my-olx React frontend
type: project
---

# Listing Detail Page — Design Spec

## Context

The listing detail page is the core conversion page of PiațăRo: it shows a single classified ad in full, lets buyers contact the seller, and surfaces related listings. A complete HTML reference design exists at `design/code/listing-detail-page.html`. This spec translates that design into a React module following the existing `categories/` module pattern.

## Route

`/anunturi/:id` — lazy-loaded via React Router, registered in `frontend/src/routes/index.tsx`.

## Module Structure

```
frontend/src/modules/listings/
├── pages/
│   └── ListingDetailPage.tsx       # Composes all sections
├── components/
│   ├── ListingGallery.tsx          # Main image + thumbnail strip + favorite/share overlay
│   ├── ListingDescription.tsx      # Descriere section + feature pills + prose
│   ├── SpecsBento.tsx              # 2×2 / 4-col bento grid of technical specs
│   ├── PricingCard.tsx             # Sticky right col: title, price, CTA buttons, location/views
│   ├── SellerCard.tsx              # Seller avatar, name, verified badge, stats, rating
│   └── RelatedListings.tsx         # "Anunțuri Similare" grid — reuses ListingCard from home/
├── types/
│   └── index.ts                    # ListingDetail, SellerSummary, SpecItem, RelatedListing types
├── data/
│   └── mockListing.ts              # fetchMockListingDetail(id) returning ListingDetail
└── hooks/
    └── useListingDetail.ts         # React Query hook wrapping fetchMockListingDetail
```

## Data Shape

```ts
// types/index.ts
interface SpecItem   { icon: string; label: string; value: string }
interface SellerSummary {
  name: string; avatarUrl: string; verified: boolean
  memberSince: string; activeListings: number; rating: number; reviewCount: number
}
interface ListingDetail {
  id: string; title: string; price: number | null
  images: string[]          // first image is the main one
  location: string; viewCount: number
  description: string       // plain text paragraphs, '\n\n'-separated
  features: { icon: string; label: string; value: string }[]
  specs: SpecItem[]
  seller: SellerSummary
  categorySlug: string; categoryLabel: string
  postedAt: Date
}
interface RelatedListing {
  id: string; title: string; price: number | null
  image: string; location: string
}
```

`fetchMockListingDetail(id)` returns a hardcoded `ListingDetail` for id `'1'` (iPhone 15 Pro matching the HTML design), plus 4 hardcoded `RelatedListing` entries, after a 400 ms simulated delay.

## Components

### ListingDetailPage
- Reads `:id` from `useParams`
- Calls `useListingDetail(id)`
- Shows a `<PageLoader>` skeleton (same pattern as routes file) while loading
- Shows an `<ErrorCard>` on error
- 12-column grid on `lg`, single column on mobile
- Left column (8 cols): `ListingGallery` + `ListingDescription` + `SpecsBento`
- Right column (4 cols, `sticky top-28`): `PricingCard` + `SellerCard` + safety tip + report button
- Below grid: `RelatedListings`

### ListingGallery
- `aspect-[4/3]` main image with rounded-xl
- Horizontal thumbnail strip (4 thumbs, `w-24 h-24`, active has `border-2 border-primary`)
- Click thumbnail → sets active image index (local `useState`)
- Top-right overlay: favorite button (fill toggle) + share button

### ListingDescription
- Section header "Descriere" + listing ID (`ID: {id}`)
- Prose paragraphs from `description`
- Feature pills grid (battery health, warranty) — `bg-surface-container-low p-4 rounded-xl`

### SpecsBento
- `grid grid-cols-2 md:grid-cols-4 gap-4`
- Each cell: icon + label + value, `bg-surface-container-low p-6 rounded-2xl`

### PricingCard
- Hidden on mobile (title/price shown inline in left column on mobile)
- Primary CTA: "Trimite Mesaj" (`bg-primary`)
- Secondary CTA: "Arată Numărul de Telefon" (`bg-secondary-container text-on-secondary-container`)
- Footer row: location + view count

### SellerCard
- Avatar, name, verified badge (`bg-tertiary-container/10 text-tertiary`)
- 2-col stat grid: member since + active listings
- Rating pill: star icon + score + review count
- "Profil" link (plain text button)

### RelatedListings
- Section header "Anunțuri Similare"
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8`
- Renders `RelatedListing[]` as `<ListingCard>` (imported from `@/modules/home/components/ListingCard`)
- Maps `RelatedListing` → `HomeListing` shape for the card

## Breadcrumbs

Inline in `ListingDetailPage` (not a separate component — simple enough): Acasă › category label › listing title. Uses `<Link>` for Acasă and category, plain `<span>` for listing title.

## Styling

- All Tailwind classes from the design HTML are used directly
- No inline `style={{}}` except for Material Symbols variation settings (FILL toggle on favorite, verified icon fill) — same pattern as `ListingCard.tsx:31`
- Fonts: `font-headline` class for h1/h2, body uses Inter default
- Tokens: use design system classes (`bg-primary`, `text-on-surface`, `bg-surface-container-low`, etc.)

## Existing Code to Reuse

- `@/modules/home/components/ListingCard` — RelatedListings cards
- `@/modules/home/types` → `HomeListing` — target shape for related listing mapping
- `@/components/ui/ErrorCard` — error state
- `@/components/ui/Skeleton` / `CardSkeleton` — loading state in page loader
- `@/lib/formatters.ts` — price formatting if needed

## Verification

1. `cd frontend && npm run dev` — navigate to `/anunturi/1`
2. Verify: main image displays, thumbnail click switches image, favorite button toggles fill
3. Verify: sticky right column on desktop, stacked on mobile
4. Verify: "Anunțuri Similare" section renders 4 related cards
5. Verify: breadcrumb links work (Acasă → `/`, category → `/categorii/electronice`)
6. `npm run build` passes with no TypeScript errors
7. `npm run lint` passes clean
