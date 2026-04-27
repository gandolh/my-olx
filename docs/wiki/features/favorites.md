# Favorites

**Status:** Done

**Summary:** Users can save listings for later via a heart toggle on cards and detail pages.

## Requirements

- Heart toggle on `ListingCard` and `PricingCard`
- `/favorite` page with grid of saved listings
- Count badge in navbar next to "Favorite"
- Anonymous users redirected to login on heart click

## Design Notes

- Optimistic UI updates for heart toggle
- `GET /me/favorites/ids` returns small array for fast UI sync
- Cascades on listing delete (FK `ON DELETE CASCADE`)

## Acceptance Criteria

- Toggling heart persists across sessions
- `/favorite` page shows real-time saved listings
- Navbar count reflects the number of saved items
