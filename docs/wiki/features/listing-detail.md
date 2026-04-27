# Listing Detail

**Status:** Done

**Summary:** Full-page view for individual listings with seller info and related items.

## Requirements

- Full listing details: Title, Price, Gallery, Description, City
- Seller card with "member since" and "active listings count"
- View count increment on every visit
- Related listings (4 items from the same category)

## Design Notes

- Incremental view count (best-effort)
- Owner-only view for expired/inactive listings
- Image URLs constructed from S3 public base URL

## Acceptance Criteria

- Detail page loads real data from API
- View count updates on refresh
- Related listings grid shows relevant items
