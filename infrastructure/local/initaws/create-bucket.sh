#!/bin/sh
set -e

awslocal s3api create-bucket --bucket my-olx-uploads 2>/dev/null || true
awslocal s3api put-bucket-acl --bucket my-olx-uploads --acl public-read
