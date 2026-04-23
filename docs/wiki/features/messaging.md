# Messaging System

**Status:** Planned

**Summary:** In-platform real-time chat between buyers and sellers, with optional phone number reveal.

## Requirements

- Real-time chat (WebSocket-based)
- Conversation list with listing preview context
- Read receipts and typing indicators
- Message filtering/moderation for spam and phone numbers in initial contact
- Block/report user options
- Secondary contact method: "Reveal Phone Number" button — seller enables per listing, buyer clicks to reveal

## Design Notes

- WebSocket support already included in Axum dependency (`ws` feature)
- Phone number reveal is a deliberate UX choice: keeps initial contact on-platform (enables moderation) while allowing direct contact if both parties want it
- Message filtering on initial contact only — prevents scrapers harvesting phone numbers via chat
- WhatsApp/Telegram-inspired UI pattern

## Acceptance Criteria

- Messages deliver in real time without page refresh
- Seller can toggle phone reveal per listing
- Reported conversations are flagged for moderation review
- Block prevents further messages from blocked user
