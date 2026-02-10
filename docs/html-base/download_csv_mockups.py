#!/usr/bin/env python3
"""
Fetch HTML mockup snippets referenced in the Tavern CSV export and organize them
locally so they can be imported into the Astro project.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from html import unescape
from pathlib import Path
from typing import Dict, List, Sequence, Tuple
from urllib.error import HTTPError, URLError
from urllib.request import urlopen
from urllib.parse import urlparse


SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_OUTPUT_DIR = SCRIPT_DIR / "html"
DEFAULT_MANIFEST_PATH = SCRIPT_DIR / "manifest.json"
_CSV_SENTINEL = object()
SOURCE_HTML_BASE = "https://yourtop10simages.s3.amazonaws.com/cropHtmls/"
LOCAL_MANIFEST_PREFIX_ROOT = Path("automatetemplates")
SOURCE_FIELD_CANDIDATES = ("cropHtml", "htmlPath", "Converted Path")
NAME_FIELD_CANDIDATES = ("Name", "Cleaned Name")


def discover_csv(search_dir: Path) -> Path:
    csv_files = sorted(p for p in search_dir.glob("*.csv") if p.is_file())
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in {search_dir}")
    if len(csv_files) > 1:
        names = ", ".join(p.name for p in csv_files)
        raise RuntimeError(
            f"Multiple CSV files found in {search_dir}: {names}. "
            "Specify the desired file with --csv."
        )
    return csv_files[0]


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Download HTML snippets referenced in the Tavern mockup CSV."
    )
    parser.add_argument(
        "--csv",
        dest="csv_path",
        default=_CSV_SENTINEL,
        type=Path,
        help=(
            "Path to the exported CSV with cropHtml references. "
            "Defaults to the single CSV file next to this script."
        ),
    )
    parser.add_argument(
        "--out-dir",
        dest="output_dir",
        default=DEFAULT_OUTPUT_DIR,
        type=Path,
        help="Directory where downloaded HTML snippets will be stored.",
    )
    parser.add_argument(
        "--manifest",
        dest="manifest_path",
        default=DEFAULT_MANIFEST_PATH,
        type=Path,
        help="Where to write the manifest that describes the local files.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-download HTML snippets even if the local file already exists.",
    )
    args = parser.parse_args(argv)

    if args.csv_path is _CSV_SENTINEL:
        try:
            args.csv_path = discover_csv(SCRIPT_DIR)
        except FileNotFoundError:
            parser.error(
                f"No CSV files found in {SCRIPT_DIR}; provide one via --csv."
            )
        except RuntimeError as exc:
            parser.error(str(exc))

    args.csv_path = args.csv_path.resolve()
    args.output_dir = args.output_dir.resolve()
    args.manifest_path = args.manifest_path.resolve()

    return args


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "section"


def extract_filename(raw: str) -> str:
    if not raw:
        return ""
    parsed = urlparse(raw)
    path = parsed.path if parsed.scheme else raw
    return Path(path).name


def resolve_source_html(row: Dict[str, str]) -> Tuple[str, str]:
    for key in SOURCE_FIELD_CANDIDATES:
        raw = (row.get(key) or "").strip()
        if not raw:
            continue
        if raw.startswith(("http://", "https://")):
            return raw, extract_filename(raw)
        filename = extract_filename(raw)
        if filename:
            return f"{SOURCE_HTML_BASE}{filename}", filename
    return "", ""


def manifest_name_from_filename(filename: str) -> str:
    if not filename:
        return ""
    return Path(filename).stem


def slug_seed_from_filename(filename: str) -> str:
    if not filename:
        return ""
    # First stem removes .html, second removes .jpg to leave the slug tokens.
    first_pass = Path(filename).stem
    return Path(first_pass).stem


def coalesce_name(row: Dict[str, str]) -> str:
    for key in NAME_FIELD_CANDIDATES:
        value = (row.get(key) or "").strip()
        if value:
            return value
    return ""


def fetch_html(url: str) -> str:
    with urlopen(url) as response:  # noqa: S310 - controlled URLs from CSV
        content_type = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(content_type, errors="replace")


SHEET_ATTR_RE = re.compile(r'data-v="(&lt;html&gt;.*)"\s+id="sjs-A2"', re.DOTALL)
SHEET_CELL_RE = re.compile(r'id="sjs-A2">(.*?)</td>', re.DOTALL)


def decode_sheet_export(raw_html: str) -> str:
    for pattern in (SHEET_ATTR_RE, SHEET_CELL_RE):
        match = pattern.search(raw_html)
        if not match:
            continue
        payload = match.group(1)
        payload = payload.replace("<br/>", "\n").replace("<br />", "\n")
        decoded = unescape(payload).replace("\xa0", " ").strip()
        return decoded if decoded.endswith("\n") else decoded + "\n"
    return raw_html


def load_rows(csv_path: Path) -> List[Dict[str, str]]:
    with csv_path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def manifest_relative_path(path: Path, manifest_root: Path | None) -> str:
    if manifest_root:
        try:
            return str(path.relative_to(manifest_root))
        except ValueError:
            pass
    return str(path)


def download_snippets(
    rows: Sequence[Dict[str, str]],
    output_dir: Path,
    force: bool,
    manifest_root: Path | None = None,
    local_prefix: Path | None = None,
) -> Tuple[List[Dict[str, str]], List[str]]:
    ensure_dir(output_dir)
    manifest: List[Dict[str, str]] = []
    errors: List[str] = []

    total = len(rows)
    for idx, row in enumerate(rows, start=1):
        url, source_filename = resolve_source_html(row)
        manifest_name = manifest_name_from_filename(source_filename)
        raw_name = manifest_name or coalesce_name(row) or f"row-{idx}"
        slug_candidate = slug_seed_from_filename(source_filename) or raw_name
        base_slug = slugify(slug_candidate)
        filename = f"{idx:03d}-{base_slug}.html"
        dest = output_dir / filename
        local_path = manifest_relative_path(dest, manifest_root)
        if local_prefix:
            local_path = str(local_prefix / Path(local_path))
        entry = {
            "index": idx,
            "name": raw_name,
            "page": row.get("Pages") or "",
            "site_template": row.get("SiteTemplates") or "",
            "status": row.get("Status") or "",
            "source_html": url,
            "local_html": local_path,
            "crop_section": row.get("cropSection") or "",
            "drive_id": row.get("driveId") or "",
        }

        if not url:
            errors.append(f"[{idx}/{total}] Missing cropHtml URL for {raw_name}")
            manifest.append(entry)
            continue

        if dest.exists() and not force:
            print(f"[{idx}/{total}] Skipping existing {dest}")
            manifest.append(entry)
            continue

        try:
            html = fetch_html(url)
            html = decode_sheet_export(html)
        except (HTTPError, URLError, TimeoutError) as exc:
            msg = f"[{idx}/{total}] Failed to download {url}: {exc}"
            print(msg, file=sys.stderr)
            errors.append(msg)
            manifest.append(entry)
            continue

        dest.write_text(html, encoding="utf-8")
        print(f"[{idx}/{total}] Saved {dest}")
        manifest.append(entry)

    return manifest, errors


def write_manifest(manifest_path: Path, manifest: Sequence[Dict[str, str]]) -> None:
    ensure_dir(manifest_path.parent)
    manifest_path.write_text(
        json.dumps(manifest, indent=2),
        encoding="utf-8",
    )


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    rows = load_rows(args.csv_path)
    manifest_root = args.manifest_path.parent
    local_prefix = LOCAL_MANIFEST_PREFIX_ROOT / manifest_root.name if manifest_root else None
    manifest, errors = download_snippets(
        rows,
        args.output_dir,
        args.force,
        manifest_root=manifest_root,
        local_prefix=local_prefix,
    )
    write_manifest(args.manifest_path, manifest)

    if errors:
        print(
            f"Completed with {len(errors)} issue(s); see stderr for details.",
            file=sys.stderr,
        )
        return 1

    print(f"Downloaded {len(manifest)} snippet(s) to {args.output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
