#!/usr/bin/env bash
# Fetches only site-relevant images. Re-run hourly until done.
# Usage: bash docs/html-base/scripts/fetch_site_images.sh
set -euo pipefail
cd "$(cd "$(dirname "$0")/../../.." && pwd)"

python3 docs/html-base/scripts/fetch_images.py \
  --config docs/html-base/scripts/preprocessed/image-config-site.json \
  --output src/assets/images/photos \
  --attribution ATTRIBUTION.md

echo ""
HAVE=$(ls src/assets/images/photos/*.jpg 2>/dev/null | wc -l)
echo "Total photos on disk: $HAVE"
