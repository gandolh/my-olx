# Search & Discovery

**Status:** Planned

**Summary:** Elasticsearch-powered full-text search with Romanian diacritic support, filters, and a discovery homepage.

## Requirements

- Elasticsearch for full-text search (title, description, category fields)
- Full Romanian diacritic support: ă, â, î, ș, ț
- Filters: location (Romanian cities/regions), price range, category-specific, date posted, verified sellers
- Sort options: newest, price low-to-high, price high-to-low, nearest
- Grid/list view toggle on results page
- Homepage: category tiles + recent/featured listings per category
- Save for later (favorites) with heart icon
- Saved searches with notifications for new matches

## Design Notes

- Elasticsearch chosen specifically for Romanian diacritic handling and typo tolerance
- Location picker needs a Romanian city/region database
- Saved search notifications require a background job (not part of MVP API scope)

## Acceptance Criteria

- Search returns results for queries with and without diacritics (e.g., "masina" finds "mașină")
- Filters narrow results correctly
- Favorites persist across sessions
