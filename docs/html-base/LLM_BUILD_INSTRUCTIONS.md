# LLM Build Instructions — HTML-to-Astro Site Generation

> Self-contained instructions for an LLM building a themed Astro site from HTML slices.
> Version 1.2

---

## §0 Preamble

### What You Receive

1. **`manifest.json`** — An array of slice entries describing every visual section captured from a reference site. Each entry has an `index`, `name`, `page`, `local_html` path, and metadata.
2. **`html/` directory** — HTML snippet files corresponding to each manifest entry. These contain the extracted markup for individual page sections.
3. **Base template repo** — A cloned copy of `astro-local-business-v2`, the GA Universe starter template.
4. **`image-studio` CLI** (or UnsplashFetcher) — Tool for sourcing stock photos from Unsplash. See §3.6 and `IMAGE_WORKFLOW.md` for full details.
5. **`preprocessed/` directory** (if available) — Pre-computed outputs from `preprocess.py` that accelerate Phases 1–3. See "Using Preprocessed Outputs" below.
6. **This document** — The authoritative rules for building an audit-compliant site.

### Preprocessed Outputs (if provided)

If a `preprocessed/` directory exists alongside the HTML slices, it contains script-generated artifacts that replace manual work in Phases 1–2:

| File | Replaces | Description |
|------|----------|-------------|
| `tokens.css` | Phase 2 color extraction | Ready-to-paste `@theme` block with all `--color-*` variables already converted from hex to `oklch()` |
| `components.json` | Phase 1 structural analysis | Every slice grouped by DOM structure. Each entry has a representative HTML file, occurrence count, and which pages use it. Multi-occurrence patterns are shared components (headers, footers, CTAs). |
| `pages.json` | Phase 1 page→section mapping | Each page slug mapped to its ordered list of sections with component IDs |
| `image-config.json` | §3.6 Step 1 (image inventory) | Deduplicated list of all `<img>` alt texts with placehold.co dimensions and save-as filenames |
| `clean-html/` | Raw `html/` files | Boilerplate-stripped HTML (no `<style>`, no CDN tags, no `<html>`/`<head>`/`<body>` wrappers) — ~50% smaller than raw slices |

**When these files exist, use them instead of doing the work manually.** The phases below note where preprocessed outputs apply.

### What You Produce

A fully themed, build-passing Astro site that:
- Renders every page and section described in the manifest
- Follows all architecture rules in §1 (non-negotiable)
- Uses only theme tokens for colors (zero hardcoded values)
- Contains realistic GA Universe demo content (see §7)
- Passes all verification checks in §6

### Assumptions

- The base template has been cloned and `npm install` has been run
- Image assets (photos, logos, icons) are provided or will be sourced during build
- You have access to read all files in the repo and the `html/` directory
- If `preprocessed/` exists, its contents are current (generated from the same `html/` and `manifest.json`)

---

## §1 Architecture Rules (NON-NEGOTIABLE)

These rules are absolute. Violating any of them produces a site that will fail audit.

### 1.1 Stack

| Layer | Required | Version |
|-------|----------|---------|
| Framework | Astro | ^5.0.0 |
| CSS | Tailwind CSS via `@tailwindcss/vite` | ^4.0.0 |
| Language | TypeScript | strict mode |
| Sitemap | `@astrojs/sitemap` | ^3.0.0 |

**Files that MUST NOT exist:**
- `tailwind.config.mjs` — Tailwind v4 uses CSS `@theme` block, not a JS config
- Any reference to `@astrojs/tailwind` — This deprecated integration is replaced by `@tailwindcss/vite`

### 1.2 Directory Structure

```
src/
├── assets/
│   └── images/
│       ├── icons/          # SVG placeholder icons
│       ├── logos/          # Logo files (logo.svg, logo-light.svg)
│       ├── photos/         # JPG/PNG photos
│       ├── placeholders/   # Default placeholder SVG
│       └── ATTRIBUTION.md
├── components/
│   ├── common/            # Reusable UI (Button, Container)
│   ├── core/              # ThemeProvider, critical components
│   ├── forms/             # Form components
│   ├── layout/            # Header, Footer
│   ├── sections/          # Page sections (Hero, CTA, etc.)
│   └── seo/               # Schema, meta components
├── content/               # Content collections (JSON/MD files)
├── layouts/               # Page layouts (Base.astro)
├── pages/                 # Routes
├── styles/                # CSS (global.css, themes.css)
├── utils/                 # Utilities
├── content.config.ts      # Collection schemas (Astro 5.x)
└── site.config.ts         # Centralized site configuration
```

**Directories that MUST NOT exist:**
- `src/assets/images/generated/`
- `src/assets/images/library/`
- `public/images/`
- `public/images/unsplash/`
- `src/config/` (no config subdirectory — use `src/site.config.ts`)

### 1.3 Configuration Files

#### `src/site.config.ts` — Single source of truth for all business data

This is the ONLY configuration file for business info, navigation, contact details, and site metadata.

