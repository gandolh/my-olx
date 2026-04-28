#!/bin/sh
# Copies seed listing images into the LocalStack S3 bucket during container init.
# Expects LocalStack to mount ../../seed-data/images at /seed-images (see docker-compose).
set -e

BUCKET_NAME="${BUCKET_NAME:-my-olx-uploads}"
SEED_DIR="${SEED_DIR:-/seed-images}"

if [ ! -d "$SEED_DIR" ]; then
  echo "[upload-seed-images] Seed image directory not found: $SEED_DIR"
  exit 0
fi

awslocal s3api head-bucket --bucket "$BUCKET_NAME" >/dev/null 2>&1 || \
  awslocal s3api create-bucket --bucket "$BUCKET_NAME" >/dev/null 2>&1 || true

found=0
for path in "$SEED_DIR"/*; do
  if [ ! -e "$path" ] || [ ! -f "$path" ]; then
    continue
  fi

  found=1
  filename=${path##*/}
  ext=${filename##*.}

  case "$ext" in
    jpg|JPG|jpeg|JPEG)
      content_type="image/jpeg"
      ;;
    png|PNG)
      content_type="image/png"
      ;;
    webp|WEBP)
      content_type="image/webp"
      ;;
    *)
      content_type="application/octet-stream"
      ;;
  esac

  echo "[upload-seed-images] Uploading $filename to s3://$BUCKET_NAME/$filename"
  awslocal s3 cp "$path" "s3://$BUCKET_NAME/$filename" --acl public-read --content-type "$content_type"

done

if [ "$found" -eq 0 ]; then
  echo "[upload-seed-images] No seed images found in $SEED_DIR"
fi
