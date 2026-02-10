# {INDUSTRY} Template — Implementation Checklist

> Generic, industry-agnostic checklist for building a themed Astro site from HTML slices.
> Fill in `{PLACEHOLDERS}` for each new project. See `LLM_BUILD_INSTRUCTIONS.md` for detailed rules.

---

## How to Use This Template

1. **Copy this file** into your project's `docs/` or root directory
2. **Find-and-replace** all placeholders:
   | Placeholder | Replace With | Example |
   |------------|-------------|---------|
   | `{INDUSTRY}` | Industry name | HVAC, Brewery, Barbershop |
   | `{BUSINESS_NAME}` | GA Universe business name | GrowthAutomations Climate Systems |
   | `{SITE_URL}` | Production site URL | `https://ga-theme-coolify.growthautomations.app` |
   | `{TEMPLATE_SLUG}` | Kebab-case template ID | `coolify-starter`, `hophaus-starter` |
   | `{MANIFEST_PATH}` | Path to manifest.json | `{industry}/manifest.json` |
   | `{HTML_DIR}` | Path to HTML slices | `{industry}/html/` |
3. **Uncheck all boxes** to start fresh
4. **Reference `LLM_BUILD_INSTRUCTIONS.md`** for detailed architecture rules, translation patterns, and verification commands

---

## Phase 1 — Analysis & Setup

### 1.1 Environment Setup

- [ ] Clone `astro-local-business-v2` base template into project directory
- [ ] Run `npm install` then `npm run dev` — confirm the base project compiles cleanly
- [ ] Verify `{MANIFEST_PATH}` exists and is valid JSON
- [ ] Verify `{HTML_DIR}` contains the HTML slice files referenced by the manifest

### 1.2 Base Template Verification

Confirm the base template has correct structure before making changes.

- [ ] `src/site.config.ts` exists (NOT `src/data/site.ts` or `src/config/site.ts`)
- [ ] `src/content.config.ts` exists (NOT `src/content/config.ts`)
- [ ] `src/styles/global.css` exists with `@import "tailwindcss"` and `@theme` block
- [ ] `src/layouts/Base.astro` exists
- [ ] No `tailwind.config.mjs` file present
- [ ] No `src/config/` directory present
- [ ] No `public/images/` directory present

> **Rules reference:** LLM_BUILD_INSTRUCTIONS.md §1.1–§1.3

### 1.3 Preprocessing (if `preprocess.py` available)

Run preprocessing to reduce manual analysis work:

```bash
python3 preprocess.py
```

- [ ] `preprocessed/tokens.css` generated — Ready-to-paste `@theme` block (skip Phase 2 color extraction)
- [ ] `preprocessed/components.json` generated — Structural patterns + page mapping (skip Phase 1 analysis steps 1–4)
- [ ] `preprocessed/pages.json` generated — Page→section ordering
- [ ] `preprocessed/image-config.json` generated — Deduplicated image queries (skip §3.6 Step 1)
- [ ] `preprocessed/clean-html/` generated — Boilerplate-stripped HTML (~50% smaller)

> **If preprocessed outputs exist, use them in later phases as noted.** See LLM_BUILD_INSTRUCTIONS.md §0 "Preprocessed Outputs".

### 1.4 Manifest Analysis (READ ONLY — do not write code yet)

> **Preprocessed shortcut:** If `preprocessed/components.json` and `preprocessed/pages.json` exist, skip to "List components to build" using the pre-computed analysis. Read `clean-html/` files instead of raw `html/`.

- [ ] Parse `{MANIFEST_PATH}` — group entries by `page` field
- [ ] List all unique pages: _______________________________________________
- [ ] Read HTML slices in section order (`p01` → `pNN`) for each page
- [ ] Classify each section using the decision tree (LLM_BUILD_INSTRUCTIONS.md §2.3)
- [ ] Identify shared components — layouts that repeat across 2+ pages
- [ ] List components to build: __________________________________________
- [ ] Identify content collection types needed (services, staff, testimonials, etc.)
- [ ] Note spacer slices → these become padding utilities, not components

### 1.5 Phase 1 Output

- [ ] Written plan listing: pages to create, shared components, content collections, route paths
- [ ] No code written yet — analysis only

---

## Phase 2 — Theme & Configuration

### 2.1 Color Extraction & Theme Block