```typescript
export default {
  business: {
    name: "GrowthAutomations {Industry}",
    tagline: "...",
    logo: "~/assets/images/logos/logo.svg",
    contact: {
      phone: { main: "(XXX) XXX-XXXX", raw: "XXXXXXXXXX" },
      email: "contact@domain.com",
    },
    location: {
      address: { street: "...", city: "...", state: "ST", zip: "XXXXX" }
    },
    hours: { /* ... */ },
    social: { /* ... */ }
  },
  metadata: {
    siteUrl: "https://yourdomain.com",
    // ...
  },
  navigation: [
    // { label: "Home", href: "/" }, ...
  ]
}
```

**Files that MUST NOT exist (legacy config):**
- `src/data/site.ts`
- `src/config/site.ts`
- `src/config/theme.ts`
- `src/config/features.json`
- `src/config/business.json`

#### `src/content.config.ts` — Content collection schemas

Located at `src/content.config.ts` (NOT `src/content/config.ts`). Uses Astro 5.x `glob` loader.

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const staff = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/staff' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    title: z.string(),
    bio: z.string(),
    photo: image().optional(),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/services' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    image: image().optional(),
  }),
});

export const collections = { staff, services };
```

**MUST NOT exist:** `src/content/config.ts` (old Astro 4.x location)

### 1.4 Image System

Use Astro's native `<Image />` component with static imports. No custom wrappers.

```astro
---
import { Image } from 'astro:assets';
import heroPhoto from '@assets/images/photos/hero.jpg';
---
<Image src={heroPhoto} alt="Descriptive alt text" />
```

**Rules:**
- ALWAYS import from `'astro:assets'`, never a custom `Image.astro`
- ALWAYS use static imports: `import img from '@assets/images/...'`
- NEVER use runtime string paths like `src="/images/photo.jpg"`
- NEVER use `public/images/` — all images go in `src/assets/images/`
- For content collection images, use the `image()` schema function for build-time validation
- For background images, use inline styles: `style={`background-image: url(${photo.src});`}`
- SVGs can use `<img src={svgImport.src} alt="..." />` directly

**Files/patterns that MUST NOT exist:**
- `UnsplashImage.astro`
- `imageResolver.ts`
- `unsplash.ts`
- Any `manifest.ts` or `manifest.json` inside `src/`
- Image index aggregator files (`index.ts` inside `images/`)
- Props: `generatedKey`, `backgroundKey`, `fallbackQuery`, `context` (image), `query` (image)
- Any imports from deleted files (`from '...unsplash'`, `from '...generated'`)

### 1.5 Color System

ALL colors are defined as `oklch()` values in the CSS `@theme` block. Components reference these via Tailwind utility classes or `var(--color-*)`.

#### Required `@theme` block structure (in `src/styles/global.css`):

```css
@import "tailwindcss";

@theme {
  /* Primary palette */
  --color-primary: oklch(0.55 0.2 165);
  --color-primary-dark: oklch(0.40 0.18 165);
  --color-primary-light: oklch(0.75 0.15 165);

  /* Accent palette */
  --color-accent: oklch(0.70 0.18 50);
  --color-accent-dark: oklch(0.55 0.16 50);
  --color-accent-light: oklch(0.85 0.12 50);

  /* Surfaces & text */
  --color-background: oklch(0.99 0.005 0);
  --color-surface: oklch(0.97 0.005 0);
  --color-surface-alt: oklch(0.95 0.005 0);
  --color-text-primary: oklch(0.15 0.01 0);
  --color-text-secondary: oklch(0.35 0.01 0);
  --color-text-muted: oklch(0.55 0.01 0);
  --color-border: oklch(0.85 0.01 0);

  /* Contrast text */
  --color-on-primary: oklch(0.99 0 0);
  --color-on-accent: oklch(0.99 0 0);

  /* Footer tokens (always dark, don't change between modes) */
  --color-footer-accent: oklch(0.7 0.2 165);
  --color-footer-text: oklch(0.97 0.005 165);
  --color-footer-text-secondary: oklch(0.85 0.02 165);
  --color-footer-text-muted: oklch(0.7 0.02 165);
  --color-footer-border: oklch(0.3 0.03 165);
  --color-footer-surface: oklch(0.2 0.03 165);
}
```

**Color rules:**
- ZERO hardcoded Tailwind default colors: `neutral-*`, `gray-*`, `slate-*`, `stone-*`, `zinc-*`
- ZERO hardcoded hex values (`#1a2b3c`) in components or pages
- ZERO hardcoded `rgba()` in components or pages
- ZERO `--tw-color-*` variables (use `--color-*` prefix)
- Footer MUST use `--color-footer-*` tokens, never main theme tokens
- ALL variable names use `--color-` prefix with `oklch()` values

**Component color usage — correct patterns:**

```html
<!-- Tailwind classes referencing theme tokens -->
class="bg-primary text-on-primary"
class="bg-surface text-text-primary"
class="border-border"
class="text-text-muted"
class="bg-footer-surface text-footer-text"
```

