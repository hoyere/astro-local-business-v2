# Structure & Architecture Audit v2.2

> File organization, component patterns, dead code removal
> **Phase 1, Step 2** - Theme-agnostic

---

## Pre-Audit

- [ ] Code Audit (v2_1) passed
- [ ] Build succeeds
- [ ] Dev server running for verification

---

## 1. Directory Structure

### 1.1 Required Structure

```bash
ls -la src/
```

**Target Structure:**
```
src/
├── assets/
│   └── images/
│       ├── icons/        # SVG placeholder icons
│       ├── logos/        # Logo files (logo.svg, logo-light.svg)
│       ├── photos/       # JPG/PNG photos
│       ├── placeholders/ # Default placeholder SVG
│       └── ATTRIBUTION.md
├── components/
│   ├── core/            # ThemeProvider, etc.
│   ├── forms/           # Form components
│   ├── layout/          # Header, Footer
│   ├── sections/        # Page sections
│   └── ui/              # Reusable UI (Image, Button)
├── content/             # Content collections
├── data/                # Site config (site.ts)
├── layouts/             # Page layouts
├── pages/               # Routes
├── styles/              # CSS (global.css, themes.css)
└── utils/               # Utilities
```

| Check | Status | Notes |
|-------|--------|-------|
| `src/assets/images/` structure correct | | |
| `src/components/` organized by type | | |
| `src/content/` has collections | | |
| `src/data/` has site config | | |
| `src/styles/` has global + themes | | |
| No orphan files in src/ root | | |

### 1.2 Image Directory

```bash
ls -la src/assets/images/
du -sh src/assets/images/
```

| Check | Status | Notes |
|-------|--------|-------|
| `icons/` directory exists | | SVG placeholders |
| `logos/` directory exists | | logo.svg, logo-light.svg |
| `photos/` directory exists | | Actual photos |
| `placeholders/` directory exists | | default.svg fallback |
| No `generated/` directory | | Legacy - delete |
| No `library/` directory | | Legacy - migrate to icons/ |
| No `manifest.*` files | | Legacy - delete |
| ATTRIBUTION.md exists | | Image credits |
| Total size reasonable (< 20MB) | | Size: ___ |

### 1.3 Public Directory Cleanup

```bash
# Should NOT exist
ls public/images/ 2>/dev/null
ls public/images/unsplash/ 2>/dev/null
```

| Check | Status | Notes |
|-------|--------|-------|
| No `public/images/` directory | | Move to src/assets |
| No `public/images/unsplash/` | | Delete entirely |
| `public/favicon.svg` exists | | |
| `public/og-image.jpg` exists | | |

---

## 2. Dead Code Removal

### 2.1 Unused Files

```bash
# Find manifest files (should be zero)
find src -name "manifest.*"

# Find index aggregators in images (should be zero)
find src -name "index.ts" -path "*/images/*"

# Check for legacy components
ls src/components/ui/UnsplashImage.astro 2>/dev/null

# Find unused utilities
ls src/utils/
```

| Check | Status | Notes |
|-------|--------|-------|
| No `manifest.ts` files | | |
| No `manifest.json` files | | |
| No image index aggregators | | |
| No `unsplash.ts` utility | | |
| No `UnsplashImage.astro` component | | Use `Image.astro` |
| No `sections.ts` utility | | Legacy |
| No unused config files | | |

### 2.2 Dead Props

```bash
# Check for legacy props that should be removed
grep -r "generatedKey" src/ --include="*.astro" --include="*.ts"
grep -r "backgroundKey" src/ --include="*.astro"
grep -r "fallbackQuery" src/ --include="*.astro"
grep -r "context" src/components/ --include="*.astro" | grep -i image
```

| Check | Status | Notes |
|-------|--------|-------|
| No `generatedKey` props | | |
| No `backgroundKey` props | | |
| No `fallbackQuery` props | | |
| No legacy `context` image props | | |

### 2.3 Dead Imports

