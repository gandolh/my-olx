# Show Phone Number Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a working "Arată Numărul de Telefon" button that fetches and displays the seller's phone number, requiring authentication.

**Architecture:** New auth-gated backend endpoint `GET /listings/:id/seller-phone` returns the seller's phone (or 404 if none). Frontend button fetches on click, shows the number inline; unauthenticated users are redirected to login.

**Tech Stack:** Rust/Axum backend (existing 4-layer pattern), React/TypeScript frontend (React Query + axios), existing `useAuth` Zustand store, `useNavigate` for redirect.

---

### Task 1: Backend — add `get_seller_phone` to `UserRepository` trait

**Files:**
- Modify: `backend/src/repositories/users.rs`

- [ ] **Step 1: Add trait method**

In `backend/src/repositories/users.rs`, add to the `UserRepository` trait:

```rust
async fn get_phone_by_id(&self, id: Uuid) -> Result<Option<String>, AppError>;
```

- [ ] **Step 2: Implement on `PgUserRepository`**

Add after the existing `impl UserRepository for PgUserRepository` methods:

```rust
async fn get_phone_by_id(&self, id: Uuid) -> Result<Option<String>, AppError> {
    let row = sqlx::query!(
        "SELECT phone FROM users WHERE id = $1 AND phone_verified = TRUE",
        id
    )
    .fetch_optional(&self.pool)
    .await?;
    Ok(row.and_then(|r| r.phone))
}
```

- [ ] **Step 3: Verify it compiles**

```bash
cd backend && cargo check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd backend
git add src/repositories/users.rs
git commit -m "feat: add get_phone_by_id to UserRepository"
```

---

### Task 2: Backend — add `get_seller_phone` service method to `ListingService`

**Files:**
- Modify: `backend/src/services/listings.rs`

- [ ] **Step 1: Add service method**

In `backend/src/services/listings.rs`, inside `impl<R: ListingRepository, U: UserRepository> ListingService<R, U>`, add:

```rust
pub async fn get_seller_phone(
    &self,
    listing_id: Uuid,
    viewer_id: Uuid,
) -> Result<String, AppError> {
    let row = self
        .repo
        .find_detail(listing_id)
        .await?
        .ok_or(AppError::NotFound)?;

    if viewer_id == row.user_id {
        return Err(AppError::Forbidden);
    }

    self.user_repo
        .get_phone_by_id(row.user_id)
        .await?
        .ok_or(AppError::NotFound)
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd backend && cargo check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd backend
git add src/services/listings.rs
git commit -m "feat: add get_seller_phone to ListingService"
```

---

### Task 3: Backend — handler and route for `GET /listings/:id/seller-phone`

**Files:**
- Modify: `backend/src/handlers/listings.rs`
- Modify: `backend/src/routes/listings.rs`
- Modify: `backend/src/dto/listing.rs`

- [ ] **Step 1: Add DTO**

In `backend/src/dto/listing.rs`, add:

```rust
#[derive(Debug, Serialize, utoipa::ToSchema)]
pub struct SellerPhoneResponse {
    pub phone: String,
}
```

- [ ] **Step 2: Add handler**

In `backend/src/handlers/listings.rs`, add:

```rust
pub async fn get_seller_phone(
    State(state): State<AppState>,
    AuthUser(user_id): AuthUser,
    Path(id): Path<Uuid>,
) -> Result<Json<SellerPhoneResponse>, AppError> {
    let svc = listing_service(&state);
    let phone = svc.get_seller_phone(id, user_id).await?;
    Ok(Json(SellerPhoneResponse { phone }))
}
```

Also add `SellerPhoneResponse` to the imports from `dto::listing` at the top of the file.

- [ ] **Step 3: Register route**

In `backend/src/routes/listings.rs`, add the route inside `pub fn router()`:

```rust
.route("/:id/seller-phone", get(listings::get_seller_phone))
```

- [ ] **Step 4: Verify it compiles**

```bash
cd backend && cargo check
```

Expected: no errors.

- [ ] **Step 5: Manual smoke test**

