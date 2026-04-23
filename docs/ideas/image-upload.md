---
name: image-upload
priority: 1
depends_on: [migrations-and-schema.md]
area: listings
status: idea
---

# S3 image upload for listings

## Context

[backend/src/state.rs:9](../../backend/src/state.rs#L9) has an `aws_sdk_s3::Client` that's built in [backend/src/main.rs:33](../../backend/src/main.rs#L33) — already wired, never used. LocalStack runs on port 4566 ([infrastructure/local/docker-compose.yml:34](../../infrastructure/local/docker-compose.yml#L34)) and a bucket name is configured via `AWS_S3_BUCKET`. A listing's detail page ([frontend/src/modules/listings/pages/ListingDetailPage.tsx:73](../../frontend/src/modules/listings/pages/ListingDetailPage.tsx#L73)) already renders a `ListingGallery` expecting `images: string[]`. The gap is: no way to upload, no DB rows, no URLs served.

This spec delivers: presigned S3 PUT upload, `listing_images` persistence, reorder/delete, and a drag-drop uploader component that drops into the listing wizard at [listing-creation-wizard.md](listing-creation-wizard.md).

Related bug: [docs/issues/dead-s3-redis-wiring.md](../issues/dead-s3-redis-wiring.md) is closed once this ships.

## User stories

- As a seller, when creating or editing a listing I can upload 1–10 photos by drag-drop or file picker on mobile and desktop.
- As a seller, I can reorder photos; the first is the primary/cover image.
- As a seller, I can delete a photo before or after publishing.
- As a buyer, the listing detail page shows photos fast (CDN-served S3 URLs).

## Backend

### Upload flow: presigned PUT

MVP chooses presigned S3 PUT over direct backend upload: avoids streaming large files through Axum, keeps S3 credentials server-side, minimal code.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/listings/:id/images/upload-url` | yes, owner | Returns a presigned PUT URL + pre-computed `s3_key`. Does **not** create the DB row yet. |
| POST | `/listings/:id/images` | yes, owner | After client uploads to S3, this commits the DB row with `s3_key`, `width`, `height`, `bytes`, `position`. |
| PATCH | `/listings/:id/images/reorder` | yes, owner | Body `{ "order": ["<image_id>", ...] }`. Overwrites `position` based on array index. |
| DELETE | `/listings/:id/images/:image_id` | yes, owner | Deletes DB row + S3 object (soft-fail S3 delete; log). |

Alternative (simpler but heavier): single `POST /listings/:id/images` that accepts `multipart/form-data` and streams to S3 from the backend. Axum already has `multipart` feature enabled in [backend/Cargo.toml:7](../../backend/Cargo.toml#L7). Pick this if presigned complexity feels too large — the spec prefers presigned but either is acceptable. Mark choice clearly in PR description.

### Request/response shapes

```rust
// dto/image.rs (new file)

#[derive(Deserialize)]
pub struct UploadUrlRequest {
    pub content_type: String,     // "image/jpeg", "image/png", "image/webp"
    pub filename: String,          // client-supplied, used only for extension
}

#[derive(Serialize)]
pub struct UploadUrlResponse {
    pub upload_url: String,        // presigned PUT, expires in 5min
    pub s3_key: String,            // "listings/<listing_id>/<uuid>.<ext>"
    pub public_url: String,        // CDN / public S3 URL for later GET
}

#[derive(Deserialize)]
pub struct CommitImageRequest {
    pub s3_key: String,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub bytes: Option<i64>,
}

#[derive(Serialize)]
pub struct ImageResponse {
    pub id: Uuid,
    pub listing_id: Uuid,
    pub url: String,
    pub position: i32,
}

#[derive(Deserialize)]
pub struct ReorderRequest { pub order: Vec<Uuid> }
```

### Validation & limits

- `content_type` must be one of `image/jpeg`, `image/png`, `image/webp`.
- Max 10 images per listing (`SELECT COUNT(*) FROM listing_images WHERE listing_id = $1` before issuing upload URL).
- Presigned URL expires in 5 minutes.
- On commit: reject if `s3_key` doesn't match the `listings/<listing_id>/` prefix (prevents cross-listing tampering).
- Max file size **not** enforced on the backend for MVP (S3 PUT size caps at 5GB anyway). Frontend enforces 10MB client-side.

### S3 key scheme

```
listings/<listing_id>/<uuid>.<ext>
```

Bucket policy for dev (LocalStack): public-read on `listings/*`. For prod, use CloudFront in front and sign URLs only on upload; treat `public_url` as CDN URL.

### Files to touch

- `backend/src/routes/images.rs` — new. Nested under `/listings/:id/images` or registered from [backend/src/routes/listings.rs](../../backend/src/routes/listings.rs).
- `backend/src/handlers/images.rs` — new.
- `backend/src/services/images.rs` — new. Holds S3 client + owner-check logic.
- `backend/src/repositories/images.rs` — new. CRUD for `listing_images`.
- `backend/src/dto/image.rs` — new (see shapes above).
- [backend/src/router.rs:17](../../backend/src/router.rs#L17) — mount images routes.
- [backend/src/state.rs](../../backend/src/state.rs) — no change (`s3` already present).
- [backend/src/config.rs](../../backend/src/config.rs) — add `s3_public_base_url` (e.g. `http://localhost:4566/my-olx` dev, CloudFront domain prod).
- [infrastructure/local/initaws/](../../infrastructure/local/) — LocalStack init script to `awslocal s3 mb s3://my-olx && awslocal s3api put-bucket-acl --acl public-read ...`. Create if missing.

### Reuse

- `aws_sdk_s3::Client` already in [AppState](../../backend/src/state.rs#L9).
- `AuthUser` extractor for owner checks.
- `ListingRepository::find_by_id` from [repositories/listings.rs:41](../../backend/src/repositories/listings.rs#L41) — use it to verify listing exists + owner matches.
- `AppError::{NotFound, Forbidden, Validation, RateLimit}` — no new variants needed; use `RateLimit` for "already have 10 images".

## Frontend

### New components

- `ImageUploader` — drag-drop zone + hidden file input. Handles: multi-select (up to `10 - existing.length`), client-side MIME + size validation (10MB), previews via `URL.createObjectURL`, parallel presigned-PUT upload with per-file progress bar, commit call on success.
- `ImageThumbnail` — reorderable tile. Reuse library `@base-ui/react` is headless; for drag-reorder use native HTML5 drag-and-drop or install `@dnd-kit/core` (small, headless). Install at `frontend/package.json` if you go that route.
- `ImageGalleryEditor` — grid of `ImageThumbnail`s + delete button per thumb + "Set as cover" affordance (drag to position 0).

### Services + hooks

```ts
// src/modules/listings/services/images.ts
export async function requestUploadUrl(listingId: string, file: File) { ... }
export async function commitImage(listingId: string, data: CommitImageRequest) { ... }
export async function reorderImages(listingId: string, order: string[]) { ... }
export async function deleteImage(listingId: string, imageId: string) { ... }

// src/modules/listings/hooks/useListingImages.ts
export function useListingImagesMutations(listingId: string) {
  // wraps the above with useMutation + query invalidation
}
```

Use `axios.put(upload_url, file, { headers: { 'Content-Type': file.type }, onUploadProgress })` — the axios instance from [frontend/src/lib/axios.ts](../../frontend/src/lib/axios.ts) is tied to our API origin; for S3 presigned URLs use a **bare** `axios.put` (or `fetch`) so no Bearer token leaks to S3.

### Files to touch

- `frontend/src/modules/listings/components/ImageUploader.tsx` — new.
- `frontend/src/modules/listings/components/ImageThumbnail.tsx` — new.
- `frontend/src/modules/listings/components/ImageGalleryEditor.tsx` — new.
- `frontend/src/modules/listings/services/images.ts` — new.
- `frontend/src/modules/listings/hooks/useListingImages.ts` — new.
- [frontend/src/modules/listings/types/index.ts](../../frontend/src/modules/listings/types/index.ts) — add `ListingImage { id, url, position }`.
- [frontend/public/locales/ro/common.json](../../frontend/public/locales/ro/common.json) — add keys under `imageUpload.*`: drag prompt, file size error, MIME error, upload progress, retry, delete, set-as-cover.

### Existing code to reuse

- [`ListingGallery`](../../frontend/src/modules/listings/components/ListingGallery.tsx) already renders an image array on the public detail page — **no changes** needed once the detail API returns real URLs.
- [`axiosInstance`](../../frontend/src/lib/axios.ts) for commit/reorder/delete calls (they hit our backend with the Bearer token).

## Acceptance criteria

- [ ] Owner of a listing can request an upload URL for a JPEG/PNG/WebP.
- [ ] Non-owner gets 403 when requesting upload URL for another user's listing.
- [ ] 11th image attempt returns 429 (`RateLimit`) with a clear message.
- [ ] Frontend enforces 10MB client-side, rejects unsupported MIMEs with a Romanian error.
- [ ] Multi-file upload runs uploads in parallel (max 3 concurrent); each shows progress.
- [ ] Upload to S3 succeeds and the commit endpoint persists the row with `position = next_free`.
- [ ] Drag-reorder persists via the reorder endpoint; navigating away and back preserves order.
- [ ] Delete removes both the DB row and the S3 object; subsequent GET on the public URL returns 404/403.
- [ ] Listing detail page renders the real S3 URLs (post-[listing-detail-real-api.md](listing-detail-real-api.md)).
- [ ] On a fresh LocalStack bucket, uploaded images are viewable at `http://localhost:4566/my-olx/listings/<id>/<uuid>.jpg`.

## Out of scope

- Image resizing / thumbnail generation (use full image for MVP; add Lambda or `image` crate post-MVP).
- HEIC conversion (iOS default format). If a user picks HEIC, reject with "format unsupported" message.
- EXIF stripping (consider for privacy post-MVP).
- Video uploads.
- CloudFront / production CDN setup (covered by prod-infra spec outside this doc).

## Verification

- Manual:
  1. `docker-compose up -d` and ensure LocalStack bucket `my-olx` exists.
  2. Log in, create a listing, upload 3 photos via the uploader, reorder, delete one.
  3. View the public listing detail page; gallery shows remaining 2 in the expected order.
  4. Try to upload an 11th photo → UI disables uploader with "Ai atins limita de 10 poze".
- Automated:
  - Backend: add `backend/src/services/images.rs::tests` with a mock `S3Client` trait wrapping the SDK, covering owner check, 10-image cap, s3_key prefix validation.
  - Backend integration (optional): spin up LocalStack in CI via `testcontainers-rs`.
  - Frontend: unit test the MIME/size validation utility; render `ImageUploader` in Storybook-style harness if available.