```bash
# Find imports that might be unused
grep -r "import.*from" src/ --include="*.astro" | grep -E "unsplash|generated"
```

| Check | Status | Notes |
|-------|--------|-------|
| No imports from deleted files | | |
| No unused utility imports | | |
| All imports resolve | | |

---

## 3. Component Architecture

### 3.1 Component Organization

```bash
ls src/components/*/
```

| Directory | Purpose | Clean |
|-----------|---------|-------|
| `core/` | ThemeProvider, critical components | |
| `forms/` | Form components | |
| `layout/` | Header, Footer | |
| `sections/` | Page sections (Hero, CTA, etc.) | |
| `ui/` | Reusable UI (Image, Button) | |

### 3.2 Component Props

For each major component, verify clean Props interface:

```typescript
// Clean Props interface
interface Props {
  src?: string;
  alt?: string;
  title?: string;
  // No dead/legacy props
}
```

| Component | Props Clean | Notes |
|-----------|-------------|-------|
| `Image.astro` | | No dead props |
| `Header.astro` | | |
| `Footer.astro` | | |
| `HeroBanner.astro` | | |
| `PageHero.astro` | | |

### 3.3 Layout Components

```bash
ls src/layouts/
cat src/layouts/Base.astro | head -30
```

| Check | Status | Notes |
|-------|--------|-------|
| Base layout exists | | |
| Base includes meta tags | | |
| Base includes theme support | | |
| Layouts are minimal (slots used) | | |

### 3.4 Header Stability

Header must not reflow on font load or window resize.

```bash
# Check for stability patterns
grep -rE "whitespace-nowrap|flex-shrink-0" src/components/layout/Header.astro
grep -rE "header-height" src/components/layout/Header.astro
grep -r "preload.*font\|preconnect" src/layouts/Base.astro
```

| Check | Status | Notes |
|-------|--------|-------|
| Business name has `whitespace-nowrap` | | Prevents text wrap on font load |
| CTA button has `whitespace-nowrap` | | Prevents button text wrap |
| Nav links have `whitespace-nowrap` | | Prevents nav reflow |
| Logo container has `flex-shrink-0` | | Prevents logo shrinking |
| CTA container has `flex-shrink-0` | | Prevents CTA shrinking |
| Font preload configured | | Critical fonts |
| Font preconnect configured | | Google Fonts etc. |
| Dynamic `--header-height` used | | For mobile menu positioning |
| Height updated on resize | | `window.addEventListener('resize')` |
| Height updated on font load | | `document.fonts?.ready` |

---

## 4. Image System

### 4.1 Required Components

```bash
ls src/components/ui/Image.astro
cat src/utils/imageResolver.ts | head -20
```

| Check | Status | Notes |
|-------|--------|-------|
| `Image.astro` component exists | | In `src/components/ui/` |
| `imageResolver.ts` utility exists | | In `src/utils/` |
| Image uses `resolveImage()` function | | |
| Default placeholder configured | | `placeholders/default.svg` |

### 4.2 Image Component Props

```typescript
// Required clean Props interface
interface Props {
  src?: string;           // Path: ~/assets/images/...
  alt?: string;           // Descriptive alt text
  width?: number;         // Optional dimensions
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  asBackground?: boolean; // For background images
  overlay?: boolean;      // Adds overlay gradient
}
```

| Check | Status | Notes |
|-------|--------|-------|
| No `generatedKey` prop | | Legacy - remove |
| No `backgroundKey` prop | | Legacy - remove |
| No `fallbackQuery` prop | | Legacy - remove |
| No `context` prop | | Legacy - remove |
| No `query` prop | | Legacy - remove |

### 4.3 Image Path Format

All image paths must use the `~/assets/images/` prefix:

```typescript
// ✅ Correct paths
src="~/assets/images/photos/hero.jpg"
src="~/assets/images/icons/service-repair.svg"
src="~/assets/images/logos/logo.svg"

// ❌ Incorrect paths (legacy)
src="/images/unsplash/photo.jpg"     // External/legacy
src="../assets/images/photo.jpg"     // Relative
generatedKey="hero"                  // Legacy prop
```

