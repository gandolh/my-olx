# Listing Creation Wizard

**Status:** Planned

**Summary:** Step-by-step wizard for creating a listing — the most critical seller flow, targeting < 3 minutes end-to-end.

## Requirements

- Step-by-step wizard interface (not a single long form)
- Category selection first, drives subsequent smart fields
- Category-specific fields (e.g., cars show make/model/year; real estate shows sqm/rooms)
- Title and description text inputs
- Photo upload: 1–10 photos, drag-and-drop, preview, mobile camera integration
- Price field with "negotiable" option; currency RON
- Romanian location picker (cities/regions)
- Contact preferences: show/hide phone number toggle per listing
- Post limit indicator: "X of 5 free posts used this week"
- Success state with listing preview

## Design Notes

- Mobile-first — most users will create listings on phone
- Smart defaults to minimize required taps
- Clear progress indicator through wizard steps
- Fewer clicks is the primary design constraint

## Acceptance Criteria

- A new seller can create and publish a listing in under 3 minutes on mobile
- Photo upload works via camera on mobile and drag-drop on desktop
- Post limit is clearly communicated and enforced (5/week via backend rate limiting)
- Category-specific fields render correctly for all 9 launch categories
