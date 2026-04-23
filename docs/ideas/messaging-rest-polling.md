---
name: messaging-rest-polling
priority: 2
depends_on: [listing-detail-real-api.md]
area: messaging
status: idea
---

# In-platform messaging (REST + polling)

## Context

[`SellerCard`](../../frontend/src/modules/listings/components/SellerCard.tsx) on the listing detail page needs a "Contactează vânzătorul" button that opens a real chat. [Navbar "Mesaje" link](../../frontend/src/components/layout/Navbar.tsx#L20) targets `/mesaje`, which doesn't exist. No messaging endpoints in the backend. [docs/wiki/features/messaging.md](../wiki/features/messaging.md) originally described WebSocket real-time — this MVP spec targets REST + polling.

This spec delivers: conversations + messages endpoints, a `/mesaje` inbox, a `/mesaje/:id` thread view with 12-second polling, a "Contactează" CTA that opens a thread, and unread-message counts.

When the messaging feature outgrows polling, swap to WebSockets (Axum `ws` feature already enabled in [backend/Cargo.toml:7](../../backend/Cargo.toml#L7)). The REST endpoint surface does not change.

## User stories

- As a logged-in buyer, I can click "Contactează" on a listing and send a first message to the seller.
- As a seller, I see buyer messages in `/mesaje`, sorted by most recent activity.
- As either party, I can reply inside a thread and my message appears within ~12s for the counterparty.
- As either party, I can see how many unread messages I have globally (navbar badge).
- As a seller, I can only reply to conversations about **my** listings.
- As a buyer, a conversation is implicitly created by my first message — I don't manage conversation objects.

## Backend

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/listings/:id/conversations` | yes, not owner | Create-or-fetch. Body `{ "body": "first message..." }`. Returns `{ conversation: {...}, message: {...} }`. |
| GET | `/conversations` | yes | List user's conversations (as buyer OR seller), sorted by `last_message_at DESC`. |
| GET | `/conversations/:id` | yes, participant | Metadata + last message. |
| GET | `/conversations/:id/messages` | yes, participant | Query: `after=<iso8601>` → only messages created after this timestamp. `limit=100` default. |
| POST | `/conversations/:id/messages` | yes, participant | Body `{ "body": "..." }`. Updates `last_message_at`. |
| POST | `/conversations/:id/read` | yes, participant | Marks all messages sent by the counterparty as read (`read_at = NOW()`). |
| GET | `/me/unread-count` | yes | `{ "count": N }`. Used by navbar badge. |

### Create-or-fetch behavior

```
POST /listings/:id/conversations
-> SELECT conversation WHERE listing_id = $id AND buyer_id = me
   IF exists: append message, return (conversation, message)
   IF not exists + caller is owner of listing: 403 (can't message self)
   IF not exists: INSERT conversation, INSERT message, return both
```

The `UNIQUE (listing_id, buyer_id)` constraint from [migrations-and-schema.md](migrations-and-schema.md) enforces one conversation per (listing, buyer) pair.

### Request/response shapes

```rust
// dto/messaging.rs (new file)

#[derive(Deserialize, Validate)]
pub struct StartConversationRequest {
    #[validate(length(min = 1, max = 2000))]
    pub body: String,
}

#[derive(Deserialize, Validate)]
pub struct PostMessageRequest {
    #[validate(length(min = 1, max = 2000))]
    pub body: String,
}

#[derive(Serialize)]
pub struct ConversationSummary {
    pub id: Uuid,
    pub listing: ListingCardResponse,         // small preview
    pub counterparty: UserSummary,
    pub last_message: Option<MessagePreview>,
    pub unread_count: i64,
    pub last_message_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct MessagePreview {
    pub body: String,
    pub sender_id: Uuid,
    pub created_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct MessageResponse {
    pub id: Uuid,
    pub conversation_id: Uuid,
    pub sender_id: Uuid,
    pub body: String,
    pub read_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}
```

### Business rules

- Body length: 1–2000 chars per message.
- Rate limit: 30 messages per user per hour (across all conversations). Return 429 when exceeded.
- Self-messaging forbidden: listing owner cannot start a conversation on their own listing.
- Participant auth: every conversation-scoped endpoint checks `conversation.buyer_id = me OR conversation.seller_id = me`.
- **MVP content filtering**: scan first-message `body` for phone numbers (regex `\b\+?40\d{9}\b|\b0\d{9}\b`) and reject with 422 + message "Nu trimite numere de telefon în mesaje". This pushes contact via the platform's phone-reveal (separate post-MVP feature). Acceptable simplification: log but don't block — pick **reject** for MVP.

### Unread count

```sql
SELECT COUNT(*)
FROM messages m
JOIN conversations c ON c.id = m.conversation_id
WHERE (c.buyer_id = $1 OR c.seller_id = $1)
  AND m.sender_id <> $1
  AND m.read_at IS NULL;
```

### Files to touch

- `backend/src/routes/messaging.rs` — new.
- `backend/src/handlers/messaging.rs` — new.
- `backend/src/services/messaging.rs` — new.
- `backend/src/repositories/conversations.rs` — new.
- `backend/src/repositories/messages.rs` — new.
- `backend/src/dto/messaging.rs` — new.
- [backend/src/router.rs](../../backend/src/router.rs) — mount.

### Reuse

- `AuthUser`, `AppError`.
- `ListingCardResponse` (small listing preview) from [public-browse-and-search.md](public-browse-and-search.md).
- `UserSummary` from [auth-complete.md](auth-complete.md).
- `validator` crate.

## Frontend

### Routes

| Path | Component |
|---|---|
| `/mesaje` | `ConversationsPage` — inbox list. |
| `/mesaje/:conversationId` | `ConversationPage` — thread view with input + message list + polling. |

Both guarded: unauth → redirect to `/autentificare?next=<path>`.

### Entry from listing detail

On the listing detail page's `SellerCard`, "Contactează" button:
- Owner viewing their own listing → button hidden.
- Not logged in → redirect to login with `next=/anunturi/<id>`.
- Logged in non-owner → opens an inline composer modal ("Trimite un mesaj lui <seller name>") with a textarea + "Trimite". On submit: `POST /listings/:id/conversations`, navigate to `/mesaje/<returned.conversation.id>`.

### Polling

```ts
// src/modules/messaging/hooks/useConversationMessages.ts
export function useConversationMessages(conversationId: string) {
  return useQuery({
    queryKey: ['conversation', conversationId, 'messages'],
    queryFn: async () => (await axiosInstance.get(`/conversations/${conversationId}/messages`)).data,
    refetchInterval: 12_000,
    refetchIntervalInBackground: false,  // pause when tab hidden
    enabled: !!conversationId,
  })
}

// src/modules/messaging/hooks/useConversations.ts
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => (await axiosInstance.get('/conversations')).data,
    refetchInterval: 30_000,    // inbox polls slower
  })
}

// src/modules/messaging/hooks/useUnreadCount.ts
export function useUnreadCount() {
  const isAuthed = useAuth((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => (await axiosInstance.get('/me/unread-count')).data.count as number,
    enabled: isAuthed,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
}
```

When the user sends a message, optimistically append to the cached list, then invalidate.

### Read marking

Call `POST /conversations/:id/read` when:
- The thread page mounts.
- The user scrolls to the bottom of the message list.
- A new message arrives from the counterparty while the thread is open.

Throttle to max 1 call every 5 seconds.

### Files to touch

- `frontend/src/modules/messaging/pages/{Conversations,Conversation}Page.tsx` — new.
- `frontend/src/modules/messaging/components/{ConversationListItem,MessageBubble,MessageComposer,EmptyInbox}.tsx` — new.
- `frontend/src/modules/messaging/services/messaging.ts` — new.
- `frontend/src/modules/messaging/hooks/*.ts` — new (see above).
- `frontend/src/modules/messaging/components/ContactSellerModal.tsx` — new (opens from detail page).
- [frontend/src/modules/listings/components/SellerCard.tsx](../../frontend/src/modules/listings/components/SellerCard.tsx) — wire "Contactează" click handler.
- [frontend/src/routes/index.tsx](../../frontend/src/routes/index.tsx) — register `/mesaje` + `/mesaje/:id`.
- [frontend/src/components/layout/Navbar.tsx](../../frontend/src/components/layout/Navbar.tsx) — append badge `(N)` next to "Mesaje" from `useUnreadCount()`.
- [frontend/public/locales/ro/common.json](../../frontend/public/locales/ro/common.json) — add `messaging.*` (empty inbox, placeholder, send, phone-filter warning, time ago labels).

### Reuse

- `@base-ui/react` dialog for `ContactSellerModal`.
- `axiosInstance`.
- Date formatting helpers from [frontend/src/lib/formatters.ts](../../frontend/src/lib/formatters.ts).
- `FormField` + `SubmitButton` from [auth-complete.md](auth-complete.md).

### UI/UX notes

- Message bubbles: sender-right (current user) and counterparty-left (other). Show timestamp on hover or below each bubble.
- Thread list grouping by day headers ("Azi", "Ieri", "12 Martie 2026").
- Composer: textarea with Enter-to-send, Shift+Enter for newline. Disabled while sending.
- "Scrie-i vânzătorului..." / "Scrie-i cumpărătorului..." placeholder based on role.

## Acceptance criteria

- [ ] Listing owner can't start a conversation with themselves (button hidden + backend 403).
- [ ] First message creates a conversation and subsequent attempts on the same listing return the same conversation.
- [ ] Participant-only access: user C gets 403 on A↔B's conversation.
- [ ] Messages with a phone number in the body are rejected with a clear Romanian error.
- [ ] New messages appear within 12 seconds in the counterparty's open thread.
- [ ] Closing the tab pauses polling (via `refetchIntervalInBackground: false`).
- [ ] Navbar shows unread count that updates within 30s of receiving a message.
- [ ] Opening a thread marks counterparty's messages as read within 5s, and unread count drops.
- [ ] Inbox sorts by `last_message_at DESC` and shows a truncated preview of the last message.
- [ ] Rate limiting: 31st message in an hour returns 429; UI shows "Prea multe mesaje — încearcă peste {remaining_minutes} minute".

## Out of scope

- WebSocket real-time (Axum WS feature sits unused on purpose; upgrade later).
- Attachments (images, files).
- Typing indicators, read receipts per message.
- Block / report user. (Report-listing covered separately post-MVP.)
- Group conversations (always 2 participants).
- Push notifications (browser or mobile).
- Message search.

## Verification

- Manual:
  1. Log in as user A, visit a listing by user B, click "Contactează", send "Salut".
  2. Log in as user B in another browser, see conversation in `/mesaje`, reply.
  3. Back in A: within 12s the reply appears.
  4. Navbar "(1)" appears; clicking the thread clears it.
  5. Try sending `0712345678` → rejection error.
- Automated:
  - Backend: unit tests for create-or-fetch idempotency, participant check, phone-regex filter, rate limit.
  - Integration test: A messages B twice; both queries for B's conversations return a single conversation.
  - Frontend: mock-timer test that polling fires at 12s intervals; optimistic-send + invalidate; unread-count hook stops polling when logged out.
