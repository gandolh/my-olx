# TanStack Router Migration

**Status:** Planned

**Summary:** Replace the frontend routing stack with @tanstack/react-router to unlock typed navigation, data APIs, and route-level composition.

## Requirements

- Introduce a root TanStack router configuration, including router creation, providers, and suspense-friendly fallbacks.
- Port all existing module route definitions to TanStack route files with lazy components and shared loaders where needed.
- Migrate navigation primitives (links, redirects, params, search state) from react-router-dom hooks/components to TanStack router equivalents.
- Ensure auth flows, protected navigation, and query parameter handling remain functional with updated APIs.
- Remove react-router-dom dependency and update documentation/tests as necessary.

## Design Notes

- Execute migration in phases: bootstrap router shell, convert shared infrastructure (App shell, layout), then tackle modules iteratively (auth, listings, messaging, etc.).
- Leverage `createFileRoute`/`createLazyFileRoute` patterns or custom helpers to keep module route exports consistent with existing structure.
- Replace `useNavigate`, `useParams`, and `useSearchParams` with TanStack hooks (`useRouter`, `useParams`, `useSearch`), normalizing search serialization via schema validators.
- Provide compatibility wrappers or adapters where immediate API parity is needed (e.g., helpers for redirect-on-success mutations).
- Add integration smoke tests or manual test script covering critical flows (listing browse, auth, messaging) before removing legacy router.

## Acceptance Criteria

- Application boots with TanStack router provider; no react-router-dom imports remain in source.
- All primary user journeys (home, category, search, listing detail/edit, create listing, auth, dashboard, favorites, messaging) navigate correctly without runtime errors.
- Query string operations (filters, pagination, redirects) behave as before, with typed search schemas documented.
- Build and lint succeed, and dependencies no longer include `react-router-dom`.
- Wiki index and log reference this migration plan.
