# Search & Discovery

**Status:** Done

**Summary:** Elasticsearch-powered full-text search with Romanian diacritic support, filters, and a discovery homepage.

## Requirements

- Full-text search (title/description) using Postgres FTS + `unaccent`
- Romanian diacritic support (ă, â, î, ș, ț)
- Filters: Categorie, Oraș, Preț, Dată, Vânzător verificat
- Sort: Noi (default), Preț asc/desc, Relevanță
- Homepage with featured listings and category grid
- Search results page (`/anunturi?q=...`)

## Design Notes

- Postgres FTS chosen over Elasticsearch for MVP simplicity
- Diacritic-insensitive matching (Timișoara ≡ timisoara)
- URL-driven state for filters and pagination
- Featured listings prioritize verified sellers

## Acceptance Criteria

- Search results are relevance-ranked
- Filters correctly narrow down results
- Pagination works across large result sets
- Homepage loads real data, not mocks
