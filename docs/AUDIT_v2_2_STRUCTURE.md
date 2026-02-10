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
│       ├── brand/        # Logo and brand assets (logo.svg, logo-dark.svg)
│       ├── photos/       # JPG/PNG photos
│       │   ├── team/     # Team member photos
│       │   ├── gallery/  # Gallery images
│       │   └── ...       # hero, services, etc.
│       └── ATTRIBUTION.md
├── components/
│   ├── common/          # Reusable UI (Button, Container)
│   ├── layout/          # Header, Footer
│   ├── sections/        # Page sections
│   └── seo/             # Schema, meta components
├── content/             # Content collections
├── layouts/             # Page layouts
├── lib/                 # Utility functions (images.ts, utils.ts)
├── pages/               # Routes
├── styles/              # CSS (global.css)
├── content.config.ts    # Collection schemas (Astro 5.x)
└── site.config.ts       # Centralized site configuration
```

| Check | Status | Notes |
|-------|--------|-------|
| `src/assets/images/` structure correct | | |
| `src/components/` organized by type | | |
| `src/content/` has collections | | |
| `src/site.config.ts` exists | | Centralized site config |
| `src/styles/` has global.css | | |
| No orphan files in src/ root | | |

### 1.2 Image Directory

```bash
ls -la src/assets/images/
du -sh src/assets/images/
```

| Check | Status | Notes |
|-------|--------|-------|
| `brand/` directory exists | | logo.svg, logo-dark.svg |
| `photos/` directory exists | | Actual photos |
| `photos/team/` subdirectory exists | | Team member photos |
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
ls src/components/common/UnsplashImage.astro 2>/dev/null

# Find unused utilities
ls src/lib/
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
| `common/` | Reusable UI (Button, Container) | |
| `layout/` | Header, Footer | |
| `sections/` | Page sections (Hero, CTA, etc.) | |
| `seo/` | Schema, meta components | |

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
cat src/layouts/BaseLayout.astro | head -30
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
grep -r "preload.*font\|preconnect" src/layouts/BaseLayout.astro
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
| Header uses `position: fixed` with CSS variable height | | |
| Main content has `padding-top: var(--header-height)` | | |
| Dynamic `--header-height` used | | For mobile menu positioning |
| Height updated on resize | | `window.addEventListener('resize')` |
| Height updated on font load | | `document.fonts?.ready` |
| Scroll behavior doesn't cause layout shift | | |

---

## 4. Image System (Astro 5.x Native)

### 4.1 Required Pattern

Images use Astro's native `<Image />` component with static imports. No custom wrapper needed.

```astro
---
import { Image } from 'astro:assets';
import heroPhoto from '@assets/images/photos/hero.jpg';
---
<Image src={heroPhoto} alt="Hero banner" />
```

| Check | Status | Notes |
|-------|--------|-------|
| Uses `import { Image } from 'astro:assets'` | | Native Astro component |
| Images imported statically | | `import img from '@assets/...'` |
| No custom `Image.astro` wrapper | | Legacy - remove |
| No `imageResolver.ts` utility | | Legacy - remove |
| No legacy image components | | Use `astro:assets` |

### 4.2 No Legacy Image Props

```bash
# All should return ZERO results
grep -rE "generatedKey|backgroundKey|fallbackQuery" src/ --include="*.astro" --include="*.ts" --include="*.json"
grep -r "resolveImage\|findImage" src/ --include="*.astro" --include="*.ts"
```

| Check | Status | Notes |
|-------|--------|-------|
| No `generatedKey` prop | | Legacy - remove |
| No `backgroundKey` prop | | Legacy - remove |
| No `fallbackQuery` prop | | Legacy - remove |
| No `context` prop (image) | | Legacy - remove |
| No `query` prop (image) | | Legacy - remove |
| No `resolveImage()` calls | | Use static imports |

### 4.3 Image Path Format

All images must be in `src/assets/images/` and imported statically:

```astro
---
// ✅ Correct - static imports
import { Image } from 'astro:assets';
import hero from '@assets/images/photos/hero.jpg';
import logo from '@assets/images/brand/logo.svg';
---
<Image src={hero} alt="Hero" />

<!-- ❌ Incorrect (legacy patterns) -->
<!-- src="/images/unsplash/photo.jpg"  — External/legacy -->
<!-- src="~/assets/images/photo.jpg"   — Runtime string path -->
<!-- generatedKey="hero"               — Legacy prop -->
```

### 4.4 No Unsplash / External References

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
| No runtime image fetching | | |

---

## 5. Content Collections

### 5.1 Collection Structure

```bash
ls src/content/
cat src/content.config.ts
```

| Collection | Schema | Clean |
|------------|--------|-------|
| services/ | | |
| team/ | | |
| testimonials/ | | |
| blog/ | | |
| products/ | | |
| pricing/ | | |
| case-studies/ | | |

### 5.2 Schema Cleanliness

```bash
grep -A10 "image\|loader" src/content.config.ts
```

| Check | Status | Notes |
|-------|--------|-------|
| Config at `src/content.config.ts` | | Not `src/content/config.ts` |
| Uses `glob` loader (Astro 5.x) | | |
| Images validated with `image()` schema function | | |
| No `generatedKey` in schemas | | |
| No `query` in image schemas | | |
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
cat src/site.config.ts | head -50
```

| Check | Status | Notes |
|-------|--------|-------|
| `src/site.config.ts` exists | | |
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
| No `src/data/site.ts` | | Legacy — use `src/site.config.ts` |
| No `src/config/site.ts` | | Legacy — use `src/site.config.ts` |
| No `src/config/theme.ts` | | Use `global.css` |
| No `src/config/features.json` | | |
| No `src/content/config.ts` | | Legacy — use `src/content.config.ts` |
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
| Fonts preloaded in BaseLayout.astro | | |
| Font preconnect configured | | |
| No blocking font loads | | |

---

## Summary

**Template:** _______________
**Auditor:** _______________
**Date:** _______________

| Section | Checks | Passed | Failed |
|---------|--------|--------|--------|
| 1. Directory Structure | 19 | | |
| 2. Dead Code | 14 | | |
| 3. Components (incl. Header Stability) | 27 | | |
| 4. Image System | 15 | | |
| 5. Content Collections | 12 | | |
| 6. Page Architecture | 12 | | |
| 7. Configuration | 10 | | |
| 8. External Dependencies | 7 | | |
| **TOTAL** | **116** | | |

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

> **All remediation procedures have been extracted to [`REMEDIATION_PLAYBOOK.md`](./REMEDIATION_PLAYBOOK.md).**
> Procedures A-G cover: legacy image removal, Astro 5.x image setup, content collection migration, component updates, migration verification, header font flash fixes, and mobile menu positioning.

---

*Structure & Architecture Audit v2.2 | Phase 1, Step 2*
