# Pipeline Optimization — HTML-to-Astro Conversion

> Analysis and recommendations for improving the efficiency of converting screenshot-to-code HTML slices into a finished Astro site.
> Version 1.1 — 2026-02-10

---

## §1 Current Pipeline Analysis

### The flow today

```
Mockup screenshots
  → screenshot-to-code (astro_tailwind prompt)
  → N HTML slice files + manifest.json
  → LLM reads all N files
  → LLM builds an Astro site
```

### Typical numbers (will vary per project)

| Metric | Typical Value |
|--------|-------|
| Total HTML slices | 200–500 |
| Unique pages | 15–50 |
| Exact-duplicate files (by hash) | ~3% |
| Slices with `:root` CSS boilerplate | 100% |
| Lines of CSS boilerplate per slice | ~32 (style block + CDN links) |
| Slices with `placehold.co` images | ~55% |
| Average slice size | ~60 lines |
| Boilerplate ratio | ~50% of each file is repeated CSS/CDN |

### Bottlenecks

1. **Redundant context** — Every slice includes an identical `:root` CSS block (~32 lines) and CDN `<script>`/`<link>` tags. Across hundreds of files, that's thousands of lines of duplicated boilerplate the LLM must read and discard.

2. **Discovery work the LLM does manually** — The building LLM currently must:
   - Parse all files to identify structural patterns
   - Discover that many slices are structurally identical across pages (headers, footers, CTAs)
   - Extract the hex color palette from the `:root` block
   - Convert hex → oklch values (deterministic math)
   - Identify all `placehold.co` images and figure out what to replace them with
   - Convert Font Awesome `<i>` tags to SVG icon references

   All of these are partially or fully automatable.

3. **Image sourcing** — Many slices reference `placehold.co` URLs. The LLM must parse these, generate search queries from `alt` text, and source images. This is addressed in `LLM_BUILD_INSTRUCTIONS.md` §3.6 but could be scripted further.

4. **The hardcoded GA palette** — The `astro_tailwind` prompt (in `screenshot-to-code`) always injects the same GA-branded `:root` block, regardless of the source site's actual colors. This means the building LLM receives a palette that may not match the source design and must re-derive it.

---

## §2 Pre-Processing Optimizations (Script Before LLM)

Things that can be done with scripts to reduce the LLM's workload.

### A. Strip boilerplate from every slice

A script can remove the repeated `:root` CSS block, Tailwind CDN `<script>`, and Font Awesome CDN `<link>` from every file. This reduces each slice by ~32 lines.

**Input:** N files averaging ~60 lines each
**Output:** N files averaging ~28 lines each
**Savings:** ~50% reduction in total content

```bash
# Pseudocode
for file in html/*.html:
    strip_between("<style>", "</style>")
    strip_line_containing("cdn.tailwindcss.com")
    strip_line_containing("cdnjs.cloudflare.com/ajax/libs/font-awesome")
    strip_wrapping_html_head_body_tags()
```

### B. Eliminate exact duplicates

Hash every file after stripping boilerplate. Exact matches collapse to one representative file with a mapping of where it appears.

**Savings:** 13 fewer files to process (minor, but the mapping is useful metadata).

### C. Auto-extract design tokens (hex → oklch)

The `:root` CSS block in any single slice contains the complete color palette. A script can:

1. Parse the `:root` block from one slice
2. Extract all `--color-*` declarations
3. Convert hex values to `oklch()` using deterministic math
4. Output a ready-to-paste `@theme` block for `global.css`
5. Extract `font-family` declarations

**Impact:** Eliminates Phase 2 ("Theme & Config") color work entirely. The LLM receives a pre-built `@theme` block.

```python
# Pseudocode
root_css = parse_root_block("html/001-about-p01.html")
for name, hex_value in root_css.items():
    oklch = hex_to_oklch(hex_value)
    print(f"  --color-{name}: oklch({oklch});")
```

### D. Structural fingerprinting and clustering

