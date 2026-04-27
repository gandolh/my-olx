# Listing Lifecycle

**Status:** Done

**Summary:** Listings are active for 30 days, then expire; free renewal requires manual user action.

## Requirements

- Listings auto-expire after 30 days
- Manual renewal resets `expires_at` for another 30 days
- Deactivation ("Pauzează") hides listing from public search
- Seller dashboard for managing active/expired/draft listings
- Weekly post limit: 5 free listings per week (excludes renewals)

## Design Notes

- Expiry keeps the marketplace fresh and removes zombie listings
- Renewal is free but requires deliberate action
- Edit page uses a flat form (not wizard) for quick updates

## Acceptance Criteria

- Expired listings are hidden from search
- Renewal resets `expires_at` and reactivates listing
- Weekly limit (5/week) applies only to new posts
- Deactivation works without deleting the listing