### 4.4 No Unsplash References

```bash
# All should return ZERO results
grep -ri "unsplash" src/ --include="*.astro" --include="*.ts" --include="*.json" | grep -v ATTRIBUTION
grep -ri "images.unsplash.com" src/
grep -ri "UnsplashImage" src/
```

| Check | Status | Notes |
|-------|--------|-------|
| No `unsplash` in code (except ATTRIBUTION) | | |
| No Unsplash URLs | | |
| No UnsplashImage imports | | |

---

## 5. Content Collections

### 5.1 Collection Structure

```bash
ls src/content/
cat src/content/config.ts
```

| Collection | Schema | Clean |
|------------|--------|-------|
| staff/ | | |
| events/ | | |
| menu/ | | |
| gallery/ | | |
| products/ | | |
| ctas/ | | |

### 5.2 Schema Cleanliness

```bash
grep -A10 "image:" src/content/config.ts
```

| Check | Status | Notes |
|-------|--------|-------|
| No `generatedKey` in schemas | | |
| No `query` in image schemas | | |
| Image uses simple `src` string | | |
| No deprecated fields | | |

---

## 6. Page Architecture

### 6.1 Page Count

```bash
find src/pages -name "*.astro" | wc -l
ls src/pages/
```

| Check | Status | Notes |
|-------|--------|-------|
| Page count reasonable | | Count: ___ |
| No duplicate pages | | |
| Dynamic routes use [slug] pattern | | |
| 404 page exists | | |

### 6.2 Section Balance (Anti-Monolith)

| Page | Max Sections | Actual | OK |
|------|--------------|--------|-----|
| Home (index) | 10 | | |
| About | 8 | | |
| Contact | 6 | | |
| Menu/Services | 10 | | |

### 6.3 Page Patterns

| Check | Status | Notes |
|-------|--------|-------|
| Each page imports Layout | | |
| Each page has Header/Footer | | |
| Main content has `id="main-content"` | | |
| No business logic in pages | | |

---

## 7. Configuration Files

### 7.1 Site Configuration

```bash
cat src/data/site.ts | head -50
```

| Check | Status | Notes |
|-------|--------|-------|
| `src/data/site.ts` exists | | |
| Business info centralized | | |
| Navigation defined | | |
| Contact info in one place | | |

### 7.2 No Duplicate Config

```bash
# Should NOT exist (legacy)
ls src/config/site.ts 2>/dev/null
ls src/config/theme.ts 2>/dev/null
ls src/config/features.json 2>/dev/null
```

| Check | Status | Notes |
|-------|--------|-------|
| No `src/config/site.ts` | | Use `src/data/site.ts` |
| No `src/config/theme.ts` | | Use `themes.css` |
| No `src/config/features.json` | | |
| Single source of truth | | |

---

## 8. External Dependencies

### 8.1 No External Image URLs

```bash
grep -rE "images\.unsplash\.com|cloudinary\.com|imgix\.net" src/ --include="*.astro" --include="*.ts" --include="*.json"
grep -rE "https://.+\.(jpg|jpeg|png|webp)" src/ --include="*.astro" | grep -v ATTRIBUTION
```

| Check | Status | Notes |
|-------|--------|-------|
| No Unsplash URLs in code | | |
| No Cloudinary URLs | | |
| No external image CDNs | | |
| All images local | | |

### 8.2 Font Loading

```bash
grep -r "fonts.googleapis\|fonts.gstatic" src/
```

| Check | Status | Notes |
|-------|--------|-------|
| Fonts preloaded in Base.astro | | |
| Font preconnect configured | | |
| No blocking font loads | | |

---

## Summary

**Template:** _______________
**Auditor:** _______________
**Date:** _______________