Strip all text content and compare DOM structure across slices. This identifies:

- Slices that are **structurally identical** across pages (headers, footers, CTA bars)
- Slices that are **structurally similar** (same layout, different content — e.g., all "services" cards)

**Output:** A `components.json` mapping:
```json
{
  "patterns": [
    {
      "id": "header-nav",
      "representative": "html/001-about-p01.html",
      "occurrences": ["about-p01", "appointment-p01", "blog-p01", "..."],
      "page_count": 40
    },
    {
      "id": "footer-full",
      "representative": "html/012-about-p12.html",
      "occurrences": ["about-p12", "appointment-p09", "..."],
      "page_count": 38
    }
  ]
}
```

**Impact:** Instead of the LLM reading hundreds of files and discovering patterns, it receives ~15-25 unique structural patterns with a ready-made page→component mapping.

### E. Generate image manifest from alt texts

Parse all `<img>` tags, extract `alt` text and `placehold.co` dimensions, deduplicate by similar alt text, and output a structured manifest.

**Output:** `image-config.json`
```json
[
  {
    "query": "professional barista pouring latte art",
    "dimensions": "800x600",
    "save_as": "hero-coffee-shop",
    "used_in": ["home-p02", "about-p04"]
  }
]
```

This can be fed directly to the `image-studio` CLI for batch download.

---

## §3 Smarter LLM Invocation

### A. Component-first approach

After script-based preprocessing, the LLM's input shrinks dramatically:

| Before | After |
|--------|-------|
| N HTML files | ~15-25 unique patterns (clean, no boilerplate) |
| LLM must extract colors | Pre-built `@theme` block provided |
| LLM must discover shared layouts | `components.json` mapping provided |
| LLM must source 253 images | Pre-downloaded images + manifest |
| LLM must identify all pages | Page routing table provided |

**The LLM's job becomes:** "Here are 20 unique HTML patterns. Convert each to an Astro component using these theme tokens. Here's the page routing table showing which components go on which pages."

### B. Two-pass LLM approach

- **Pass 1** (cheap/fast model — e.g., Haiku): Classify and name the ~20 unique component patterns, validate the `components.json` groupings, and generate `Props` interfaces
- **Pass 2** (capable model — e.g., Sonnet/Opus): Generate the actual Astro component code + wire pages

### C. Template-aware screenshot-to-code (future improvement)

The `astro_tailwind` prompt could be enhanced to output closer-to-final Astro markup:
- Already partially done: CSS custom properties, semantic HTML, `data-collection` attributes
- Could output `.astro` component files directly instead of standalone HTML pages
- Could use the short-form Tailwind v4 classes (`bg-primary` not `bg-[var(--color-primary)]`) — **this is now fixed** (see Deliverable 4)

**Note:** The hardcoded hex `:root` block in the `astro_tailwind` prompt (lines 310-341 of `screenshot_system_prompts.py`) means the GA palette is always injected regardless of source site. Making this configurable is a future improvement.

---

## §4 Recommended Order of Operations

### Current pipeline

```
1. Screenshot mockups
2. screenshot-to-code → N HTML slices + manifest.json
3. LLM reads everything, builds site (manual/slow)
```

### Optimized pipeline

```
1. Screenshot mockups
2. screenshot-to-code           → N HTML slices + manifest.json (existing)
3. python3 preprocess.py        → Strips boilerplate, extracts tokens, clusters, builds manifests
   ├── tokens.css               Ready-to-paste @theme block in oklch
   ├── components.json          Unique patterns + page mapping
   ├── pages.json               Page slug → ordered section list
   ├── image-config.json        Image queries from alt texts
   └── clean-html/              Stripped HTML (~50% smaller)
4. python3 fetch_images.py      → Batch download from image-config.json via Unsplash API
   ├── src/assets/images/photos/  Downloaded photos with descriptive names
   └── ATTRIBUTION.md             Photographer credits
5. LLM BUILD                   → Receives: clean-html/ + tokens.css + components.json + images + base template
   └── Job: convert ~20 patterns to Astro components, wire pages
6. Verification                → Existing checks from LLM_BUILD_INSTRUCTIONS.md §6
```

