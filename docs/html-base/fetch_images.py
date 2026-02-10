#!/usr/bin/env python3
"""
Batch-download images from Unsplash using queries from image-config.json.

Reads the preprocessed image manifest and downloads one photo per entry,
saving to the specified output directory with descriptive filenames.
Generates/appends to ATTRIBUTION.md with photographer credits.

Requires:
  UNSPLASH_ACCESS_KEY environment variable (or .env file)

Usage:
  python3 fetch_images.py
  python3 fetch_images.py --config preprocessed/image-config.json --output src/assets/images/photos
  python3 fetch_images.py --dry-run   # Show what would be downloaded without fetching
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path
from typing import Dict, List, Optional, Sequence

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_CONFIG = SCRIPT_DIR / "preprocessed" / "image-config.json"
DEFAULT_OUTPUT = SCRIPT_DIR / ".." / "astro-local-business-v2" / "src" / "assets" / "images" / "photos"
DEFAULT_ATTRIBUTION = SCRIPT_DIR / ".." / "astro-local-business-v2" / "src" / "assets" / "images" / "ATTRIBUTION.md"

UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos"
REQUEST_DELAY_S = 0.6  # Stay under Unsplash's 50 req/hour free tier

# ============================================================
# Environment / API key
# ============================================================

def find_api_key() -> Optional[str]:
    """Find the Unsplash API key from env var or .env files."""
    key = os.environ.get("UNSPLASH_ACCESS_KEY")
    if key:
        return key

    # Search for .env in current dir and up to 3 parents
    search_dir = SCRIPT_DIR
    for _ in range(4):
        env_file = search_dir / ".env"
        if env_file.is_file():
            for line in env_file.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line.startswith("UNSPLASH_ACCESS_KEY="):
                    return line.split("=", 1)[1].strip().strip("\"'")
        search_dir = search_dir.parent

    return None


# ============================================================
# Unsplash API
# ============================================================

def search_unsplash(query: str, api_key: str, orientation: Optional[str] = None) -> Optional[Dict]:
    """Search Unsplash and return the top result."""
    params = {
        "query": query,
        "per_page": "1",
        "content_filter": "high",
        "client_id": api_key,
    }
    if orientation:
        params["orientation"] = orientation

    url = f"{UNSPLASH_SEARCH_URL}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"Accept": "application/json"})

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"  API error {e.code}: {e.reason}", file=sys.stderr)
        return None
    except urllib.error.URLError as e:
        print(f"  Network error: {e.reason}", file=sys.stderr)
        return None

    results = data.get("results", [])
    if not results:
        return None

    photo = results[0]
    return {
        "id": photo["id"],
        "url": photo["urls"]["regular"],
        "width": photo["width"],
        "height": photo["height"],
        "alt": photo.get("alt_description") or photo.get("description") or query,
        "author": photo["user"]["name"],
        "author_username": photo["user"]["username"],
        "author_url": photo["user"]["links"]["html"],
        "color": photo.get("color", ""),
    }


def guess_orientation(dimensions: str) -> Optional[str]:
    """Guess orientation from placehold.co dimensions string like '800x600'."""
    if not dimensions or "x" not in dimensions:
        return None
    try:
        w, h = dimensions.split("x")
        ratio = int(w) / int(h)
        if ratio > 1.3:
            return "landscape"
        elif ratio < 0.77:
            return "portrait"
        else:
            return "squarish"
    except (ValueError, ZeroDivisionError):
        return None


def download_image(url: str, dest: Path) -> bool:
    """Download an image from a URL to a local path."""
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "fetch_images.py/1.0 (GA Universe pipeline)"
        })
        with urllib.request.urlopen(req, timeout=30) as resp:
            dest.write_bytes(resp.read())
        return True
    except (urllib.error.URLError, urllib.error.HTTPError, OSError) as e:
        print(f"  Download failed: {e}", file=sys.stderr)
        return False


# ============================================================
# Attribution
# ============================================================

ATTRIBUTION_HEADER = """# Image Attribution