```css
/* CSS custom properties */
background: var(--color-primary);
color: var(--color-text-primary);
```

#### Dark mode

Uses `[data-theme="dark"]` selector (NOT `.dark` class).

```css
[data-theme="dark"] {
  --color-background: oklch(0.15 0.01 0);
  --color-surface: oklch(0.20 0.01 0);
  --color-text-primary: oklch(0.95 0.005 0);
  /* ... inverted values */
}
```

#### Dark section headings

Global CSS sets headings to `text-text-primary`. On dark/gradient backgrounds, you MUST add explicit `text-white` to headings:

```astro
<!-- On dark/gradient sections, headings need explicit text-white -->
<section class="bg-gradient-to-br from-primary to-primary-dark text-white">
  <h2 class="font-heading font-bold text-white">Section Title</h2>
</section>
```

#### Hardcoded-to-token translation reference

| Hardcoded Class | Replace With |
|-----------------|-------------|
| `bg-neutral-900` | `bg-surface` (dark context) |
| `bg-neutral-800` | `bg-surface` |
| `bg-neutral-200` | `bg-surface-alt` |
| `bg-neutral-100` | `bg-surface-alt` |
| `bg-neutral-50` | `bg-background` |
| `text-neutral-900` | `text-text-primary` |
| `text-neutral-700` | `text-text-secondary` |
| `text-neutral-500` | `text-text-muted` |
| `border-neutral-200` | `border-border` |

### 1.6 Header Stability Patterns

The header must not reflow on font load or window resize.

**Required patterns in `Header.astro`:**

| Element | Required Class | Why |
|---------|---------------|-----|
| Business name | `whitespace-nowrap` | Prevents text wrap on font load |
| CTA button | `whitespace-nowrap` | Prevents button text wrap |
| Nav links | `whitespace-nowrap` | Prevents nav reflow |
| Logo container | `flex-shrink-0` | Prevents logo shrinking |
| CTA container | `flex-shrink-0` | Prevents CTA shrinking |

**Required infrastructure:**
- `position: fixed` header with CSS variable height
- Main content: `padding-top: var(--header-height)`
- Dynamic `--header-height` updated on resize and font load:

```html
<script>
  function updateHeaderHeight() {
    const header = document.querySelector('header');
    if (header) {
      const height = header.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
  }
  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight);
  document.fonts?.ready.then(updateHeaderHeight);
</script>
```

**Font loading:**
- Font preconnect configured in `Base.astro` `<head>`
- Critical heading font preloaded

---

## §2 Reading the Manifest

### 2.1 Manifest Schema

Each entry in `manifest.json` is an object:

| Field | Type | Description |
|-------|------|-------------|
| `index` | integer | Sort order. Use to sequence sections within a page. |
| `name` | string | Canonical slice ID. Pattern: `<pageSlug>_p<nn>_s<start>pct_l<length>pct.ext` |
| `page` | string | Human-readable page label + optional Notion URL. Split on `(` for the plain page name. |
| `site_template` | string | Design system identifier (e.g., template family name). |
| `status` | string | Export lifecycle flag. Currently always `imageCropAndHtml`. |
| `source_html` | URL | Hosted HTML snippet from the cropping tool. |
| `local_html` | string | Relative path to the checked-in HTML file. Strip any `automatetemplates/` prefix when resolving. |
| `crop_section` | URL | Image crop used to derive the HTML. Use for visual reference. |
| `drive_id` | string | Placeholder for Google Drive asset IDs. Usually empty. |

### 2.2 Parsing Slice Names

The `name` field encodes position information:

```
services_p03_s020pct_l043pct.jpg
│         │    │          │
│         │    │          └── length: crop spans 43% of page height
│         │    └── start: crop begins 20% from top
│         └── position: 3rd section from top
└── page slug
```

- **`_p01_` through `_pNN_`**: vertical sections from top to bottom
- **`_s###pct_`**: start percentage from page top
- **`_l###pct_`**: length percentage of the crop
- Percentages across all slices for a page add up to ~100%

### 2.3 Section Type Classification

When reading HTML slices, classify each section:

| Pattern in HTML | Section Type | Component Approach |
|----------------|--------------|-------------------|
| Thin gradient bar, no content | Accent strip | CSS utility or thin component |
| Large hero with nav, CTA, background image | Hero section | Hero component with props |
| Cards in a grid layout | Card grid | Shared grid + card component |
| Stats/numbers with labels | Stats section | Stats component with data prop |
| Testimonial quotes with attribution | Testimonials | Testimonial component |
| Contact form + info grid | Contact section | Form + info layout |
| Step-by-step process (numbered) | Process/timeline | Timeline component |
| Image + text side-by-side | Split section | Flexible 2-column layout |
| CTA bar with button | CTA ribbon | CTA component |
| Padding/whitespace only | Spacer | Tailwind padding utility (not a component) |
| Footer with links, contact, social | Footer | Footer layout component |
| Header/navigation bar | Header | Header layout component |