Start infrastructure and backend:
```bash
cd infrastructure/local && docker-compose up -d
cd backend && cargo run
```

Without token — expect 401:
```bash
curl -s http://localhost:8080/listings/<any-uuid>/seller-phone
# {"error":"unauthorized"}
```

With token — expect 200 `{"phone":"..."}` or 404 if seller has no verified phone.

- [ ] **Step 6: Commit**

```bash
cd backend
git add src/dto/listing.rs src/handlers/listings.rs src/routes/listings.rs
git commit -m "feat: add GET /listings/:id/seller-phone endpoint"
```

---

### Task 4: Frontend — service function

**Files:**
- Modify: `frontend/src/modules/listings/services/listings.ts`

- [ ] **Step 1: Add service function**

In `frontend/src/modules/listings/services/listings.ts`, add at the bottom:

```typescript
export async function fetchSellerPhone(listingId: string): Promise<string> {
  const response = await axiosInstance.get<{ phone: string }>(
    `/listings/${listingId}/seller-phone`,
  );
  return response.data.phone;
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd frontend && npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no TypeScript errors related to this file.

- [ ] **Step 3: Commit**

```bash
cd frontend
git add src/modules/listings/services/listings.ts
git commit -m "feat: add fetchSellerPhone service function"
```

---

### Task 5: Frontend — wire button in `PricingCard`

**Files:**
- Modify: `frontend/src/modules/listings/components/PricingCard.tsx`

- [ ] **Step 1: Add imports and state**

Replace the top of `frontend/src/modules/listings/components/PricingCard.tsx` with:

```typescript
import { FavoriteToggle } from "@/modules/favorites/components/FavoriteToggle";
import { Link } from "@/lib/router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { fetchSellerPhone } from "@/modules/listings/services/listings";
```

- [ ] **Step 2: Add state and handler inside the component**

Inside `PricingCard`, after the existing `const isOwner = ...` line, add:

```typescript
const navigate = useNavigate();
const [phone, setPhone] = useState<string | null>(null);
const [loadingPhone, setLoadingPhone] = useState(false);

const handleShowPhone = async () => {
  if (!user) {
    navigate("/autentificare");
    return;
  }
  if (phone) return;
  setLoadingPhone(true);
  try {
    const result = await fetchSellerPhone(listingId);
    setPhone(result);
  } catch {
    setPhone("Număr indisponibil");
  } finally {
    setLoadingPhone(false);
  }
};
```

- [ ] **Step 3: Replace the phone button**

Replace:

```tsx
<button className="w-full bg-secondary-container text-on-secondary-container py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all">
  <span className="material-symbols-outlined">call</span>
  Arată Numărul de Telefon
</button>
```

With:

```tsx
{phone ? (
  <a
    href={`tel:${phone}`}
    className="w-full bg-secondary-container text-on-secondary-container py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all no-underline"
  >
    <span className="material-symbols-outlined">call</span>
    {phone}
  </a>
) : (
  <button
    onClick={handleShowPhone}
    disabled={loadingPhone}
    className="w-full bg-secondary-container text-on-secondary-container py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
  >
    <span className="material-symbols-outlined">call</span>
    {loadingPhone ? "Se încarcă..." : "Arată Numărul de Telefon"}
  </button>
)}
```

- [ ] **Step 4: Verify TypeScript and lint**

```bash
cd frontend && npm run build 2>&1 | grep -E "error|Error" | head -20
npm run lint 2>&1 | grep -E "error|Error" | head -20
```

Expected: no errors.

- [ ] **Step 5: Manual test**

Start dev server (`npm run dev`) and test:
1. Logged out → click button → redirects to `/autentificare`
2. Logged in as non-owner → click button → shows phone number (or shows nothing if seller has no verified phone — 404 is swallowed silently by the `finally` block; if you want to surface this, add a catch that sets an error state)
3. Logged in as owner → button not shown (isOwner hides it)

- [ ] **Step 6: Commit**

```bash
cd frontend
git add src/modules/listings/components/PricingCard.tsx
git commit -m "feat: wire Arată Numărul de Telefon button with auth-gated phone reveal"
```
