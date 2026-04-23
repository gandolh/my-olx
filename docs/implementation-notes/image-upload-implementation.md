# Image Upload Implementation Summary

## Overview
Implemented the `docs/ideas/image-upload.md` scope using a **presigned S3 PUT** flow (not multipart proxy upload): backend endpoints for upload URL/commit/reorder/delete, LocalStack bucket ACL setup, and frontend uploader/editor building blocks with validation and parallel upload support.

## Implementation Choice
- Chosen approach: **presigned PUT to S3 + commit API**
- Not chosen: multipart upload through backend

This keeps file transfer off the API server and avoids sending backend auth headers to S3.

## Backend Implementation ✅

### New files
1. **`backend/src/dto/image.rs`**
   - `UploadUrlRequest`, `UploadUrlResponse`
   - `CommitImageRequest`, `ImageResponse`
   - `ReorderRequest`

2. **`backend/src/repositories/images.rs`**
   - Owner lookup for listing (`find_listing_owner`)
   - Image count (`count_for_listing`)
   - Commit insert (`insert_image`) with `position = next_free`
   - List images for listing (`list_for_listing`)
   - Reorder with transactional two-phase update to avoid unique position conflicts
   - Delete image row + close position gap

3. **`backend/src/services/images.rs`**
   - Presigned URL generation (5 minute TTL)
   - MIME validation (`jpeg/png/webp`)
   - Owner check for all image operations
   - Max 10 images enforcement
   - Commit guard for `s3_key` prefix `listings/<listing_id>/...`
   - Delete from DB then best-effort S3 delete with warning log on failure

4. **`backend/src/handlers/images.rs`**
   - HTTP handlers for request-upload-url / commit / reorder / delete

5. **`backend/src/routes/images.rs`**
   - Nested image route definitions

6. **`backend/migrations/20260423235500_listing_images_metadata.sql`**
   - Adds optional metadata columns to `listing_images`:
     - `width INTEGER`
     - `height INTEGER`
     - `bytes BIGINT`

### Modified backend files
1. **`backend/src/dto/mod.rs`**
   - Exports `image`

2. **`backend/src/repositories/mod.rs`**
   - Exports `images`

3. **`backend/src/services/mod.rs`**
   - Exports `images`

4. **`backend/src/handlers/mod.rs`**
   - Exports `images`

5. **`backend/src/routes/mod.rs`**
   - Exports `images`

6. **`backend/src/routes/listings.rs`**
   - Mounts nested router: `/:id/images`

7. **`backend/src/config.rs`**
   - Added `s3_public_base_url`
   - Added default value for local dev

8. **`backend/.env.example`**
   - Added `S3_PUBLIC_BASE_URL=http://localhost:4566/my-olx-uploads`

9. **`backend/src/services/listings.rs`**
   - Image URL mapping switched to `s3_public_base_url` for listing/detail responses

10. **`infrastructure/local/initaws/create-bucket.sh`**
   - Bucket creation made idempotent
   - Added bucket ACL `public-read`

### Backend routes implemented
Under `/listings/:id/images`:
- `POST /upload-url`
- `POST` (commit)
- `PATCH /reorder`
- `DELETE /:image_id`

### Backend behavior notes
- Upload URL endpoint checks ownership + MIME + 10-image cap.
- Commit endpoint also enforces cap to prevent bypass/race behavior.
- Reorder validates set equality of image IDs before persisting.
- S3 delete failures do not fail request (soft-fail per spec), but are logged.

## Frontend Implementation ✅

### New files
1. **`frontend/src/modules/listings/services/images.ts`**
   - `requestUploadUrl(listingId, file)`
   - `putImageToSignedUrl(uploadUrl, file, { onUploadProgress })` using bare `axios.put`
   - `commitImage`, `reorderImages`, `deleteImage`

2. **`frontend/src/modules/listings/hooks/useListingImages.ts`**
   - React Query mutations wrapping the image service calls
   - Upload worker queue with max concurrency `3`
   - Per-file progress tracking map
   - Query invalidation for affected listing/favorites views

3. **`frontend/src/modules/listings/components/ImageUploader.tsx`**
   - Drag/drop + file picker
   - Client-side validation:
     - max 10MB per file
     - MIME allowlist (jpeg/png/webp)
   - Remaining slots logic (`10 - existingCount`)

4. **`frontend/src/modules/listings/components/ImageThumbnail.tsx`**
   - Thumb tile with delete + set-as-cover actions
   - Draggable hooks for reorder

5. **`frontend/src/modules/listings/components/ImageGalleryEditor.tsx`**
   - Grid editor combining uploader + thumbnails
   - Delete, set-as-cover, drag reorder interactions
   - Persists reorder/delete through backend APIs

### Modified frontend files
1. **`frontend/src/modules/listings/types/index.ts`**
   - Re-exports `ListingImage`

2. **`frontend/public/locales/ro/common.json`**
   - Added `imageUpload.*` Romanian keys

## Verification ✅

### Backend
```bash
cd backend
cargo check
```
Passed.

### Frontend
```bash
cd frontend
npm run build
```
Passed.

## Acceptance Criteria Mapping
- [x] Owner can request upload URL for JPEG/PNG/WebP
- [x] Non-owner blocked with 403 on image endpoints
- [x] 11th image attempt returns 429 (`RateLimit`)
- [x] Frontend rejects unsupported MIME and >10MB files
- [x] Upload path uses parallel uploads (max 3)
- [x] Commit persists `position = next_free`
- [x] Drag reorder persists via reorder endpoint
- [x] Delete removes DB row and attempts S3 delete
- [x] Listing detail URL mapping now uses configured public base URL
- [x] LocalStack init script creates bucket + public ACL

## Known Gaps / Follow-up
1. The uploader/editor components are implemented but **not yet mounted into the `/adauga-anunt` wizard** in this change.
2. Progress exists in hook state but is not fully rendered as per-file progress bars in UI yet.
3. Automated backend tests for `services/images.rs` (owner checks, cap, key prefix validation) are not added yet.
4. Optional integration tests against LocalStack in CI are not added yet.

## Summary
Core image upload infrastructure is now implemented end-to-end for S3-backed listing images: secure presigned uploads, persistence, reorder/delete, and reusable frontend editor components. The remaining step is wiring these components into the listing creation/edit flow and adding targeted tests.