### 2.4 Identifying Reusable Components vs Page-Specific Sections

1. **Group slices by page** — Sort manifest entries by `page`, then by `index` within each page
2. **Find repeated structures** — If the same layout appears on 2+ pages, it's a shared component
3. **Name components generically** — Don't use industry-specific names. Use `HeroSection`, `CardGrid`, `ProcessTimeline`, not `HvacHero`, `ServiceGrid`
4. **Spacer slices** → Tailwind padding utilities (`py-16`, `py-24`), never empty wrapper components

---

## §3 HTML-to-Astro Translation Rules

### 3.1 General Translation

**Strip from HTML slices:**
- `<html>`, `<head>`, `<body>` wrappers
- CDN script/link tags (Bootstrap, jQuery, Font Awesome CDN)
- Inline `<style>` blocks (translate to Tailwind classes or `global.css`)
- Google Analytics/tracking scripts

**Keep:**
- Semantic structure (`<section>`, `<article>`, `<nav>`, `<header>`, `<footer>`)
- Content text, headings, and hierarchy
- Layout intent (grids, flex, columns)
- Relative ordering of elements

**Convert:**
- Bootstrap/CSS grid → Tailwind equivalents
- Inline styles → Tailwind utility classes using theme tokens
- `<div>` soup → Semantic HTML where appropriate
- ID selectors → Class-based styling

### 3.2 Color Translation

Map every hardcoded color in the HTML to a theme token:

| HTML Pattern | Astro Equivalent |
|-------------|-----------------|
| `style="color: #1a2b3c"` | `class="text-text-primary"` |
| `style="background: #f5f5f5"` | `class="bg-surface-alt"` |
| `style="background: #0066cc"` | `class="bg-primary"` |
| `style="border: 1px solid #ddd"` | `class="border border-border"` |
| Dark backgrounds with light text | `class="bg-primary text-on-primary"` |
| Accent/CTA buttons | `class="bg-accent text-on-accent"` |

Never carry hex/rgb values from the HTML into Astro components. Always translate to theme tokens.

### 3.3 Image Translation

| HTML Pattern | Astro Equivalent |
|-------------|-----------------|
| `<img src="https://placehold.co/800x600">` | Static import + `<Image src={imported} alt="..." />` |
| `<img src="images/photo.jpg">` | `import photo from '@assets/images/photos/photo.jpg'` then `<Image src={photo} alt="..." />` |
| `background-image: url(...)` | `import bg from '@assets/...'; style={`background-image: url(${bg.src})`}` |
| Font Awesome icons | Inline SVG or dedicated Icon component |

**For placeholder images** (`placehold.co`, empty `src`): source an appropriate industry-relevant photo, save to `src/assets/images/photos/`, and import statically.

### 3.4 Icon Translation

HTML slices often use Font Awesome `<i>` tags. Convert these:

```html
<!-- HTML slice -->
<i class="fas fa-phone"></i>

<!-- Astro equivalent: inline SVG -->
<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
  <path d="..."/>
</svg>
```

If many icons are needed, create a simple `Icon.astro` component that maps icon names to SVG paths. Do NOT add Font Awesome as a dependency.

### 3.5 Component Architecture

Every component must:
- Have a TypeScript `Props` interface
- Use only theme tokens for colors (no hardcoded values)
- Accept content via props or slots, never hardcode content text
- Use `astro:assets` for any images

```astro
---
interface Props {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const { title, description, ctaLabel = "Learn More", ctaHref = "#" } = Astro.props;
---

<section class="py-16 bg-surface">
  <div class="max-w-7xl mx-auto px-4">
    <h2 class="text-3xl font-heading font-bold text-text-primary">{title}</h2>
    <p class="mt-4 text-text-secondary">{description}</p>
    {ctaLabel && (
      <a href={ctaHref} class="mt-6 inline-block bg-primary text-on-primary px-6 py-3 rounded-lg">
        {ctaLabel}
      </a>
    )}
  </div>
</section>
```

### 3.6 Image Sourcing

HTML slices use `placehold.co` URLs as image placeholders. Before building components, you must source real photos and save them locally. **No `placehold.co` URLs may remain in the final site.**

#### Step 1 — Inventory images from HTML slices

> **Preprocessed shortcut:** If `preprocessed/image-config.json` exists, skip this step. The file contains a deduplicated list of all images with `query`, `dimensions`, `save_as` filename, and `pages` where each image is used. Proceed directly to Step 2 using those queries.

Scan all HTML files for `<img>` tags. Each `placehold.co` URL includes dimensions and each tag includes an `alt` attribute with a description written by the screenshot-to-code tool:

```html
<!-- Typical HTML slice image -->
<img src="https://placehold.co/800x600" alt="Professional barista pouring latte art in a modern coffee shop">
```

Build a list of every unique image needed:

| Alt Text (from HTML) | Dimensions | Target Filename | Component |
|---------------------|------------|-----------------|-----------|
| Professional barista pouring... | 800×600 | `hero-coffee-shop.jpg` | Hero |
| Cozy cafe interior... | 600×400 | `about-interior.jpg` | About |