| Section | Checks | Passed | Failed |
|---------|--------|--------|--------|
| 1. Directory Structure | 15 | | |
| 2. Dead Code | 12 | | |
| 3. Components (incl. Header Stability) | 19 | | |
| 4. Image System | 14 | | |
| 5. Content Collections | 6 | | |
| 6. Page Architecture | 8 | | |
| 7. Configuration | 5 | | |
| 8. External Dependencies | 6 | | |
| **TOTAL** | **85** | | |

### Result

- [ ] **PASS** - Proceed to Content Audit (v2_3)
- [ ] **FAIL** - Fix issues before proceeding

### Issues Found

**Blocking:**
1.
2.

**Non-blocking:**
1.
2.

---

## Cleanup Procedures

### Procedure A: Remove Legacy Image System

**Step 1: Delete legacy files**
```bash
# Remove legacy utilities
rm -f src/utils/unsplash.ts
rm -f src/utils/sections.ts

# Remove legacy components
rm -f src/components/ui/UnsplashImage.astro

# Remove manifest files
find src -name "manifest.*" -delete

# Remove image index files
find src -name "index.ts" -path "*/images/*" -delete

# Remove generated directory
rm -rf src/assets/images/generated/

# Remove public images
rm -rf public/images/
```

**Step 2: Create new structure**
```bash
mkdir -p src/assets/images/{icons,logos,photos,placeholders}
```

**Step 3: Create default placeholder**
```bash
cat > src/assets/images/placeholders/default.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect fill="#e5e7eb" width="400" height="300"/>
  <text x="200" y="150" text-anchor="middle" fill="#9ca3af" font-size="16">Image Placeholder</text>
</svg>
EOF
```

### Procedure B: Create Image Component

**Step 1: Create imageResolver.ts**
```typescript
// src/utils/imageResolver.ts
import type { ImageMetadata } from 'astro';

const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/images/**/*.{jpeg,jpg,png,webp,svg}',
  { eager: false }
);

const normalizeKey = (value: string): string | null => {
  if (value.startsWith('~/assets/images/')) {
    return value.replace('~/assets/images/', '../assets/images/');
  }
  return null;
};

export async function findImage(imagePath?: string | ImageMetadata | null) {
  if (!imagePath || typeof imagePath !== 'string') return imagePath;

  const key = normalizeKey(imagePath);
  if (!key) return imagePath;

  const loader = imageModules[key];
  if (typeof loader === 'function') {
    const mod = await loader();
    return mod?.default;
  }
  return null;
}

export async function resolveImage(
  candidate?: string,
  fallback = '~/assets/images/placeholders/default.svg'
) {
  const primary = await findImage(candidate);
  if (primary) {
    return typeof primary === 'string'
      ? { src: primary }
      : { src: primary.src, width: primary.width, height: primary.height };
  }

  const fb = await findImage(fallback);
  return fb ? { src: typeof fb === 'string' ? fb : fb.src } : { src: fallback };
}
```

**Step 2: Create Image.astro component**
```astro
---
// src/components/ui/Image.astro
import { resolveImage } from '../../utils/imageResolver';

interface Props {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  asBackground?: boolean;
  overlay?: boolean;
}

const { src, alt = 'Image', width = 1920, height = 1080, className = '', loading = 'lazy', asBackground = false, overlay = false } = Astro.props;

const resolved = await resolveImage(src);
---

{asBackground ? (
  <div class={`image-bg ${className}`} style={`background-image: url(${resolved.src});`} role="img" aria-label={alt}>
    {overlay && <div class="overlay"></div>}
    <slot />
  </div>
) : (
  <img src={resolved.src} alt={alt} width={resolved.width ?? width} height={resolved.height ?? height} loading={loading} class={className} />
)}
```

### Procedure C: Migrate Content Collection Images

**Step 1: Find all image references**
```bash
grep -rE "generatedKey|backgroundKey|query|/images/unsplash" src/content/ --include="*.json"
```

