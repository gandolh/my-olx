# Image Upload

**Status:** Done

**Status:** Done

**Summary:** S3-backed image upload for listings with pre-signed URLs.

## Requirements

- Drag-and-drop uploader (1–10 images)
- Image reordering and deletion
- Pre-signed URL flow (Backend gives URL, Frontend PUTs to S3)
- Automatic cleanup of orphaned images (post-MVP)

## Design Notes

- AWS SDK (S3) used in backend
- LocalStack for local development
- Public-read bucket for served images
- Thumbnails/resizing handled via S3 events or proxy (post-MVP)

## Acceptance Criteria

- Images uploaded during listing creation appear on the detail page
- Reordering images updates the cover photo