#### Step 2 — Download using image-studio CLI

Use the `alt` text as the search query. Download one image per unique need:

```bash
# Single image
image-studio fetch "professional barista pouring latte art" --count 1 --output src/assets/images/photos

# Batch: multiple images
image-studio fetch "cozy cafe interior warm lighting" --count 1 --output src/assets/images/photos
image-studio fetch "espresso machine close up" --count 1 --output src/assets/images/photos
```

Alternatively, use the UnsplashFetcher TypeScript API for batch operations (see `unsplash-image-fetcher/src/fetcher.ts`).

#### Step 3 — Rename files descriptively

Downloaded files may have generic names. Rename to match their purpose:

```
photo-abc123.jpg  →  hero-coffee-shop.jpg
photo-def456.jpg  →  about-interior.jpg
photo-ghi789.jpg  →  service-espresso.jpg
```

**Naming conventions:**
- Use kebab-case: `hero-coffee-shop.jpg`
- Prefix with the section/component name: `hero-`, `about-`, `service-`, `team-`, `gallery-`
- Be specific: `team-dr-sarah.jpg` not `person-1.jpg`

#### Step 4 — Update ATTRIBUTION.md

Every sourced image must be credited in `src/assets/images/ATTRIBUTION.md`:

```markdown
### hero-coffee-shop.jpg
- **Photographer**: [Name](https://unsplash.com/@username)
- **Source**: [Unsplash](https://unsplash.com/photos/photo-id)
- **Description**: Professional barista pouring latte art
- **Downloaded**: 2026-01-15
```

#### Step 5 — Replace placeholders in components

When building components (Phase 3+), use static imports to reference the local files:

```astro
---
import { Image } from 'astro:assets';
import heroPhoto from '@assets/images/photos/hero-coffee-shop.jpg';
---
<Image src={heroPhoto} alt="Professional barista pouring latte art in a modern coffee shop" />
```

> **Reference:** See `IMAGE_WORKFLOW.md` for the complete two-phase workflow, directory structure, optimization settings, and troubleshooting.

---

## §4 Build Phases

### Phase 1 — Analysis (READ ONLY)

Do not write any code in this phase. Only read and analyze.

> **Preprocessed shortcut:** If `preprocessed/components.json` and `preprocessed/pages.json` exist, skip steps 1–4 below. Those files already contain the structural analysis, page→section mapping, shared-component identification, and occurrence counts. Start at step 5 using the preprocessed data, then document your plan (step 6). Read `clean-html/` files instead of raw `html/` files — they are boilerplate-stripped and ~50% smaller.

1. **Parse the manifest** — Load `manifest.json`, group entries by page
2. **Read every HTML slice** — For each page, read slices in order (`p01` → `pNN`)
3. **Classify sections** — Use the decision tree in §2.3 to label each slice
4. **Identify shared components** — Find layouts that repeat across 2+ pages
5. **Map to base template** — Determine which base components can be reused vs. need creation
6. **Document your plan** — List every page, its sections, and the component each maps to

**Output:** A written analysis (comment or separate note) listing:
- Pages to create (with route paths)
- Shared components to build (with the slices they correspond to)
- Content collections needed
- Any ambiguities or questions

### Phase 2 — Theme & Config

> **Preprocessed shortcut:** If `preprocessed/tokens.css` exists, skip step 1 below — paste the `@theme` block directly into `src/styles/global.css`. The file contains all `--color-*` variables already converted from hex to `oklch()`.

1. **Extract colors** from HTML slices → Convert to `oklch()` values
   - Identify the primary brand color, accent, and neutral palette
   - Use an oklch converter for hex → oklch translation
2. **Write the `@theme` block** in `src/styles/global.css`
   - Include ALL required variables from §1.5
   - Include footer-specific tokens
   - Include dark mode overrides
3. **Write `src/site.config.ts`** with all business information
   - Business name, tagline, contact info, hours, social links
   - Navigation items (derived from manifest page list)
   - Site metadata (URL, description, OG image)
4. **Write `src/content.config.ts`** with collection schemas
   - Define collections based on manifest content types (services, staff, testimonials, etc.)
   - Use `glob` loader and `image()` schema function
5. **Import fonts** — If the HTML uses specific fonts, configure preload in `Base.astro`

**Phase 2 verification (run before proceeding):**

```bash
# @theme block exists with oklch values
grep -c "@theme" src/styles/global.css              # Should be ≥ 1
grep -c "oklch" src/styles/global.css                # Should be ≥ 15

# Correct config files exist
ls src/site.config.ts                                # Must exist
ls src/content.config.ts                             # Must exist

# Legacy config files do NOT exist
ls tailwind.config.mjs 2>/dev/null                   # Must NOT exist
ls src/config/site.ts 2>/dev/null                    # Must NOT exist
ls src/config/theme.ts 2>/dev/null                   # Must NOT exist
ls src/config/business.json 2>/dev/null              # Must NOT exist
ls src/data/site.ts 2>/dev/null                      # Must NOT exist
ls src/content/config.ts 2>/dev/null                 # Must NOT exist

# No hardcoded Tailwind colors
grep -rE "neutral-[0-9]|gray-[0-9]|slate-[0-9]|stone-[0-9]|zinc-[0-9]" src/ --include="*.astro" --include="*.css" | wc -l  # Must be 0
```

