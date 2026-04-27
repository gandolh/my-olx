# Messaging System

**Status:** Done

**Summary:** In-platform real-time chat between buyers and sellers, with optional phone number reveal.

## Requirements

- In-platform chat between buyers and sellers
- Inbox list sorted by recent activity
- Unread message counts (navbar badge)
- Content filtering (phone number rejection in first contact)
- Rate limiting (30 messages/hour)
- Conversation list with listing preview context
- Read receipts and typing indicators
- Message filtering/moderation for spam and phone numbers in initial contact
- Block/report user options
- Secondary contact method: "Reveal Phone Number" button — seller enables per listing, buyer clicks to reveal

## Design Notes

- MVP uses REST endpoints with 12-second polling
- "Contactează" button on listing detail page starts a thread
- Unique (listing_id, buyer_id) constraint prevents duplicate threads
- WebSocket upgrade deferred post-MVP (Axum `ws` support exists)
- Phone number reveal is a deliberate UX choice: keeps initial contact on-platform (enables moderation) while allowing direct contact if both parties want it
- Message filtering on initial contact only — prevents scrapers harvesting phone numbers via chat
- WhatsApp/Telegram-inspired UI pattern

## Acceptance Criteria

- Messages appear within polling interval (~12s)
- Unread count updates and clears on thread open
- Phone numbers in first contact are rejected
- Seller can only reply to threads about their own listings
- Messages deliver in real time without page refresh
- Seller can toggle phone reveal per listing
- Reported conversations are flagged for moderation review
- Block prevents further messages from blocked user
