# Romanian Marketplace Platform - Requirements Summary

## Project Vision

Build a seller-friendly classifieds marketplace for Romania that competes with OLX by offering:

- **Lower barriers to entry** - simpler, less expensive posting
- **Better UX** - cleaner, more intuitive interface
- **Seller-first approach** - easier listing creation and management
- **Business venture** - country-wide general-purpose marketplace

---

## Business Model

### Market & Target

- **Geography**: Romania (EU member, GDPR compliance required)
- **Scope**: Country-wide, all categories
- **Users**: Individual sellers and buyers across all demographics

### Monetization Strategy

- **Launch Phase**: Free (no monetization initially)
- **Post Limits**: 5 free listings per user per week
- **Future Revenue Streams** (not for MVP):
  - Business accounts (tools for high-volume sellers)
  - Verification badges
  - Analytics dashboards
- **Key Principle**: No algorithm favoritism for paying users - fair discovery for all

### Payment Methods

- Card payments (handled by dev team)
- Cash on delivery

---

## Core Features

### 1. Authentication & Security

- **Sign-up Options**: Email/password + social auth (Google, Facebook)
- **Verification**:
  - Email verification (confirmation link)
  - Phone verification required for posting
  - OTP via SMS or Authenticator app
- **Optional**: Identity verification for seller badges (Romanian e-ID or manual review)

### 2. Listing Management

#### Posting Flow (Critical - Seller Experience)

- Step-by-step wizard interface
- Category selection first (all major categories)
- Smart category-specific fields
- Title & description
- Photo upload: 1-10 photos, drag-drop interface
- Price field with "negotiable" option
- Romanian location picker (cities/regions)
- Contact preferences: show/hide phone number toggle
- **Post limits**: 5 free posts per week per user

#### Categories (Launch with All)

- Electronics
- Vehicles
- Real Estate
- Home & Garden
- Fashion
- Jobs
- Services
- Hobbies & Sports
- For Free (giveaways/donations)

#### Listing Lifecycle

- **Duration**: 30 days active
- **Renewal**: Free but requires manual user action
- **Notifications**: Email/push when listing expires/needs renewal
- **Goal**: Filter out forgotten announcements

### 3. Communication Between Users

#### Contact Methods

- **Primary**: In-platform messaging system (chat interface)
  - Real-time chat
  - Keeps users on platform
  - Allows moderation
- **Secondary**: Phone number reveal
  - Seller chooses to show/hide per listing
  - Buyers can click "Reveal Phone Number" if seller enabled
  - Encourages platform discussion but allows direct contact

#### Safety Features

- Report/block users
- Message filtering for spam/phone numbers in initial contact
- Moderation capability

### 4. Search & Discovery

#### Search System

- **Technology**: Elasticsearch (full-text search)
- **Romanian Support**: Handle diacritics (ă, â, î, ș, ț)
- **Search across**: Title, description, category-specific fields

#### Filters & Sorting

- **Location**: Romanian cities/regions selector
- **Price range**: Slider
- **Category-specific filters**: Brand, condition, size, etc.
- **Date posted**: Newest first (default)
- **Verified sellers**: Toggle
- **Sorting options**: Newest, lowest price, highest price, nearest location

#### Discovery Features

- Homepage: Featured listings + recent in each category
- Save for later (favorites)
- Saved searches with notifications for new matches

### 5. User Dashboard

#### For Sellers

- Active listings overview
- Listings requiring renewal (expired/expiring soon)
- Weekly post limit counter (X of 5 used)
- Messages/inquiries
- Future: Analytics (views, message count)

#### For Buyers

- Saved listings (favorites)
- Active conversations
- Saved searches

---

## Technical Decisions

### Confirmed Stack

- **Search**: Elasticsearch (handles Romanian diacritics, typo tolerance)
- **Frontend**: React + Next.js (SEO-critical) + TailwindCSS + shadcn/ui
- **Database**: PostgreSQL (recommended)
- **File Storage**: AWS S3 or Cloudflare R2 (photos)
- **Real-time**: WebSockets or Firebase (messaging)
- **Caching**: Redis (sessions, rate limiting)

### Pending Decisions

- Backend framework (Node.js + Express vs Python + FastAPI)
- Hosting provider (AWS/GCP vs DigitalOcean/Hetzner)
- Email/SMS providers (SendGrid/Twilio vs local Romanian providers)

---

## Romanian-Specific Requirements

### Localization

- Romanian language throughout
- Full diacritics support (ă, â, î, ș, ț)
- Romanian city/region database
- RON currency

### Compliance

- GDPR compliance (EU data privacy)
- Romanian consumer protection laws
- Tax regulations

### UX Considerations

- Mobile-first (Romanian users heavily mobile-oriented)
- Local payment preferences (cards + cash on delivery)

---

## Key Differentiators from OLX

1. **Simpler posting** - fewer steps, clearer interface
2. **Lower cost** - 5 free posts/week vs OLX's paid model
3. **Seller-focused** - designed around seller pain points
4. **Cleaner UI** - less visual clutter, modern design
5. **Fair algorithm** - no preferential treatment for paying users
6. **Better communication** - in-platform chat + optional phone reveal

---

## Open Questions for Next Phase

### Technical Architecture

1. Final backend language/framework choice?
2. Team's existing technical expertise?
3. Self-hosting vs cloud provider preference?
4. Preferred email/SMS providers?

### Implementation

1. Moderation strategy - immediate posting or review queue?
2. Spam prevention mechanisms?
3. Image optimization and CDN strategy?
4. Real-time notification system design?

### Design

1. Mobile navigation pattern (bottom bar vs hamburger)?
2. Category-specific field UX approach?
3. Photo upload on mobile (camera integration)?
4. Trust signal presentation (verified badges, response time)?
5. View count visibility for sellers?

---

## Next Steps

1. ✅ **Complete requirements gathering**
2. ✅ **Create design brief**
3. ⏳ **Finalize technical architecture** (pending team expertise input)
4. ⏳ **Design phase** - wireframes, mockups, component library
5. ⏳ **MVP implementation roadmap**
6. ⏳ **Development phase**

---

## Success Metrics (Goals)

### User Experience

- Time to create first listing: < 3 minutes
- Mobile listing creation completion rate: > 80%
- Buyer-to-seller contact rate: > 15%

### Business

- Return user rate (platform stickiness)
- Listings per active user
- Message response rate
- Time to first renewal

---

## Files Created

- `/home/gandolh/projects/my-olx/design-brief.md` - Comprehensive design brief for designer
- `/home/gandolh/projects/my-olx/requirements-summary.md` - This document

---

_Last updated: April 3, 2026_
