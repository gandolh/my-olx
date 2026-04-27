# User Dashboard

**Status:** Done

**Summary:** Private area for users to manage their listings and profile.

## Requirements

- `/cont/anunturi` (Active, Expired, Drafts)
- Edit/Renew/Deactivate actions on listings
- Post counter (X of 5 this week)
- Profile settings (Display name, Avatar)

## Design Notes

- Reuses `ListingCard` components with action menus
- Real-time status updates via React Query invalidation

## Acceptance Criteria

- User can see all their listings in one place
- Actions (Renew, Deactivate) work instantly