### Scripts

Both scripts are pure Python 3, zero external dependencies, and follow the same CLI conventions.

**`preprocess.py`** (built):

```bash
python3 preprocess.py                                  # Use defaults (html/, manifest.json → preprocessed/)
python3 preprocess.py --html-dir html/ --output-dir preprocessed/
```

Outputs:
```
preprocessed/
├── tokens.css            (@theme block with oklch values)
├── components.json       (unique patterns + representative HTML + page mapping)
├── pages.json            (page → ordered component list)
├── image-config.json     (deduped image queries for batch download)
└── clean-html/           (one file per unique pattern, boilerplate stripped)
```

**`fetch_images.py`** (built):

```bash
python3 fetch_images.py                                # Use defaults (reads preprocessed/image-config.json)
python3 fetch_images.py --dry-run                      # Preview without downloading
python3 fetch_images.py --config path/to/config.json --output path/to/photos/
python3 fetch_images.py --force                        # Re-download existing files
```

Requires `UNSPLASH_ACCESS_KEY` in environment or `.env` file. Get a free key at https://unsplash.com/developers (50 req/hour).

---

## §5 Effort vs Impact Matrix

| Optimization | Effort | Impact | Status |
|-------------|--------|--------|--------|
| Strip CSS/CDN boilerplate from slices | Low (regex/string ops) | Medium (~50% smaller files) | **Done** — `preprocess.py` step 1 |
| Auto-extract design tokens (hex → oklch) | Low (deterministic math) | High (eliminates Phase 2 color work) | **Done** — `preprocess.py` step 2 |
| Generate `image-config.json` from alt texts | Low (HTML parsing) | Medium (automates image sourcing setup) | **Done** — `preprocess.py` step 4 |
| Structural dedup / clustering | Medium (DOM comparison, similarity hashing) | High (reduces N → ~N×0.87 unique patterns) | **Done** — `preprocess.py` step 3 |
| Batch image download from config | Low (Unsplash API) | Medium (automates image sourcing) | **Done** — `fetch_images.py` |
| Component-first LLM invocation | Low (prompt restructuring) | High (dramatically smaller context window) | **Done** — `LLM_BUILD_INSTRUCTIONS.md` §0 + Phase 1/2 shortcuts |
| Two-pass LLM (classify then build) | Low (workflow change) | Medium (cheaper first pass, more focused second) | Not started |
| Template-aware screenshot-to-code prompt | Medium (prompt engineering + testing) | Medium (better intermediate format) | Partial — Tailwind v4 short-form classes done |
| Configurable `:root` palette in s2c prompt | Low (parameterize the hex block) | Medium (enables non-GA source sites) | Not started |

### Expected results

| Metric | Before | After |
|--------|--------|-------|
| Total lines across all slices | N×60 | N×30 (~50% reduction) |
| Unique structural patterns | N (all) | ~87% of N (10-15% reduction) |
| Multi-occurrence patterns (shared components) | unknown | auto-detected |
| Unique images identified | unknown | auto-extracted with queries |
| Color tokens extracted | manual | auto-converted to oklch |
| Pages mapped | manual | auto-generated |

### Remaining improvements

**Two-pass LLM:** Use a cheap/fast model (Haiku) to classify and name the ~20 most common component patterns, then a capable model (Sonnet/Opus) to generate Astro code.

**Template-aware screenshot-to-code:** The `astro_tailwind` prompt could output `.astro` component files directly instead of standalone HTML. The Tailwind v4 short-form class fix is already done.

**Configurable palette injection:** The hardcoded hex `:root` block in the s2c prompt (lines 310-341) always injects the GA palette. Making this configurable would eliminate the palette mismatch issue.

---

*Pipeline Optimization v1.1*
