# Listing Lifecycle

**Status:** Planned

**Summary:** Listings are active for 30 days, then expire; free renewal requires manual user action.

## Requirements

- Listings auto-expire after 30 days (`expires_at = NOW() + INTERVAL '30 days'` set at creation)
- Email/push notification when listing is expiring or expired
- One-click renewal from dashboard
- Seller dashboard shows active listings and those requiring renewal
- Weekly post limit: 5 free listings per user per week (enforced in `services/listings.rs` as `WEEKLY_POST_LIMIT`)

## Design Notes

- Expiry is intentional — filters out forgotten announcements and keeps the marketplace fresh
- Renewal is free but requires deliberate user action (reduces zombie listings)
- The 5/week limit applies per user account, tracked via Redis rate limiting

## Acceptance Criteria

- Listing `expires_at` is set correctly at creation
- Expired listings are not returned in search results
- User receives notification before expiry
- Renewal resets `expires_at` to NOW() + 30 days
- Posting a 6th listing in a week returns an error
