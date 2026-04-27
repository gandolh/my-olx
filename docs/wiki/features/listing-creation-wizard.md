# Listing Creation Wizard

**Status:** Done

**Summary:** Step-by-step wizard for creating a listing — the most critical seller flow, targeting < 3 minutes end-to-end.

## Requirements

- 5-step wizard: Categorie → Detalii → Fotografii → Locație și preț → Verifică și publică
- Category selection drives the flow
- Draft creation on step 1; subsequent steps PATCH the draft
- Photo upload (1–10 photos) with S3 integration
- Price field (RON) with "negotiable" toggle
- Romanian city picker (autocomplete)
- Weekly post limit (5/week) enforcement

## Design Notes

- Mobile-first design for < 3 minute posting
- Drafts allow resuming interrupted flows
- S3 for image storage with pre-signed URLs
- Client-side validation via Zod

## Acceptance Criteria

- Seller can create and publish a listing in under 3 minutes
- Photo upload works with reordering and deletion
- Post limit (5/week) is enforced via backend
- Successful publication redirects to listing detail page