### Phase 3 — Shared Components

**Before building components**, source all needed images from the HTML slice `alt` texts using the workflow in §3.6. This ensures every component can reference real local photos via static imports.

Build reusable components identified in Phase 1, starting with layout:

1. **Header** — Fixed position, `whitespace-nowrap`, `flex-shrink-0`, dynamic `--header-height`
2. **Footer** — Uses `--color-footer-*` tokens exclusively
3. **Section components** — One per identified shared pattern (Hero, CardGrid, Timeline, etc.)
4. **Common UI** — Button, Container, any reused small elements

For each component:
- Reference the specific HTML slice(s) it derives from
- Create a TypeScript `Props` interface
- Use only theme tokens
- Add `text-white` to headings on dark/gradient backgrounds

**Phase 3 verification:**

```bash
# No UnsplashImage or custom wrappers
grep -ri "UnsplashImage" src/ --include="*.astro"               # Must be 0
grep -ri "imageResolver" src/ --include="*.ts"                  # Must be 0

# No legacy props
grep -rE "generatedKey|backgroundKey|fallbackQuery" src/        # Must be 0

# Images use astro:assets
grep -c "from 'astro:assets'" src/components/**/*.astro          # Should be > 0

# Header stability
grep -c "whitespace-nowrap" src/components/layout/Header.astro   # Should be ≥ 2
grep -c "flex-shrink-0" src/components/layout/Header.astro       # Should be ≥ 1

# Footer uses footer tokens
grep -c "footer-" src/components/layout/Footer.astro             # Should be > 0
```

### Phase 4 — Content Collections & Page Assembly

1. **Create content files** — JSON files in `src/content/` for each collection (services, staff, testimonials, etc.)
   - Each file: realistic GA Universe content (see §7)
   - Images referenced via relative paths validated by `image()` schema
2. **Build pages** — Create `.astro` files in `src/pages/` for every route in the manifest
   - Each page imports its section components and passes data via props
   - Pages use `Base.astro` layout
   - Include `<header>`, `<main id="main-content">`, `<footer>` structure
3. **Legal pages** — Create `privacy.astro`, `terms.astro`, `404.astro`
4. **Wire navigation** — Ensure `site.config.ts` navigation matches created pages

**Phase 4 verification:**

```bash
# Content collections exist
ls src/content/                                      # Should list collection directories

# Required pages exist
ls src/pages/index.astro                             # Home
ls src/pages/404.astro                               # 404
ls src/pages/privacy.astro                           # Privacy
ls src/pages/terms.astro                             # Terms

# No placeholder content
grep -ri "lorem ipsum\|dolor sit\|consectetur adipiscing" src/  # Must be 0
grep -ri "555-\|example\.com\|your-domain" src/ --include="*.astro" --include="*.ts" --include="*.json"  # Must be 0

# Each page uses the layout
grep -c "Base" src/pages/*.astro                     # Should match page count
```

### Phase 5 — Page Assembly (continued)

Wire remaining pages from the manifest section order. For each page:

1. Match manifest sections to built components
2. Order sections by `index` / `pNN` value
3. Translate spacer slices to padding utilities
4. Verify headings on dark backgrounds have `text-white`

### Phase 6 — Final Verification

Run a complete build and all checks:

