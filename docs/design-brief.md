# Design Brief: Romanian Classifieds Marketplace Platform

## Project Overview

Design a modern, seller-friendly classifieds marketplace for Romania that prioritizes simplicity and accessibility over OLX's complex, fee-heavy model.

## Business Context

- **Market**: Country-wide Romanian marketplace
- **Target Users**: Individual sellers and buyers across all demographics
- **Key Differentiator**: Simpler UX, lower barriers to entry, seller-first approach
- **Monetization**: Free initially (5 posts/week limit per user)
- **Future Revenue**: Business accounts, verification badges, analytics (without algorithm preference)

## Core Principles

1. **Seller-First**: Make listing creation fast, intuitive, and painless
2. **Simplicity**: Cleaner, less cluttered interface than OLX
3. **Trust**: Built-in safety features and verification options
4. **Accessibility**: Works for all users regardless of technical proficiency
5. **Mobile-First**: Romanian users are heavily mobile-oriented

## Key User Flows to Design

### 1. Registration & Authentication

- Email/password or social login (Google, Facebook)
- OTP verification (SMS or Authenticator app)
- Clean, minimal signup flow
- Phone verification required for posting

### 2. Listing Creation (Critical - Seller Experience)

**Requirements:**

- Step-by-step wizard approach
- Category selection first (all major categories: Electronics, Vehicles, Real Estate, Home & Garden, Fashion, Jobs, Services, Hobbies & Sports, For Free)
- Smart category-specific fields (e.g., car listings show make/model/year; real estate shows sqm/rooms)
- Title & description (clear, simple text inputs)
- Photo upload: Drag-drop, preview, 1-10 photos
- Price field with "negotiable" option
- Location picker (Romanian cities/regions)
- Contact preferences: show/hide phone number toggle
- Clear post limits indicator (5 free/week)
- Success state with listing preview

**Design Focus**: Make this feel effortless - fewer clicks, smart defaults, clear progress

### 3. Browsing & Search

- Homepage with category tiles + recent/featured listings
- Powerful search bar (Elasticsearch-powered, handles Romanian diacritics: ă, â, î, ș, ț)
- Filter sidebar:
  - Location (Romanian cities/regions)
  - Price range slider
  - Category-specific filters
  - Date posted
  - Verified sellers toggle
- Sort options: Newest, Price (low-high), Price (high-low), Distance
- Grid/list view toggle
- Listing cards: Clear photo, price, title, location, date

### 4. Listing Detail Page

- Large photo gallery (swipeable on mobile)
- Price prominently displayed
- Seller info section (verified badge if applicable, join date, active listings count)
- Category-specific details clearly laid out
- Description
- Contact options:
  - Primary: "Send Message" button (in-platform chat)
  - Secondary: "Reveal Phone Number" button (if seller enabled)
- Save for later (favorites) heart icon
- Report listing option
- Share button

### 5. Messaging System

- Clean chat interface (WhatsApp/Telegram-inspired)
- Conversation list with listing preview
- Message filtering/moderation for spam
- Block/report user options
- Read receipts
- Typing indicators

### 6. User Dashboard

**For Sellers:**

- My active listings (with renewal reminders)
- Listings requiring renewal (expired/expiring soon)
- Weekly post limit counter
- Messages/inquiries
- Saved searches
- Analytics (future: views, messages received)

**For Buyers:**

- Saved listings (favorites)
- Active conversations
- Saved searches with new results notifications

### 7. Renewal Flow

- Email/push notification when listing expires
- One-click renewal button
- Clear expiration dates on dashboard

## Design Requirements

### Visual Style

- **Modern & Clean**: Minimalist, whitespace-focused
- **Trust Signals**: Professional but approachable
- **Romanian Context**: Use Romanian language, local imagery
- **Color Palette**: Friendly, trustworthy (avoid OLX purple - differentiate)
- **Typography**: Highly readable, supports Romanian diacritics perfectly

### Components Needed

- Category cards/tiles
- Listing cards (grid & list variants)
- Photo gallery/carousel
- Search filters panel
- Chat bubbles
- Form inputs optimized for Romanian
- Location picker (Romanian cities)
- Price input with currency (RON)
- Status badges (verified, featured, etc.)
- Empty states (no listings, no messages, etc.)
- Loading states
- Error states

### Responsive Design

- **Mobile-first**: Primary device for Romanian users
- **Tablet**: Optimized grid layouts
- **Desktop**: Take advantage of screen real estate without overwhelming

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader friendly
- High contrast modes
- Touch targets (44px minimum on mobile)

## Technical Constraints

- React + Next.js frontend
- TailwindCSS for styling
- shadcn/ui component library
- Must support Romanian characters (ă, â, î, ș, ț)
- GDPR-compliant UI elements (cookie consent, data privacy)
- Fast performance (lazy loading, optimized images)

## Competitive Differentiation from OLX

- **Simpler**: Less visual noise, clearer hierarchy
- **Faster**: Fewer clicks to post, search, contact
- **Friendlier**: More encouraging for first-time sellers
- **Transparent**: Clear post limits, no hidden fees messaging
- **Modern**: Contemporary design patterns, not outdated

## Success Metrics (Design Goals)

- Time to create first listing < 3 minutes
- Mobile listing creation completion rate > 80%
- Buyer-to-seller contact rate > 15%
- Return user rate (design stickiness)

## Deliverables Requested

1. **User flow diagrams** for key journeys
2. **Wireframes** for critical screens (mobile + desktop)
3. **High-fidelity mockups** for:
   - Homepage
   - Category browsing
   - Listing creation flow
   - Listing detail page
   - Messaging interface
   - User dashboard
4. **Component library** documentation
5. **Responsive breakpoints** strategy
6. **Interaction patterns** (animations, transitions)

## Questions for Designer

1. Should we use a bottom navigation bar on mobile (common in marketplaces) or hamburger menu?
2. What's the best way to handle category-specific fields without overwhelming the form?
3. How to make photo upload delightful on mobile (camera integration)?
4. Should we show listing view counts to sellers, or does that create anxiety?
5. How to surface trust signals (verified users, response time) without cluttering?

## Next Steps

1. Review and approve design direction
2. Create design system and component library
3. Build interactive prototype
4. User testing with Romanian users
5. Iterate based on feedback
6. Hand off to development team