> **Preprocessed shortcut:** If `preprocessed/tokens.css` exists, paste it directly into `src/styles/global.css` — skip color extraction and conversion.

- [ ] Extract primary, accent, and neutral colors from HTML slices
- [ ] Convert all colors to `oklch()` format
- [ ] Write the `@theme` block in `src/styles/global.css` with ALL required variables:
  - [ ] `--color-primary`, `--color-primary-dark`, `--color-primary-light`
  - [ ] `--color-accent`, `--color-accent-dark`, `--color-accent-light`
  - [ ] `--color-background`, `--color-surface`, `--color-surface-alt`
  - [ ] `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
  - [ ] `--color-border`
  - [ ] `--color-on-primary`, `--color-on-accent`
  - [ ] `--color-footer-accent`, `--color-footer-text`, `--color-footer-text-secondary`
  - [ ] `--color-footer-text-muted`, `--color-footer-border`, `--color-footer-surface`
- [ ] Define `[data-theme="dark"]` overrides (NOT `.dark` class)

> **Rules reference:** LLM_BUILD_INSTRUCTIONS.md §1.5

### 2.2 Site Configuration

- [ ] Write `src/site.config.ts` with {BUSINESS_NAME} details:
  - [ ] Business name, tagline, logo path
  - [ ] Contact: phone, email
  - [ ] Location: address, city, state, zip
  - [ ] Hours of operation
  - [ ] Social media links (or remove if N/A)
  - [ ] Navigation items matching manifest pages
  - [ ] Site metadata: `{SITE_URL}`, description, OG image

> **Rules reference:** LLM_BUILD_INSTRUCTIONS.md §1.3

### 2.3 Content Collection Schemas

- [ ] Write `src/content.config.ts` using `glob` loader (Astro 5.x):
  - [ ] Define collections identified in Phase 1 analysis
  - [ ] Use `image()` schema function for image fields
  - [ ] Use `z.object({...})` with appropriate types for each field
- [ ] Verify file is at `src/content.config.ts` (NOT `src/content/config.ts`)

> **Rules reference:** LLM_BUILD_INSTRUCTIONS.md §1.3

### 2.4 Font Setup

- [ ] Identify fonts used in HTML slices
- [ ] Add font preconnect links in `Base.astro` `<head>`
- [ ] Preload critical heading font
- [ ] Wire `--font-heading` / `--font-body` CSS variables

### 2.5 Phase 2 Verification

Run these checks — all must pass before proceeding:

```bash
grep -c "@theme" src/styles/global.css              # ≥ 1
grep -c "oklch" src/styles/global.css                # ≥ 15
ls src/site.config.ts                                # Must exist
ls src/content.config.ts                             # Must exist
ls tailwind.config.mjs 2>/dev/null                   # Must NOT exist
ls src/config/site.ts 2>/dev/null                    # Must NOT exist
ls src/config/theme.ts 2>/dev/null                   # Must NOT exist
ls src/config/business.json 2>/dev/null              # Must NOT exist
ls src/data/site.ts 2>/dev/null                      # Must NOT exist
ls src/content/config.ts 2>/dev/null                 # Must NOT exist
```

- [ ] All positive assertions pass
- [ ] All negative assertions pass (no legacy files)

---

## Phase 3 — Shared Component System

### 3.0 Image Sourcing

> **Preprocessed shortcut:** If `preprocessed/image-config.json` exists, use it as the image inventory (skip manual scanning). Run `python3 fetch_images.py` to batch-download, or use the queries as input to `image-studio fetch`.

- [ ] Inventory all `placehold.co` images from HTML slices (or use `image-config.json`)
- [ ] Download all needed photos to `src/assets/images/photos/`
- [ ] Rename files descriptively (kebab-case, prefixed by section)
- [ ] Update `src/assets/images/ATTRIBUTION.md` with credits
- [ ] Zero `placehold.co` URLs remain

> **Rules reference:** LLM_BUILD_INSTRUCTIONS.md §3.6

### 3.1 Layout Components

- [ ] **Header** — Fixed position with stability patterns:
  - [ ] `whitespace-nowrap` on business name, CTA button, nav links
  - [ ] `flex-shrink-0` on logo and CTA containers
  - [ ] Dynamic `--header-height` script (resize + font load)
  - [ ] Main content has `padding-top: var(--header-height)`
- [ ] **Footer** — Uses ONLY `--color-footer-*` tokens:
  - [ ] `bg-footer-surface`, `text-footer-text`, `border-footer-border`
  - [ ] Footer links, contact info, legal links (Privacy, Terms)

> **Rules reference:** LLM_BUILD_INSTRUCTIONS.md §1.6

### 3.2 Section Components (from manifest analysis)

Build each shared section component identified in Phase 1. For each:

- [ ] Reference the specific HTML slice(s) it derives from
- [ ] Create TypeScript `Props` interface
- [ ] Use ONLY theme tokens for colors (zero hardcoded values)
- [ ] Use `import { Image } from 'astro:assets'` for images
- [ ] Add `text-white` to ALL headings on dark/gradient backgrounds
- [ ] Accept content via props, never hardcode text

| Component Name | Derives From (slice) | Built |
|---------------|---------------------|-------|
| _fill in from Phase 1 analysis_ | | [ ] |
| _fill in from Phase 1 analysis_ | | [ ] |
| _fill in from Phase 1 analysis_ | | [ ] |
| _fill in from Phase 1 analysis_ | | [ ] |
| _fill in from Phase 1 analysis_ | | [ ] |
| _fill in from Phase 1 analysis_ | | [ ] |
| _fill in from Phase 1 analysis_ | | [ ] |
| _fill in from Phase 1 analysis_ | | [ ] |

### 3.3 Common UI Components

- [ ] Button component (primary, accent, outline variants using theme tokens)
- [ ] Container component (max-width wrapper)
- [ ] Icon component (if many icons needed — maps names to inline SVGs)

### 3.4 Phase 3 Verification

```bash
grep -ri "UnsplashImage" src/ --include="*.astro"               # Must be 0
grep -ri "imageResolver" src/ --include="*.ts"                  # Must be 0
grep -rE "generatedKey|backgroundKey|fallbackQuery" src/        # Must be 0
grep -c "whitespace-nowrap" src/components/layout/Header.astro  # ≥ 2
grep -c "flex-shrink-0" src/components/layout/Header.astro      # ≥ 1
grep -c "footer-" src/components/layout/Footer.astro            # > 0
```

- [ ] No legacy image patterns
- [ ] Header stability patterns present
- [ ] Footer uses footer tokens

---

## Phase 4 — Page Assembly & Content

### 4.1 Content Collections

Create JSON files in `src/content/` for each collection:

- [ ] Content follows GA Universe voice guide (LLM_BUILD_INSTRUCTIONS.md §7)
- [ ] Business name: `{BUSINESS_NAME}` (not generic)
- [ ] Staff names: punny industry-related names
- [ ] Services: named after process/precision, not generic
- [ ] No placeholder content (Lorem ipsum, 555- numbers, example.com)
- [ ] Images referenced via relative paths, validated by `image()` schema

### 4.2 Page Routes

Create `.astro` files in `src/pages/` for every page in the manifest:

| Page | Route | Sections (from manifest) | Built |
|------|-------|-------------------------|-------|
| Home | `/` | _list from analysis_ | [ ] |
| _page from manifest_ | _route_ | _sections_ | [ ] |
| _page from manifest_ | _route_ | _sections_ | [ ] |
| _page from manifest_ | _route_ | _sections_ | [ ] |
| _page from manifest_ | _route_ | _sections_ | [ ] |

Each page must:
- [ ] Import `Base.astro` layout
- [ ] Include `<header>`, `<main id="main-content">`, `<footer>` structure
- [ ] Pass title and description to layout for meta tags
- [ ] Wire sections in manifest order
- [ ] Translate spacer slices to padding utilities (not empty wrappers)

### 4.3 Legal & Utility Pages

- [ ] `src/pages/404.astro` — Custom 404 page
- [ ] `src/pages/privacy.astro` — Privacy Policy
- [ ] `src/pages/terms.astro` — Terms of Service
- [ ] Footer includes links to Privacy and Terms pages

### 4.4 Navigation

- [ ] `src/site.config.ts` navigation array matches all created page routes
- [ ] Header nav renders all items
- [ ] All nav links resolve correctly
- [ ] Mobile menu works

### 4.5 Phase 4 Verification

```bash
ls src/pages/index.astro                             # Home
ls src/pages/404.astro                               # 404
ls src/pages/privacy.astro                           # Privacy
ls src/pages/terms.astro                             # Terms
grep -ri "lorem ipsum\|dolor sit" src/               # Must be 0
grep -ri "555-\|example\.com" src/ --include="*.astro" --include="*.ts" --include="*.json"  # Must be 0
```

- [ ] All required pages exist
- [ ] Zero placeholder content

---

## Phase 5 — Verification & QA

### 5.1 Build Check

- [ ] `rm -rf dist/ .astro/ && npm run build` — succeeds with zero errors
- [ ] All pages generated (check `dist/` output)
- [ ] Dist folder size reasonable (< 50MB)

### 5.2 Architecture Compliance

Run the full anti-pattern check from LLM_BUILD_INSTRUCTIONS.md §6:

- [ ] Zero `UnsplashImage` / `unsplash` references (except ATTRIBUTION.md)
- [ ] Zero legacy props (`generatedKey`, `backgroundKey`, `fallbackQuery`)
- [ ] Zero hardcoded Tailwind colors (`neutral-*`, `gray-*`, `slate-*`, `stone-*`, `zinc-*`)
- [ ] Zero hardcoded hex colors in components
- [ ] Zero hardcoded `rgba()` in components
- [ ] Zero placeholder content (Lorem ipsum, fake phone numbers)
- [ ] No forbidden files exist (tailwind.config.mjs, src/config/*, legacy utilities)

### 5.3 Content Quality

- [ ] All images have descriptive alt text (not empty, not "image")
- [ ] No `console.log` / `debugger` statements in production code
- [ ] No unresolved TODOs in shipped code
- [ ] Client directives (`client:load`, `client:visible`) used only where interactivity is required

### 5.4 Accessibility

- [ ] Semantic HTML: `<header>`, `<main>`, `<footer>`, `<nav>`, `<section>`
- [ ] One `<h1>` per page, headings in logical order
- [ ] Skip link present (`#main-content`)
- [ ] All form inputs have labels
- [ ] All interactive elements keyboard-accessible
- [ ] Focus states visible

