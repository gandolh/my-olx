---
name: user-dashboard
priority: 2
depends_on: [listing-edit-and-renewal.md, messaging-rest-polling.md, favorites.md]
area: listings
status: idea
---

# User dashboard (`/cont`)

## Context

There's no landing page for a logged-in user beyond the listing-creation CTA. Sellers need a place to see their active listings, weekly post count, renewal reminders, unread messages, and saved favorites. Navbar's placeholder `<button aria-label="Profil">` at [Navbar.tsx:34-38](../../frontend/src/components/layout/Navbar.tsx#L34-L38) is a natural home for a "Contul meu" dropdown linking to this dashboard.

This spec delivers a single `/cont` page summarizing account state and a dedicated `/cont/anunturi` listing management page. Most endpoints already exist from prerequisite specs; this spec wires them together + adds a single stats endpoint.

## User stories

- As a seller, one click from the navbar avatar takes me to my dashboard with my most important info above the fold.
- As a seller, I see how many of my 5 weekly posts I've used and when the quota resets.
- As a seller, listings nearing expiry (< 7 days) show a "Reînnoiește" highlighted action.
- As a seller/buyer, I see unread message count and a quick link to the inbox.
- As a seller/buyer, I see my favorites count with a quick link.
- As a seller, I can manage all my listings (including inactive/expired) on a dedicated subpage.

## Backend

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/me/stats` | yes | Aggregate stats for dashboard. |

Rest of the data is served by endpoints already added in other specs (`/me/listings`, `/me/favorites`, `/conversations`, `/me/unread-count`).

### Response shape

```rust
// dto/user.rs (extend or new)

#[derive(Serialize)]
pub struct MyStatsResponse {
    pub listings: ListingStats,
    pub messages: MessagingStats,
    pub favorites_count: i64,
}

#[derive(Serialize)]
pub struct ListingStats {
    pub active: i64,
    pub inactive: i64,
    pub expired: i64,             // active=false OR expires_at < NOW()
    pub expiring_soon: i64,       // active=true AND expires_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    pub weekly_post_count: i64,
    pub weekly_post_limit: i64,   // always 5 for MVP
    pub week_resets_at: DateTime<Utc>,   // NOW() + (7d - time since oldest active listing in the current week)
}

#[derive(Serialize)]
pub struct MessagingStats {
    pub unread_count: i64,
    pub conversation_count: i64,
}
```

### SQL

Wrap in a single service method hitting 4–5 small queries (acceptable — the dashboard is loaded infrequently). Or combine with CTEs:

```sql
WITH me AS (SELECT $1::uuid AS id)
SELECT
  (SELECT COUNT(*) FROM listings WHERE user_id = me.id AND active = TRUE AND expires_at > NOW())                 AS active,
  (SELECT COUNT(*) FROM listings WHERE user_id = me.id AND active = FALSE)                                         AS inactive,
  (SELECT COUNT(*) FROM listings WHERE user_id = me.id AND expires_at <= NOW())                                    AS expired,
  (SELECT COUNT(*) FROM listings WHERE user_id = me.id AND active = TRUE AND expires_at > NOW() AND expires_at < NOW() + INTERVAL '7 days') AS expiring_soon,
  (SELECT COUNT(*) FROM listings WHERE user_id = me.id AND active = TRUE AND created_at >= NOW() - INTERVAL '7 days') AS weekly_post_count,
  (SELECT COUNT(*) FROM favorites WHERE user_id = me.id)                                                           AS favorites_count,
  ...
```

`week_resets_at` is computed from: `MIN(created_at) + INTERVAL '7 days'` over current-window listings, or `NOW() + INTERVAL '7 days'` if none.

### Files to touch

- [backend/src/routes/users.rs](../../backend/src/routes/users.rs) — add `/me/stats`.
- [backend/src/handlers/users.rs](../../backend/src/handlers/users.rs) — add handler.
- `backend/src/services/users.rs` — **new file** (extract `me` + `stats` business logic).
- `backend/src/repositories/stats.rs` — **new** (the aggregate query).
- `backend/src/dto/user.rs` — new DTOs.

### Reuse

- `AuthUser`, `AppError`.
- `WEEKLY_POST_LIMIT` constant from [backend/src/services/listings.rs:10](../../backend/src/services/listings.rs#L10).

## Frontend

### Routes

| Path | Component |
|---|---|
| `/cont` | `DashboardPage` — summary. |
| `/cont/anunturi` | `MyListingsPage` — full list of active/inactive/expired with actions. |
| `/cont/setari` | **Out of scope** for this spec, see [user-profile-and-public.md](user-profile-and-public.md). |

All guarded by auth; redirect to `/autentificare?next=<path>` when not logged in.

### DashboardPage layout

Above the fold (desktop):
- Greeting: "Bună, <display_name or email local part>!"
- 4 stat cards: Anunțuri active (N), Vizualizări totale (Σ view_count across active), Mesaje necitite (N), Favorite salvate (N). Each links to the relevant page.
- Post-quota card: "Ai folosit 3 / 5 anunțuri săptămânale — se resetează în 2 zile". Progress bar.

Below the fold:
- Section "Anunțuri care expiră curând" — cards of listings with `expiring_soon > 0`, each with a big "Reînnoiește" button using the renew mutation from [listing-edit-and-renewal.md](listing-edit-and-renewal.md).
- Section "Conversații recente" — first 3 from `/conversations`.
- Section "Activitate recentă" — last 5 favorite-adds or new listings, as a mini-timeline (optional, can skip).

Use server-rendered fresh numbers; cache with `staleTime: 30_000`.

### MyListingsPage

- Tabs: Active, Inactive, Expirate. Count badge on each tab.
- Each row: thumbnail, title, price, city, "Expiră în X zile" / "Expirat acum X zile" / "Pauzat", plus action menu: Editare, Reînnoiește, Dezactivează, Șterge.
- "Adaugă un anunț nou" primary button.

### Services + hooks

```ts
// src/modules/dashboard/services/dashboard.ts
export async function fetchMyStats() {
  return (await axiosInstance.get('/me/stats')).data  // MyStatsResponse
}
export async function fetchMyListings(params: { active?: boolean; expired?: boolean; page?: number }) { ... }

// src/modules/dashboard/hooks/useMyStats.ts
export function useMyStats() {
  return useQuery({ queryKey: ['me','stats'], queryFn: fetchMyStats, staleTime: 30_000 })
}
```

### Files to touch

- `frontend/src/modules/dashboard/pages/{Dashboard,MyListings}Page.tsx` — new.
- `frontend/src/modules/dashboard/components/{StatCard,QuotaCard,ExpiringSection,RecentConversations,MyListingRow}.tsx` — new.
- `frontend/src/modules/dashboard/services/dashboard.ts` — new.
- `frontend/src/modules/dashboard/hooks/{useMyStats,useMyListings}.ts` — new.
- [frontend/src/routes/index.tsx](../../frontend/src/routes/index.tsx) — register `/cont`, `/cont/anunturi`.
- [frontend/src/components/layout/Navbar.tsx](../../frontend/src/components/layout/Navbar.tsx) — replace placeholder "Profil" button with an avatar-or-initials dropdown menu: "Contul meu" → `/cont`, "Anunțurile mele" → `/cont/anunturi`, "Setări" → `/cont/setari`, separator, "Deconectare".
- [frontend/public/locales/ro/common.json](../../frontend/public/locales/ro/common.json) — add `dashboard.*` keys (card titles, stat labels, quota text, empty states, action menu).

### Reuse

- `ListingCard`, `RenewButton` from [listing-edit-and-renewal.md](listing-edit-and-renewal.md).
- `useListingMutations` from [listing-edit-and-renewal.md](listing-edit-and-renewal.md).
- `useFavoriteIds`, `useConversations`, `useUnreadCount` from earlier specs.
- `@base-ui/react` menu primitives for the Navbar dropdown.

## Acceptance criteria

- [ ] `/cont` renders within 500ms (measured) on a warm query cache; ~1s cold.
- [ ] Stats card counts match database queries (verified with `SELECT COUNT(*)` manually).
- [ ] Post quota progress bar fills correctly; shows "0/5" when no posts this week.
- [ ] Expiring-soon section only shows listings with `expires_at` in the next 7 days; empty when none.
- [ ] Clicking "Reînnoiește" calls the renew mutation and optimistically updates the card (days-remaining number jumps to 30).
- [ ] `/cont/anunturi` tabs filter correctly; counts match.
- [ ] Navbar avatar dropdown closes on outside click and keyboard Escape.
- [ ] Clicking avatar when logged out navigates to `/autentificare`.
- [ ] All stat cards link to a meaningful destination (messages → `/mesaje`, favorites → `/favorite`, active listings → `/cont/anunturi`).

## Out of scope

- Charts / analytics (views-over-time, message-response-time). Post-MVP.
- Earnings / revenue tracking (no payments in MVP).
- Exporting listings to CSV.
- Team/multi-user accounts.
- Drag-and-drop reordering of "My Listings".

## Verification

- Manual:
  1. Log in, post 3 listings; check `/cont` shows 3/5 quota.
  2. SQL-hack `expires_at` on one listing to 3 days from now; dashboard shows it under "expirând".
  3. Click "Reînnoiește" on that card; days-remaining jumps to 30 and the card disappears from "expirând".
  4. Send yourself a message as another user; unread count on dashboard + navbar increments.
- Automated:
  - Backend: service test for `get_stats(user_id)` with a seeded DB; assert all counts.
  - Frontend: hook test for `useMyStats` query key invalidation after a renew mutation.
  - Screenshot / visual regression for `/cont` empty + populated states.
