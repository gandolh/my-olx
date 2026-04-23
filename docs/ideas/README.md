# MVP Feature Backlog

Agent-ready specs for every unimplemented MVP feature of **my-olx / PiațăRo**. Each file is standalone: pick one, read it end-to-end, and ship the slice (backend + frontend together) without needing other docs.

## How to read a spec

Every spec has frontmatter with `priority` (1–3) and `depends_on` (other specs that must ship first). The body follows a fixed shape:

1. **Context** — why it exists, what problem it solves.
2. **User stories** — short, concrete.
3. **Backend** — endpoints, DB delta, business rules, files to touch, existing code to reuse.
4. **Frontend** — routes, components, hooks, zod schemas, i18n keys, files to touch.
5. **Acceptance criteria** — checkbox list an agent can self-verify.
6. **Out of scope** — explicit non-goals (usually the post-MVP upgrade path).
7. **Verification** — how to test manually + which automated tests to add.

## Recommended build order

Dependencies are transitive — if you pick a P2/P3, ship its P1 parents first.

### Priority 1 — ship these before anything else

1. [migrations-and-schema.md](migrations-and-schema.md) — unblocks everything; backend currently has zero migrations.
2. [auth-complete.md](auth-complete.md) — register/login/email-verify/password-reset. Blocks listing creation and messaging.
3. [image-upload.md](image-upload.md) — S3 client is wired in [backend/src/state.rs](../../backend/src/state.rs) but unused; needed before the listing wizard can accept photos.
4. [public-browse-and-search.md](public-browse-and-search.md) — unauthenticated `GET /listings`; rewires [HomePage](../../frontend/src/modules/home/pages/HomePage.tsx) and [CategoryPage](../../frontend/src/modules/categories/pages/CategoryPage.tsx) from mock data.
5. [listing-detail-real-api.md](listing-detail-real-api.md) — public `GET /listings/:id`; rewires [ListingDetailPage](../../frontend/src/modules/listings/pages/ListingDetailPage.tsx).
6. [listing-creation-wizard.md](listing-creation-wizard.md) — `/adauga-anunt` 5-step flow. Depends on auth + images.

### Priority 2 — core engagement

7. [listing-edit-and-renewal.md](listing-edit-and-renewal.md) — PATCH + renewal (extends `expires_at` 30d).
8. [favorites.md](favorites.md) — heart toggle + `/favorite` page.
9. [messaging-rest-polling.md](messaging-rest-polling.md) — REST chat, 12s polling. Upgrade to WebSockets post-MVP.
10. [phone-verification-stubbed.md](phone-verification-stubbed.md) — endpoint + UI; accepts `123456` in dev, real provider post-MVP.
11. [user-dashboard.md](user-dashboard.md) — `/cont` with active listings, post counter, renewals, unread counts.

### Priority 3 — polish

12. [user-profile-and-public.md](user-profile-and-public.md) — edit own profile, public seller page `/utilizator/:id`.

## Architecture calls (locked for MVP)

These are decisions already made; individual specs inherit them:

- **Search**: Postgres `tsvector` + `unaccent` extension. No Elasticsearch. Diacritic-insensitive (`Timișoara` ≡ `timisoara`).
- **Messaging**: REST endpoints + frontend React Query polling at 12s intervals. No WebSockets in MVP (Axum supports it via `ws` feature in [backend/Cargo.toml](../../backend/Cargo.toml) — swap later).
- **Email verification**: real (SMTP) — required before posting.
- **Phone verification**: endpoint + UI wired, but provider is stubbed (`PhoneProvider` trait, `StubProvider` accepts `123456`). Swap in Twilio / SMS.ro post-MVP.
- **Image storage**: S3 via the existing client already created in [backend/src/main.rs:33](../../backend/src/main.rs#L33). LocalStack in dev, real S3 in prod.
- **Romanian-first**: every user-facing string in i18n with Romanian (`ro`) as default locale. Diacritics preserved.

## Out of scope for MVP (do not spec)

- Social auth (Google, Facebook)
- Business accounts & premium tools
- Seller identity verification badges (manual review / Romanian e-ID)
- Featured / boosted listings (monetization)
- Saved searches with new-match notifications
- Seller analytics (views, response time)
- Real-time messaging via WebSockets

## Related docs

- [../requirements-summary.md](../requirements-summary.md) — business requirements (source of truth for rules).
- [../design-brief.md](../design-brief.md) — design principles.
- [../wiki/features/](../wiki/features/) — earlier thin "[Planned]" writeups. The specs here **supersede** the wiki; wiki stays as historical "why" doc.
- [../superpowers/](../superpowers/) — in-flight implementation plans + design-system snapshots.
- [docs/issues/](../issues/) — concrete bugs/defects already in the codebase.

## Status legend

| Frontmatter field | Meaning |
|---|---|
| `priority: 1` | Core MVP — ship first. |
| `priority: 2` | Core engagement — ship after P1. |
| `priority: 3` | Polish — safe to defer. |
| `status: idea` | Not started. |
| `status: in-progress` | An agent is executing; check `docs/superpowers/plans/` for the active plan. |
| `status: shipped` | Delivered and in `main`. |

When an agent picks up a spec, they flip `status` to `in-progress` in the frontmatter and optionally drop a plan into [../superpowers/plans/](../superpowers/plans/).