```bash
# Clean build
rm -rf dist/ .astro/
npm run build                                        # Must succeed with 0 errors

# Positive assertions — these MUST be true
ls src/site.config.ts && echo "✓ site.config.ts"
ls src/content.config.ts && echo "✓ content.config.ts"
grep -q "@theme" src/styles/global.css && echo "✓ @theme block"
grep -q "oklch" src/styles/global.css && echo "✓ oklch colors"
grep -q "from 'astro:assets'" src/components/layout/Header.astro 2>/dev/null || \
  grep -q "from 'astro:assets'" src/components/sections/*.astro && echo "✓ astro:assets used"
grep -q "glob" src/content.config.ts && echo "✓ glob loader"
grep -q "data-theme" src/styles/global.css && echo "✓ dark mode selector"

# Negative assertions — these MUST return 0 results
echo "--- Anti-pattern checks (all must be 0) ---"
grep -ri "UnsplashImage" src/ --include="*.astro" | wc -l
grep -ri "unsplash" src/ --include="*.astro" --include="*.ts" | grep -v ATTRIBUTION | wc -l
grep -rE "generatedKey|backgroundKey|fallbackQuery" src/ | wc -l
grep -rE "neutral-[0-9]|gray-[0-9]|slate-[0-9]|stone-[0-9]|zinc-[0-9]" src/components/ src/pages/ --include="*.astro" | wc -l
grep -rE "#[0-9A-Fa-f]{6}" src/components/ --include="*.astro" | grep -v "var(--" | wc -l
grep -rE "rgba?\([0-9]" src/components/ --include="*.astro" | grep -v "var(--" | wc -l
grep -ri "lorem ipsum\|dolor sit" src/ | wc -l
grep -ri "555-\|example\.com" src/ --include="*.astro" --include="*.ts" --include="*.json" | wc -l
ls tailwind.config.mjs 2>/dev/null && echo "FAIL: tailwind.config.mjs exists"
ls src/config/theme.ts 2>/dev/null && echo "FAIL: src/config/theme.ts exists"
ls src/config/business.json 2>/dev/null && echo "FAIL: src/config/business.json exists"
ls src/data/site.ts 2>/dev/null && echo "FAIL: src/data/site.ts exists"
ls src/content/config.ts 2>/dev/null && echo "FAIL: src/content/config.ts exists"
ls public/images/ 2>/dev/null && echo "FAIL: public/images/ exists"
ls src/components/ui/UnsplashImage.astro 2>/dev/null && echo "FAIL: UnsplashImage exists"
ls src/utils/unsplash.ts 2>/dev/null && echo "FAIL: unsplash.ts exists"

# Image sourcing checks
ls src/assets/images/photos/ | wc -l                  # Should be > 0 (photos exist)
test -f src/assets/images/ATTRIBUTION.md && echo "PASS: ATTRIBUTION.md exists" || echo "FAIL: missing ATTRIBUTION.md"
grep -ri "placehold\.co" src/ --include="*.astro" | wc -l  # Must be 0
grep -ri "placehold\.co" src/ --include="*.ts" --include="*.json" | wc -l  # Must be 0

# Client directive audit
grep -r "client:" src/components/ --include="*.astro" | head -10
# ↑ Review: each must be justified (interactivity required). Static components should have ZERO client directives.

# Accessibility quick check
grep -r 'alt=""' src/ --include="*.astro" | head -10
# ↑ Review: only decorative images should have empty alt
```

---

## §5 Anti-Patterns (MUST NOT appear)

### 5.1 Files That Must Not Exist

| File/Directory | Why |
|---------------|-----|
| `tailwind.config.mjs` | Tailwind v4 uses CSS `@theme`, not JS config |
| `src/config/theme.ts` | Colors belong in CSS `@theme` block |
| `src/config/business.json` | Use `src/site.config.ts` |
| `src/config/site.ts` | Use `src/site.config.ts` (root level) |
| `src/data/site.ts` | Legacy location — use `src/site.config.ts` |
| `src/content/config.ts` | Legacy Astro 4.x — use `src/content.config.ts` |
| `src/components/ui/UnsplashImage.astro` | Use native `Image` from `astro:assets` |
| `src/components/ui/Image.astro` | No custom wrapper needed |
| `src/utils/unsplash.ts` | Legacy image fetching |
| `src/utils/imageResolver.ts` | Legacy image resolution |
| `src/utils/sections.ts` | Legacy section utility |
| `public/images/` | Images go in `src/assets/images/` |
| `public/images/unsplash/` | Delete entirely |
| `src/assets/images/generated/` | Legacy — delete |
| `src/assets/images/library/` | Legacy — migrate to `icons/` |
| Any `manifest.ts` inside `src/` | Legacy |
| Any `index.ts` inside `src/assets/images/` | Legacy aggregator |

### 5.2 Code Patterns That Must Not Appear

| Pattern | Why | Replace With |
|---------|-----|-------------|
| `generatedKey` prop | Legacy image system | Static import |
| `backgroundKey` prop | Legacy image system | Static import |
| `fallbackQuery` prop | Legacy image system | Static import |
| `context` prop on images | Legacy image system | Remove |
| `query` prop on images | Legacy image system | Remove |
| `resolveImage()` | Legacy utility | Static import from `astro:assets` |
| `findImage()` | Legacy utility | Static import from `astro:assets` |
| `import.*from.*unsplash` | Legacy import | Remove |
| `import.*from.*generated` | Legacy import | Remove |
| `console.log` / `console.debug` | Debug code | Remove |
| `debugger` | Debug code | Remove |
| `eval()` / `Function()` | Security risk | Remove |
| `class="dark ..."` for dark mode | Wrong selector | Use `[data-theme="dark"]` |
| `@astrojs/tailwind` in config | Deprecated | Use `@tailwindcss/vite` |
| `neutral-[0-9]` | Hardcoded Tailwind color | Use theme token |
| `gray-[0-9]`, `slate-[0-9]` | Hardcoded Tailwind color | Use theme token |
| `stone-[0-9]`, `zinc-[0-9]` | Hardcoded Tailwind color | Use theme token |
| `#[0-9A-Fa-f]{6}` in components | Hardcoded hex | Use theme token |
| `rgba(` in components | Hardcoded color | Use theme token |
| `--tw-color-*` | Wrong variable prefix | Use `--color-*` |
| `client:load` on static components | Unnecessary JS | Remove directive |
| `style="color: ..."` (hardcoded) | Inline hardcoded color | Use Tailwind class |

