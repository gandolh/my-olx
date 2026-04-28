#!/bin/sh
set -e

BUCKET_NAME="${BUCKET_NAME:-my-olx-uploads}"
AWS_REGION="${AWS_DEFAULT_REGION:-eu-central-1}"

if ! awslocal s3api head-bucket --bucket "$BUCKET_NAME" >/dev/null 2>&1; then
  if [ "$AWS_REGION" = "us-east-1" ]; then
    awslocal s3api create-bucket --bucket "$BUCKET_NAME"
  else
    awslocal s3api create-bucket --bucket "$BUCKET_NAME" \
      --create-bucket-configuration LocationConstraint="$AWS_REGION"
  fi
fi

awslocal s3api put-bucket-acl --bucket "$BUCKET_NAME" --acl public-read 2>/dev/null || true