**Step 2: Update content files**

Before:
```json
{
  "image": {
    "generatedKey": "hero",
    "alt": "Hero image"
  }
}
```

After:
```json
{
  "image": {
    "src": "~/assets/images/photos/hero.jpg",
    "alt": "Hero image"
  }
}
```

**Step 3: Update content schema**
```typescript
// src/content/config.ts
const imageSchema = z.object({
  src: z.string(),           // ~/assets/images/...
  alt: z.string().optional(),
});
```

### Procedure D: Update Component Image Usage

**Step 1: Find components using old patterns**
```bash
grep -rE "UnsplashImage|generatedKey|backgroundKey" src/components/ --include="*.astro"
```

**Step 2: Replace with new Image component**

Before:
```astro
<UnsplashImage query="restaurant" alt="Restaurant" />
```

After:
```astro
import Image from '../ui/Image.astro';
<Image src="~/assets/images/photos/restaurant.jpg" alt="Restaurant" />
```

### Procedure E: Verify Migration Complete

Run these checks (all should return zero results):

```bash
# No legacy imports
grep -ri "UnsplashImage" src/ --include="*.astro"
grep -ri "from.*unsplash" src/ --include="*.astro" --include="*.ts"

# No legacy props
grep -ri "generatedKey\|backgroundKey\|fallbackQuery" src/

# No legacy paths
grep -ri "/images/unsplash\|images.unsplash.com" src/

# No legacy files
ls src/utils/unsplash.ts 2>/dev/null
ls src/components/ui/UnsplashImage.astro 2>/dev/null
ls public/images/ 2>/dev/null
find src -name "manifest.*"
```

### Procedure F: Fix Header Font Flash / Layout Shift

**Problem:** Font loading changes text width, causing header elements to reflow and buttons to wrap.

**Step 1: Add Font Preload in `Base.astro`**

```html
<head>
  <!-- Preconnect to font origins -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <!-- Preload critical heading font -->
  <link
    rel="preload"
    href="https://fonts.gstatic.com/s/alfaslabone/v19/6NUQ8FmMKwSEKjnm5-4v-4Jh6dVretWvYmE.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  />
</head>
```

**Step 2: Add `whitespace-nowrap` in `Header.astro`**

```astro
<!-- Business name - prevent wrap -->
<span class="text-xl font-heading font-bold text-text-primary hidden lg:block whitespace-nowrap">
  {business.name}
</span>

<!-- CTA button - prevent wrap -->
<a href={ctaHref} class="hidden lg:inline-flex items-center btn btn-primary whitespace-nowrap">
  {ctaLabel}
</a>

<!-- Nav links - prevent wrap -->
<a href={item.href} class="text-text-secondary hover:text-primary whitespace-nowrap">
  {item.label}
</a>
```

**Step 3: Add `flex-shrink-0` to containers**

```astro
<!-- Logo container -->
<a href="/" class="flex items-center space-x-2 group flex-shrink-0">

<!-- CTA container -->
<div class="flex items-center space-x-4 flex-shrink-0">
```

### Procedure G: Fix Mobile Menu Positioning

**Problem:** Hardcoded `top-[73px]` doesn't match actual header height.

**Step 1: Use CSS variable for mobile menu**

```astro
<!-- Mobile menu uses dynamic height -->
<div
  id="mobile-menu"
  class="hidden lg:hidden fixed left-0 right-0 bg-surface shadow-lg z-40"
  style="top: var(--header-height, 73px)"
>
```

**Step 2: Add height calculation script**

```html
<script>
  function updateHeaderHeight() {
    const header = document.querySelector('header');
    if (header) {
      const height = header.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
  }

  // Update on load
  updateHeaderHeight();

  // Update on resize
  window.addEventListener('resize', updateHeaderHeight);

  // Update when fonts finish loading
  document.fonts?.ready.then(updateHeaderHeight);
</script>
```

---

*Structure Audit v2.2 | Phase 1, Step 2*