### 5.3 Content Patterns That Must Not Appear

| Pattern | Why |
|---------|-----|
| "Lorem ipsum" / "dolor sit amet" | Placeholder text |
| "placeholder" / "sample text" / "example text" | Placeholder text |
| Phone numbers with `555-` | Fake contact info |
| `example.com` emails | Fake contact info |
| `your-domain.com` / `yourdomain.com` | Uncustomized placeholder |
| `alt=""` (unless intentionally decorative) | Missing alt text |
| `alt="image"` / `alt="photo"` | Generic non-descriptive alt |
| `XXX-XXXX` patterns | Uncustomized placeholder |
| Empty `<title>` or missing meta description | Incomplete SEO |

---

## §6 Verification Commands

### Per-Phase Checks

Run the verification commands listed at the end of each phase in §4 before proceeding to the next phase. All checks must pass.

### Final Build Verification

```bash
# 1. Build must succeed
npm run build

# 2. Count generated pages
ls dist/ | wc -l

# 3. Required files exist
test -f src/site.config.ts && echo "PASS" || echo "FAIL: missing site.config.ts"
test -f src/content.config.ts && echo "PASS" || echo "FAIL: missing content.config.ts"
test -f src/styles/global.css && echo "PASS" || echo "FAIL: missing global.css"
test -f src/pages/404.astro && echo "PASS" || echo "FAIL: missing 404 page"
test -f src/pages/privacy.astro && echo "PASS" || echo "FAIL: missing privacy page"
test -f src/pages/terms.astro && echo "PASS" || echo "FAIL: missing terms page"

# 4. Theme block integrity
grep -c "oklch" src/styles/global.css  # Should be ≥ 20

# 5. Zero anti-patterns (combined check)
FAILS=0
grep -ri "UnsplashImage\|unsplash" src/ --include="*.astro" --include="*.ts" | grep -v ATTRIBUTION | wc -l | { read n; [ "$n" -gt 0 ] && echo "FAIL: Unsplash references ($n)" && FAILS=$((FAILS+1)); }
grep -rE "generatedKey|backgroundKey|fallbackQuery" src/ | wc -l | { read n; [ "$n" -gt 0 ] && echo "FAIL: Legacy props ($n)" && FAILS=$((FAILS+1)); }
grep -rE "neutral-[0-9]|gray-[0-9]|slate-[0-9]" src/components/ src/pages/ --include="*.astro" | wc -l | { read n; [ "$n" -gt 0 ] && echo "FAIL: Hardcoded colors ($n)" && FAILS=$((FAILS+1)); }
grep -ri "lorem ipsum\|555-\|example\.com" src/ --include="*.astro" --include="*.ts" --include="*.json" | wc -l | { read n; [ "$n" -gt 0 ] && echo "FAIL: Placeholder content ($n)" && FAILS=$((FAILS+1)); }
echo "Anti-pattern failures: $FAILS"
```

---

## §7 GA Universe Voice Guide (Condensed)

When generating content for the site, follow the GA Universe voice:

### The Concept

GA Universe templates use **deadpan occupational displacement** — Growth Automations earnestly runs a business in another industry. The comedy comes from applying tech/SaaS vocabulary to trades and services.

**Tone:** Parks & Recreation earnestness, not Silicon Valley satire. Calm, neutral, professional, human, durable.

### Naming

- **Business name:** `GrowthAutomations {Industry Term}` (e.g., "GrowthAutomations Brewing Co.")
- **Tagline:** `{Industry craft} + {systems/automation concept}` (e.g., "Craft beer that runs like clockwork")
- **Services:** Name after the *process*, not just the outcome (e.g., "Precision Diagnostics" not "AC Repair")
- **Staff names:** Punny names from industry tools/terms (e.g., Barley Hopper, Cliff Trimmer, Flo Ventura)

### Staff Bios

Write like SaaS LinkedIn profiles for the industry:

> "Barley brings precision science to the art of brewing. She developed our automated fermentation monitoring system that ensures batch-to-batch consistency."

### Stats

Apply SaaS metrics to the industry: "99% Batch Consistency", "4-Hour Response Window", "Zero Reservation Errors"

### Testimonials

Customers praise the *systems* alongside the product:

> "Best IPA in Portland. And I've never waited more than 2 minutes for a pour."

### What to Play Straight (NO humor)

- Menu items / service descriptions
- Prices
- Contact information
- Legal pages (Terms, Privacy)
- Form labels
- Error messages

### Avoid

- Flashy/hype copy ("AMAZING!", "BEST EVER!")
- Trend-chasing references (memes, TikTok slang)
- Aggressive humor (sarcasm, snark)
- "AI magic" language ("powered by AI", "smart", "intelligent")

---

*LLM Build Instructions v1.2*
