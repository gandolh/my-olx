---
name: broken-nav-links
type: issue
severity: medium
area: frontend
status: open
fixed_by: ideas/public-browse-and-search.md, ideas/favorites.md, ideas/messaging-rest-polling.md, ideas/listing-creation-wizard.md
---

# Multiple navbar + CTA links point at routes that don't exist

## Problem

Five user-visible links navigate to undefined routes, all of which fall through the catchall route at [frontend/src/routes/index.tsx:32](../../frontend/src/routes/index.tsx#L32) and render the generic [`ComingSoon`](../../frontend/src/components/ui/ComingSoon.tsx):

| Link source | Target path | Defined? |
|---|---|---|
| [Navbar "Categorii"](../../frontend/src/components/layout/Navbar.tsx#L14) | `/categorii` | ❌ |
| [Navbar "Favorite"](../../frontend/src/components/layout/Navbar.tsx#L17) | `/favorite` | ❌ |
| [Navbar "Mesaje"](../../frontend/src/components/layout/Navbar.tsx#L20) | `/mesaje` | ❌ |
| [Navbar "Adaugă Anunț"](../../frontend/src/components/layout/Navbar.tsx#L40) | `/adauga-anunt` | ❌ |
| [HomePage search → `/anunturi?q=...`](../../frontend/src/modules/home/pages/HomePage.tsx#L69) | `/anunturi` | ❌ |
| [HomePage CTA button](../../frontend/src/modules/home/pages/HomePage.tsx#L206) | `/adauga-anunt` | ❌ |
| [HomePage "Vezi toate categoriile"](../../frontend/src/modules/home/pages/HomePage.tsx#L128) | `/categorii` | ❌ |

## Impact

- Every navbar item except the logo goes nowhere. Users click and immediately hit the "În curând" page — poor first impression.
- HomePage search form is unusable (submits to a non-existent page).
- Prospective sellers clicking "Adaugă Anunț" see "Coming Soon" instead of the creation flow.
- Makes the app feel like a static mockup, even though backend + listing detail work.

## Repro

1. `cd frontend && npm run dev`, open `http://localhost:5173`.
2. Click any link in the navbar. Result: generic "În curând" screen.
3. Type in the homepage search and press Enter. Result: same.

## Root cause

These routes were deliberately stubbed until the underlying features exist. The routing file only registers `/`, `/categorii/:slug`, `/anunturi/:id`, and the catch-all. Fixing each route requires shipping its backing feature spec — this issue tracks the aggregate UX breakage, not an isolated bug.

## Recommended fix

Two layers:

### Short-term (cheap — do now)

Make the `<ComingSoon />` fallback **self-aware**: detect the path and show a helpful message + a "Înapoi la pagina principală" CTA. Example:

```tsx
// src/components/ui/ComingSoon.tsx
import { useLocation } from 'react-router-dom'
const MESSAGES: Record<string, { title: string; body: string }> = {
  '/adauga-anunt': { title: 'Postarea de anunțuri vine în curând', body: '...' },
  '/favorite':    { title: 'Favoritele tale vor apărea aici', body: '...' },
  '/mesaje':      { title: 'Mesageria este în dezvoltare', body: '...' },
  '/categorii':   { title: 'Catalogul complet se pregătește', body: '...' },
  '/anunturi':    { title: 'Căutarea avansată sosește curând', body: '...' },
}
export function ComingSoon() {
  const { pathname } = useLocation()
  const custom = MESSAGES[pathname]
  // render custom if present, generic otherwise
}
```

Alternative short-term: disable the navbar links when their routes aren't defined (add an `enabled` prop). Less helpful; the self-aware ComingSoon is better.

### Long-term (the real fix — already speced)

These specs register the routes and kill the placeholders:

- `/categorii` and `/anunturi` — [public-browse-and-search.md](../ideas/public-browse-and-search.md)
- `/adauga-anunt` — [listing-creation-wizard.md](../ideas/listing-creation-wizard.md)
- `/favorite` — [favorites.md](../ideas/favorites.md)
- `/mesaje` and `/mesaje/:id` — [messaging-rest-polling.md](../ideas/messaging-rest-polling.md)

Once those ship, the catchall `ComingSoon` route should only fire on genuinely bad URLs; rename it to `NotFound` and update copy accordingly.

## Affected files

- [frontend/src/routes/index.tsx](../../frontend/src/routes/index.tsx) — register the 5 missing routes as each spec ships.
- [frontend/src/components/ui/ComingSoon.tsx](../../frontend/src/components/ui/ComingSoon.tsx) — short-term: path-aware messages.
- [frontend/src/components/layout/Navbar.tsx](../../frontend/src/components/layout/Navbar.tsx) — no change once specs ship; can add the "Favorite (N)" / "Mesaje (N)" badges after favorites + messaging land.

## Verification after fix

- Every navbar link navigates to a real, populated page.
- HomePage search submits successfully and shows results.
- The catchall only triggers for `/foo-bar-random`, and that render is clearly a 404 (not a "coming soon").
- `grep -r 'ComingSoon' frontend/src/` only matches the component definition + its 404 usage.
