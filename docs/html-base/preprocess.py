#!/usr/bin/env python3
"""
Preprocess HTML slices to reduce LLM workload before site generation.

Operations:
  1. Strip boilerplate  — Remove <style>:root, CDN tags, html/head/body wrappers
  2. Extract tokens      — Parse :root CSS vars, convert hex→oklch, emit @theme block
  3. Cluster structures  — Hash DOM skeletons, group duplicates, emit component map
  4. Image manifest      — Extract <img> alt texts + placehold.co dimensions

Outputs (into preprocessed/):
  tokens.css          — Ready-to-paste @theme block with oklch values
  components.json     — Unique structural patterns + page mapping
  image-config.json   — Deduplicated image queries from alt texts
  pages.json          — Page slug → ordered list of component/slice assignments
  clean-html/         — Boilerplate-stripped HTML, one per input file
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Tuple


SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_HTML_DIR = SCRIPT_DIR / "html"
DEFAULT_MANIFEST = SCRIPT_DIR / "manifest.json"
DEFAULT_OUTPUT_DIR = SCRIPT_DIR / "preprocessed"

# ============================================================
# Hex → OKLCH conversion (pure Python, no dependencies)
# ============================================================

def hex_to_srgb(hex_color: str) -> Tuple[float, float, float]:
    h = hex_color.lstrip("#")
    if len(h) == 3:
        h = h[0] * 2 + h[1] * 2 + h[2] * 2
    return int(h[0:2], 16) / 255.0, int(h[2:4], 16) / 255.0, int(h[4:6], 16) / 255.0


def srgb_to_linear(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def linear_to_oklab(r: float, g: float, b: float) -> Tuple[float, float, float]:
    l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b

    l_c = math.copysign(abs(l_) ** (1 / 3), l_) if l_ != 0 else 0
    m_c = math.copysign(abs(m_) ** (1 / 3), m_) if m_ != 0 else 0
    s_c = math.copysign(abs(s_) ** (1 / 3), s_) if s_ != 0 else 0

    L = 0.2104542553 * l_c + 0.7936177850 * m_c - 0.0040720468 * s_c
    a = 1.9779984951 * l_c - 2.4285922050 * m_c + 0.4505937099 * s_c
    b_val = 0.0259040371 * l_c + 0.7827717662 * m_c - 0.8086757660 * s_c
    return L, a, b_val


def oklab_to_oklch(L: float, a: float, b: float) -> Tuple[float, float, float]:
    C = math.sqrt(a * a + b * b)
    H = math.degrees(math.atan2(b, a)) % 360
    return L, C, H


def hex_to_oklch(hex_color: str) -> Tuple[float, float, float]:
    r, g, b = hex_to_srgb(hex_color)
    rl, gl, bl = srgb_to_linear(r), srgb_to_linear(g), srgb_to_linear(b)
    L, a, b_val = linear_to_oklab(rl, gl, bl)
    return oklab_to_oklch(L, a, b_val)


def format_oklch(L: float, C: float, H: float) -> str:
    if C < 0.004:
        return f"oklch({L:.2f} 0 0)"
    return f"oklch({L:.2f} {C:.2f} {H:.0f})"


# ============================================================
# HTML parsing helpers
# ============================================================

STYLE_BLOCK_RE = re.compile(
    r"<style[^>]*>.*?</style>", re.DOTALL | re.IGNORECASE
)
CDN_SCRIPT_RE = re.compile(
    r'<script[^>]*src="[^"]*cdn\.tailwindcss\.com[^"]*"[^>]*>\s*</script>',
    re.IGNORECASE,
)
FA_LINK_RE = re.compile(
    r'<link[^>]*href="[^"]*font-awesome[^"]*"[^>]*/?>(?:</link>)?',
    re.IGNORECASE,
)
HTML_TAG_RE = re.compile(r"</?html[^>]*>", re.IGNORECASE)
HEAD_BLOCK_RE = re.compile(r"<head[^>]*>.*?</head>", re.DOTALL | re.IGNORECASE)
BODY_OPEN_RE = re.compile(r"<body[^>]*>", re.IGNORECASE)
BODY_CLOSE_RE = re.compile(r"</body>", re.IGNORECASE)

CSS_VAR_RE = re.compile(r"--(color-[\w-]+)\s*:\s*(#[0-9A-Fa-f]{3,8})\s*;")

IMG_TAG_RE = re.compile(
    r'<img\s[^>]*?(?:src="(?P<src>[^"]*)"[^>]*?alt="(?P<alt>[^"]*)"'
    r'|alt="(?P<alt2>[^"]*)"[^>]*?src="(?P<src2>[^"]*)")'
    r"[^>]*/?>",
    re.IGNORECASE | re.DOTALL,
)

PLACEHOLD_DIM_RE = re.compile(r"placehold\.co/(\d+)x(\d+)")

TITLE_RE = re.compile(r"<title[^>]*>.*?</title>", re.DOTALL | re.IGNORECASE)
META_RE = re.compile(r"<meta\s[^>]*/?>", re.IGNORECASE)


def strip_boilerplate(html: str) -> str:
    out = STYLE_BLOCK_RE.sub("", html)
    out = CDN_SCRIPT_RE.sub("", out)
    out = FA_LINK_RE.sub("", out)
    out = TITLE_RE.sub("", out)
    out = META_RE.sub("", out)
    out = HEAD_BLOCK_RE.sub("", out)
    out = BODY_OPEN_RE.sub("", out)
    out = BODY_CLOSE_RE.sub("", out)
    out = HTML_TAG_RE.sub("", out)
    lines = [line for line in out.splitlines() if line.strip()]
    return "\n".join(lines) + "\n" if lines else ""


def extract_css_vars(html: str) -> Dict[str, str]:
    style_match = STYLE_BLOCK_RE.search(html)
    if not style_match:
        return {}
    block = style_match.group()
    return {name: value for name, value in CSS_VAR_RE.findall(block)}


def extract_images(html: str) -> List[Dict[str, str]]:
    results = []
    for m in IMG_TAG_RE.finditer(html):
        src = m.group("src") or m.group("src2") or ""
        alt = m.group("alt") or m.group("alt2") or ""
        if not alt or not alt.strip():
            continue
        dims = ""
        dim_match = PLACEHOLD_DIM_RE.search(src)
        if dim_match:
            dims = f"{dim_match.group(1)}x{dim_match.group(2)}"
        results.append({"src": src, "alt": alt.strip(), "dimensions": dims})
    return results


# ============================================================
# Structural fingerprinting
# ============================================================

TAILWIND_NUM_RE = re.compile(
    r"^((?:(?:sm|md|lg|xl|2xl):)?"  # optional responsive prefix
    r"(?:gap|px|py|pt|pb|pl|pr|p|m|mt|mb|ml|mr|mx|my"
    r"|w|h|max-w|min-w|max-h|min-h"
    r"|text|rounded|top|bottom|left|right|inset"
    r"|space-x|space-y|col-span|row-span|grid-cols|grid-rows"
    r"|leading|tracking|border))"
    r"-\[?[\d./]+"  # the numeric portion (possibly with brackets for arbitrary)
)

LAYOUT_PREFIXES = (
    "grid", "flex", "col-", "row-", "gap-", "container",
    "max-w-", "mx-auto", "px-", "py-", "pt-", "pb-",
    "md:", "lg:", "sm:", "xl:", "2xl:",
    "w-", "h-", "min-h-", "items-", "justify-",
    "space-", "grid-cols-", "text-center", "text-left", "text-right",
    "relative", "absolute", "fixed", "sticky",
    "overflow-", "hidden", "block", "inline",
)


def normalize_class(token: str) -> str:
    m = TAILWIND_NUM_RE.match(token)
    if m:
        return m.group(1) + "-*"
    return token


class SkeletonExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.tokens: List[str] = []

    def handle_starttag(self, tag: str, attrs: list) -> None:
        structural: List[str] = []
        for name, val in attrs:
            if name == "class" and val:
                layout_tokens = sorted(
                    normalize_class(t)
                    for t in val.split()
                    if any(t.startswith(p) for p in LAYOUT_PREFIXES)
                )
                if layout_tokens:
                    structural.append(f'class="{" ".join(layout_tokens)}"')
            elif name in ("data-collection", "data-item"):
                structural.append(name)
        attr_str = " ".join(structural)
        self.tokens.append(f"<{tag} {attr_str}>" if attr_str else f"<{tag}>")

    def handle_endtag(self, tag: str) -> None:
        self.tokens.append(f"</{tag}>")

    def handle_data(self, data: str) -> None:
        pass

    def get_skeleton(self) -> str:
        return "".join(self.tokens)


def structural_hash(html: str) -> str:
    extractor = SkeletonExtractor()
    try:
        extractor.feed(html)
    except Exception:
        pass
    skeleton = extractor.get_skeleton()
    return hashlib.md5(skeleton.encode()).hexdigest()


# ============================================================
# Manifest helpers
# ============================================================

def parse_page_slug(page_field: str) -> str:
    name = page_field.split("(")[0].strip()
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "unknown"


def parse_section_pos(name_field: str) -> int:
    m = re.search(r"_p(\d+)_", name_field)
    return int(m.group(1)) if m else 0


def load_manifest(path: Path) -> List[Dict]:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


# ============================================================
# Core pipeline steps
# ============================================================

def resolve_local_html(entry: Dict, html_dir: Path) -> Optional[Path]:
    local_html = entry.get("local_html", "")
    filename = Path(local_html).name
    candidate = html_dir / filename
    if candidate.exists():
        return candidate
    return None


def step_1_strip_boilerplate(
    html_dir: Path, output_dir: Path, manifest: List[Dict]
) -> Dict[str, str]:
    clean_dir = output_dir / "clean-html"
    clean_dir.mkdir(parents=True, exist_ok=True)
    file_map: Dict[str, str] = {}
    for entry in manifest:
        src = resolve_local_html(entry, html_dir)
        if not src:
            continue
        raw = src.read_text(encoding="utf-8")
        cleaned = strip_boilerplate(raw)
        dest = clean_dir / src.name
        dest.write_text(cleaned, encoding="utf-8")
        file_map[src.name] = cleaned
    return file_map


def step_2_extract_tokens(html_dir: Path, output_dir: Path) -> Dict[str, str]:
    first_file = sorted(html_dir.glob("*.html"))
    if not first_file:
        print("No HTML files found for token extraction.", file=sys.stderr)
        return {}
    raw = first_file[0].read_text(encoding="utf-8")
    css_vars = extract_css_vars(raw)
    if not css_vars:
        print("No CSS variables found in first HTML file.", file=sys.stderr)
        return {}

    lines = ["@theme {"]
    current_group = ""
    for name, hex_val in css_vars.items():
        # Detect group changes for readable output
        prefix = name.split("-")[1] if "-" in name else ""
        if prefix != current_group:
            if current_group:
                lines.append("")
            current_group = prefix
        L, C, H = hex_to_oklch(hex_val)
        oklch_str = format_oklch(L, C, H)
        lines.append(f"  --{name}: {oklch_str};")
    lines.append("}")
    lines.append("")

    tokens_path = output_dir / "tokens.css"
    tokens_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"  tokens.css: {len(css_vars)} variables extracted")
    return css_vars


def step_3_cluster(
    file_map: Dict[str, str], manifest: List[Dict], html_dir: Path, output_dir: Path
) -> List[Dict]:
    hash_groups: Dict[str, List[Dict]] = {}

    for entry in manifest:
        src = resolve_local_html(entry, html_dir)
        if not src or src.name not in file_map:
            continue
        cleaned = file_map[src.name]
        h = structural_hash(cleaned)
        page = parse_page_slug(entry.get("page", ""))
        pos = parse_section_pos(entry.get("name", ""))

        item = {
            "file": src.name,
            "page": page,
            "position": pos,
            "index": entry.get("index", 0),
        }

        if h not in hash_groups:
            hash_groups[h] = []
        hash_groups[h].append(item)

    components = []
    for i, (h, members) in enumerate(
        sorted(hash_groups.items(), key=lambda x: x[1][0]["index"]), start=1
    ):
        representative = members[0]
        pages = sorted(set(m["page"] for m in members))
        components.append({
            "id": f"pattern-{i:03d}",
            "hash": h,
            "representative": representative["file"],
            "occurrences": len(members),
            "pages": pages,
            "page_count": len(pages),
            "members": [
                {"file": m["file"], "page": m["page"], "position": m["position"]}
                for m in sorted(members, key=lambda m: (m["page"], m["position"]))
            ],
        })

    comp_path = output_dir / "components.json"
    comp_path.write_text(json.dumps(components, indent=2), encoding="utf-8")
    unique = len(components)
    total = sum(c["occurrences"] for c in components)
    print(f"  components.json: {total} slices → {unique} unique patterns")
    return components


def step_4_image_manifest(
    html_dir: Path, manifest: List[Dict], output_dir: Path
) -> List[Dict]:
    seen_alts: Dict[str, Dict] = {}

    for entry in manifest:
        src = resolve_local_html(entry, html_dir)
        if not src:
            continue
        raw = src.read_text(encoding="utf-8")
        images = extract_images(raw)
        page = parse_page_slug(entry.get("page", ""))

        for img in images:
            alt = img["alt"]
            key = alt.lower().strip()
            if key in seen_alts:
                if src.name not in seen_alts[key]["used_in"]:
                    seen_alts[key]["used_in"].append(src.name)
                if page not in seen_alts[key]["pages"]:
                    seen_alts[key]["pages"].append(page)
            else:
                # Generate a descriptive save_as name from the alt text
                slug = re.sub(r"[^a-z0-9]+", "-", alt.lower()).strip("-")[:60]
                seen_alts[key] = {
                    "query": alt,
                    "dimensions": img["dimensions"],
                    "save_as": slug,
                    "used_in": [src.name],
                    "pages": [page],
                }

    image_list = sorted(seen_alts.values(), key=lambda x: x["query"])
    img_path = output_dir / "image-config.json"
    img_path.write_text(json.dumps(image_list, indent=2), encoding="utf-8")
    print(f"  image-config.json: {len(image_list)} unique images")
    return image_list


def step_5_pages_map(
    manifest: List[Dict], components: List[Dict], html_dir: Path, output_dir: Path
) -> Dict:
    # Build a file→component-id lookup
    file_to_component: Dict[str, str] = {}
    for comp in components:
        for member in comp["members"]:
            file_to_component[member["file"]] = comp["id"]

    pages: Dict[str, List[Dict]] = {}
    for entry in manifest:
        src = resolve_local_html(entry, html_dir)
        if not src:
            continue
        page = parse_page_slug(entry.get("page", ""))
        pos = parse_section_pos(entry.get("name", ""))
        comp_id = file_to_component.get(src.name, "unknown")

        if page not in pages:
            pages[page] = []
        pages[page].append({
            "position": pos,
            "file": src.name,
            "component": comp_id,
            "index": entry.get("index", 0),
        })

    # Sort sections within each page by position
    for page in pages:
        pages[page].sort(key=lambda x: x["position"])

    pages_path = output_dir / "pages.json"
    pages_path.write_text(json.dumps(pages, indent=2), encoding="utf-8")
    print(f"  pages.json: {len(pages)} pages mapped")
    return pages


# ============================================================
# CLI
# ============================================================

def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Preprocess HTML slices for efficient LLM site generation.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""\
Outputs (into --output-dir):
  tokens.css          @theme block with oklch values
  components.json     Unique structural patterns + page mapping
  image-config.json   Deduplicated image queries from alt texts
  pages.json          Page slug → ordered section list
  clean-html/         Boilerplate-stripped HTML files
""",
    )
    parser.add_argument(
        "--html-dir",
        default=DEFAULT_HTML_DIR,
        type=Path,
        help="Directory containing HTML slice files (default: html/)",
    )
    parser.add_argument(
        "--manifest",
        default=DEFAULT_MANIFEST,
        type=Path,
        help="Path to manifest.json (default: manifest.json)",
    )
    parser.add_argument(
        "--output-dir",
        default=DEFAULT_OUTPUT_DIR,
        type=Path,
        help="Directory for preprocessed output (default: preprocessed/)",
    )
    args = parser.parse_args(argv)
    args.html_dir = args.html_dir.resolve()
    args.manifest = args.manifest.resolve()
    args.output_dir = args.output_dir.resolve()
    return args


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)

    if not args.html_dir.is_dir():
        print(f"HTML directory not found: {args.html_dir}", file=sys.stderr)
        return 1
    if not args.manifest.is_file():
        print(f"Manifest not found: {args.manifest}", file=sys.stderr)
        return 1

    args.output_dir.mkdir(parents=True, exist_ok=True)
    manifest = load_manifest(args.manifest)
    html_count = len(list(args.html_dir.glob("*.html")))

    print(f"Preprocessing {html_count} HTML slices from {args.html_dir.name}/")
    print(f"Manifest: {len(manifest)} entries")
    print()

    # Step 1: Strip boilerplate → clean-html/
    print("Step 1: Stripping boilerplate...")
    file_map = step_1_strip_boilerplate(args.html_dir, args.output_dir, manifest)
    clean_count = len(file_map)
    print(f"  clean-html/: {clean_count} files written")
    print()

    # Step 2: Extract design tokens → tokens.css
    print("Step 2: Extracting design tokens...")
    step_2_extract_tokens(args.html_dir, args.output_dir)
    print()

    # Step 3: Structural clustering → components.json
    print("Step 3: Clustering by structure...")
    components = step_3_cluster(file_map, manifest, args.html_dir, args.output_dir)
    print()

    # Step 4: Image manifest → image-config.json
    print("Step 4: Building image manifest...")
    step_4_image_manifest(args.html_dir, manifest, args.output_dir)
    print()

    # Step 5: Page map → pages.json
    print("Step 5: Generating page map...")
    step_5_pages_map(manifest, components, args.html_dir, args.output_dir)
    print()

    # Summary
    unique = len(components)
    total = sum(c["occurrences"] for c in components)
    reduction = ((total - unique) / total * 100) if total else 0
    print("=" * 50)
    print(f"Done. Output in {args.output_dir.name}/")
    print(f"  {total} slices → {unique} unique patterns ({reduction:.0f}% reduction)")
    print(f"  Ready for LLM: provide clean-html/, tokens.css, components.json, image-config.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