All photos are used under the [Unsplash License](https://unsplash.com/license).

## Photos
"""


def write_attribution(
    entries: List[Dict], attribution_path: Path
) -> None:
    """Write or append to ATTRIBUTION.md."""
    existing = ""
    if attribution_path.is_file():
        existing = attribution_path.read_text(encoding="utf-8")

    if not existing.strip():
        lines = [ATTRIBUTION_HEADER]
    else:
        lines = [existing.rstrip() + "\n"]

    for entry in entries:
        block = f"""
### {entry['filename']}
- **Photographer**: [{entry['author']}]({entry['author_url']})
- **Source**: [Unsplash](https://unsplash.com/photos/{entry['photo_id']})
- **Description**: {entry['alt']}
- **Downloaded**: {entry['date']}
"""
        # Skip if already attributed
        if entry["filename"] in existing:
            continue
        lines.append(block)

    attribution_path.write_text("".join(lines), encoding="utf-8")


# ============================================================
# Core pipeline
# ============================================================

def load_config(path: Path) -> List[Dict]:
    """Load image-config.json."""
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def sanitize_filename(save_as: str) -> str:
    """Ensure filename is safe and has an extension."""
    name = re.sub(r"[^a-z0-9-]", "", save_as.lower().strip())[:80]
    if not name:
        name = "image"
    return name


def run_downloads(
    config: List[Dict],
    api_key: str,
    output_dir: Path,
    attribution_path: Path,
    dry_run: bool = False,
    skip_existing: bool = True,
) -> int:
    """Download all images from config. Returns count of successful downloads."""
    output_dir.mkdir(parents=True, exist_ok=True)
    attribution_path.parent.mkdir(parents=True, exist_ok=True)

    total = len(config)
    downloaded = 0
    skipped = 0
    failed = 0
    attribution_entries: List[Dict] = []
    today = date.today().isoformat()

    for i, entry in enumerate(config, start=1):
        query = entry["query"]
        save_as = sanitize_filename(entry.get("save_as", ""))
        filename = f"{save_as}.jpg"
        dest = output_dir / filename
        dimensions = entry.get("dimensions", "")

        prefix = f"[{i}/{total}]"

        if skip_existing and dest.exists():
            print(f"  {prefix} SKIP (exists): {filename}")
            skipped += 1
            continue

        if dry_run:
            orientation = guess_orientation(dimensions)
            print(f"  {prefix} WOULD FETCH: {filename}")
            print(f"         query: {query[:80]}...")
            print(f"         orientation: {orientation or 'auto'}")
            continue

        print(f"  {prefix} Searching: {query[:60]}...")
        orientation = guess_orientation(dimensions)
        result = search_unsplash(query, api_key, orientation)

        if not result:
            print(f"  {prefix} FAIL: No results for '{query[:40]}...'")
            failed += 1
            time.sleep(REQUEST_DELAY_S)
            continue

        print(f"  {prefix} Downloading: {filename} (by {result['author']})")
        if download_image(result["url"], dest):
            downloaded += 1
            attribution_entries.append({
                "filename": filename,
                "photo_id": result["id"],
                "author": result["author"],
                "author_url": result["author_url"],
                "alt": result["alt"],
                "date": today,
            })
        else:
            failed += 1

        time.sleep(REQUEST_DELAY_S)

    if attribution_entries:
        write_attribution(attribution_entries, attribution_path)
        print(f"\n  ATTRIBUTION.md updated with {len(attribution_entries)} entries")

    print(f"\nSummary: {downloaded} downloaded, {skipped} skipped, {failed} failed (of {total} total)")
    return downloaded


# ============================================================
# CLI
# ============================================================

def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Batch-download images from Unsplash using image-config.json.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""\
Requires UNSPLASH_ACCESS_KEY in environment or .env file.
Get a free key at https://unsplash.com/developers

Examples:
  python3 fetch_images.py                           # Use defaults
  python3 fetch_images.py --dry-run                  # Preview without downloading
  python3 fetch_images.py --config path/to/config.json --output path/to/photos/
""",
    )
    parser.add_argument(
        "--config",
        default=DEFAULT_CONFIG,
        type=Path,
        help="Path to image-config.json (default: preprocessed/image-config.json)",
    )
    parser.add_argument(
        "--output",
        default=DEFAULT_OUTPUT,
        type=Path,
        help="Output directory for downloaded photos (default: ../astro-local-business-v2/src/assets/images/photos)",
    )
    parser.add_argument(
        "--attribution",
        default=DEFAULT_ATTRIBUTION,
        type=Path,
        help="Path to ATTRIBUTION.md (default: ../astro-local-business-v2/src/assets/images/ATTRIBUTION.md)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be downloaded without actually fetching",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-download even if files already exist",
    )
    args = parser.parse_args(argv)
    args.config = args.config.resolve()
    args.output = args.output.resolve()
    args.attribution = args.attribution.resolve()
    return args


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)

    if not args.config.is_file():
        print(f"Config not found: {args.config}", file=sys.stderr)
        print("Run preprocess.py first to generate image-config.json", file=sys.stderr)
        return 1

    config = load_config(args.config)
    print(f"Loaded {len(config)} image entries from {args.config.name}")

    if args.dry_run:
        print("\n=== DRY RUN (no downloads) ===\n")
        run_downloads(config, "", args.output, args.attribution, dry_run=True)
        return 0

    api_key = find_api_key()
    if not api_key:
        print(
            "UNSPLASH_ACCESS_KEY not found.\n"
            "Set it in your environment or in a .env file.\n"
            "Get a free key at https://unsplash.com/developers",
            file=sys.stderr,
        )
        return 1

    print(f"Output: {args.output}")
    print(f"Attribution: {args.attribution}")
    print()

    run_downloads(
        config,
        api_key,
        args.output,
        args.attribution,
        dry_run=False,
        skip_existing=not args.force,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