### 5.5 SEO

- [ ] Each page has `<title>` and `<meta name="description">`
- [ ] OG tags and Twitter card tags present
- [ ] Canonical URL set
- [ ] LocalBusiness structured data present (JSON-LD)
- [ ] Sitemap generated (`@astrojs/sitemap`)

### 5.6 Performance (post-deploy)

| Metric | Target | Actual |
|--------|--------|--------|
| Lighthouse Performance | 90+ | |
| Lighthouse Accessibility | 90+ | |
| Lighthouse Best Practices | 90+ | |
| Lighthouse SEO | 90+ | |
| LCP | < 2.5s | |
| CLS | < 0.1 | |
| INP | < 200ms | |

### 5.7 Cross-Browser (post-deploy)

| Browser | Checked | Notes |
|---------|---------|-------|
| Chrome | [ ] | |
| Firefox | [ ] | |
| Safari | [ ] | |
| Edge | [ ] | |
| Mobile Safari | [ ] | |
| Mobile Chrome | [ ] | |

### 5.8 Visual Review

- [ ] Homepage renders correctly
- [ ] All section pages checked against HTML slice references
- [ ] Dark mode works (if applicable)
- [ ] Mobile responsive (320px–1440px)
- [ ] Footer renders correctly with footer tokens
- [ ] Forms functional (contact, newsletter)
- [ ] All links work
- [ ] Phone numbers clickable (`tel:` href)

---

## Summary

**Template:** {TEMPLATE_SLUG}
**Industry:** {INDUSTRY}
**Business:** {BUSINESS_NAME}
**Date:** _______________

| Phase | Total Checks | Passed | Failed |
|-------|-------------|--------|--------|
| 1. Analysis & Setup (incl. preprocessing) | 20 | | |
| 2. Theme & Configuration | 22 | | |
| 3. Shared Component System (incl. images) | ~25+ | | |
| 4. Page Assembly & Content | ~15+ | | |
| 5. Verification & QA | ~35+ | | |

### Result

- [ ] **PASS** — Site is audit-compliant and ready for deploy review (v2_6)
- [ ] **FAIL** — Fix issues listed below before proceeding

### Issues Found

**Blocking:**
1.
2.

**Non-blocking:**
1.
2.

---

*Implementation Checklist Template v1.1 — See `LLM_BUILD_INSTRUCTIONS.md` for detailed rules*
