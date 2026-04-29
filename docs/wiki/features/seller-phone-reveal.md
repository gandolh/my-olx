# Seller Phone Reveal

**Status:** Done

**Summary:** Authenticated users can reveal a seller's verified phone number from the listing detail page by clicking "Arată Numărul de Telefon". Unauthenticated users are redirected to login.

## Requirements

- "Arată Numărul de Telefon" button on `PricingCard` (visible to non-owners only)
- Clicking while logged out redirects to `/autentificare`
- Clicking while logged in fetches the seller's verified phone number
- On success, button is replaced by a `tel:` link showing the number
- If seller has no verified phone, shows "Număr indisponibil"
- Listing owners do not see the button (they see the edit link instead)

## Design Notes

- Backend endpoint `GET /listings/:id/seller-phone` requires `AuthUser` extractor — returns 401 without token
- Returns 403 if the requester is the listing owner
- Returns 404 if the seller has no verified phone (`phone_verified = TRUE` check)
- Phone number stored in `users.phone`; only exposed after `phone_verified = TRUE`
- Frontend state: `phone: string | null` toggled on click; no React Query — one-shot fetch with local state is sufficient

## API

`GET /listings/:id/seller-phone` — requires `Authorization: Bearer <token>`

Response: `{ "phone": "07xx..." }`

Errors: 401 Unauthorized, 403 Forbidden (owner), 404 Not Found (no verified phone)

## Acceptance Criteria

- Logged-out user clicks button → redirected to `/autentificare`
- Logged-in non-owner with seller having a verified phone → number displayed as `tel:` link
- Logged-in non-owner with seller having no verified phone → "Număr indisponibil"
- Listing owner → button not rendered at all
