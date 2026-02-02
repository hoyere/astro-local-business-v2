# Theme Preparation Audit v2.4

> Ensure template is ready for theming - no hardcoded colors
> **Phase 1, Step 4** - Makes template theme-agnostic

---

## Pre-Audit

- [ ] Content Audit (v2_3) passed
- [ ] Dev server running
- [ ] Understanding of CSS variable system

---

## 1. CSS Variable Architecture

### 1.1 Theme File Structure

```bash
ls src/styles/themes.css
grep -c "data-theme=" src/styles/themes.css
```

| Check | Status | Notes |
|-------|--------|-------|
| `themes.css` exists | | |
| Multiple themes defined | | Count: ___ |
| Light/dark mode pairs | | |
| Imported in global.css | | |

### 1.2 Variable Naming Convention

**Required pattern:** `--color-{name}`

```bash
# Check variable names
grep -E "^  --color-" src/styles/themes.css | head -20
grep -E "^  --[a-z]+-" src/styles/themes.css | grep -v "color-" | head -10
```

| Check | Status | Notes |
|-------|--------|-------|
| Variables use `--color-` prefix | | |
| No unprefixed color variables | | |
| Footer tokens use `--color-footer-` | | |

### 1.3 Required Variables

Each theme must define:

| Variable | Defined | Purpose |
|----------|---------|---------|
| `--color-primary` | | Main brand color |
| `--color-primary-dark` | | Darker variant |
| `--color-primary-light` | | Lighter variant |
| `--color-accent` | | Secondary/accent color |
| `--color-background` | | Page background |
| `--color-surface` | | Card backgrounds |
| `--color-surface-alt` | | Alternate surface |
| `--color-text-primary` | | Main text color |
| `--color-text-secondary` | | Secondary text |
| `--color-text-muted` | | Muted text |
| `--color-border` | | Border color |
| `--color-on-primary` | | Text on primary bg |
| `--color-on-accent` | | Text on accent bg |

### 1.4 Footer Tokens

```bash
grep "color-footer" src/styles/themes.css
```

| Variable | Defined |
|----------|---------|
| `--color-footer-accent` | |
| `--color-footer-text` | |
| `--color-footer-surface` | |
| `--color-footer-border` | |

---

## 2. Tailwind Configuration

### 2.1 CSS Variable Helper

```bash
cat tailwind.config.mjs | grep -A5 "cssVar"
```

| Check | Status | Notes |
|-------|--------|-------|
| `cssVar()` helper defined | | |
| Uses `--color-` prefix | | |
| Supports opacity | | |

**Required pattern:**
```javascript
const cssVar = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;
```

### 2.2 Color Configuration

```bash
cat tailwind.config.mjs | grep -A30 "colors:"
```

| Check | Status | Notes |
|-------|--------|-------|
| All colors use `cssVar()` | | |
| No hardcoded hex values | | |
| Footer colors defined | | |

---

## 3. No Hardcoded Colors

### 3.1 Hardcoded Tailwind Classes (MUST BE ZERO)

```bash
# These should return ZERO results
grep -rE "neutral-[0-9]" src/components/ src/pages/ --include="*.astro"
grep -rE "gray-[0-9]" src/components/ src/pages/ --include="*.astro"
grep -rE "slate-[0-9]" src/components/ src/pages/ --include="*.astro"
grep -rE "stone-[0-9]" src/components/ src/pages/ --include="*.astro"
grep -rE "zinc-[0-9]" src/components/ src/pages/ --include="*.astro"
```

| Pattern | Count | Status |
|---------|-------|--------|
| `neutral-*` | | Should be 0 |
| `gray-*` | | Should be 0 |
| `slate-*` | | Should be 0 |
| `stone-*` | | Should be 0 |
| `zinc-*` | | Should be 0 |

### 3.2 Hardcoded Hex Colors

```bash
# Check for hex colors in components (excluding SVGs)
grep -rE "#[0-9A-Fa-f]{6}" src/components/ --include="*.astro" | grep -v "var(--"
grep -rE "#[0-9A-Fa-f]{3}[^0-9A-Fa-f]" src/components/ --include="*.astro"
```

| Check | Status | Notes |
|-------|--------|-------|
| No hex colors in components | | |
| No hex colors in pages | | |
| SVGs may have hex (OK) | | |

### 3.3 Hardcoded RGBA

```bash
grep -rE "rgba?\([0-9]" src/components/ --include="*.astro" | grep -v "var(--"
```

| Check | Status | Notes |
|-------|--------|-------|
| No hardcoded rgba() | | |
| Uses CSS variables instead | | |

### 3.4 Old Variable Patterns (MUST BE ZERO)

```bash
grep -rE "--tw-color-" src/ --include="*.astro" --include="*.css"
```

| Check | Status | Notes |
|-------|--------|-------|
| No `--tw-color-*` usage | | Use `--color-*` |

---

## 4. Component Color Usage

### 4.1 Correct Patterns

**Tailwind classes:**
```html
class="bg-primary text-white"
class="bg-surface text-text-primary"
class="border-border"
class="text-text-muted"
```

**CSS custom properties:**
```css
background: rgb(var(--color-primary));
color: rgb(var(--color-text-primary));
border-color: rgb(var(--color-border));
```

### 4.2 Component Audit

Check each major component uses theme tokens:

| Component | Uses Tokens | Issues |
|-----------|-------------|--------|
| Header.astro | | |
| Footer.astro | | |
| HeroBanner.astro | | |
| PageHero.astro | | |
| CtaRibbon.astro | | |
| Card components | | |

---

## 5. Heading Text Colors

### 5.1 Global Heading Rule

```bash
grep -A2 "h1, h2, h3" src/styles/global.css
```

**Known issue:** Global CSS sets headings to `text-text-primary` which overrides inherited `text-white`.

### 5.2 Dark Section Headings

All headings in dark/gradient sections MUST have explicit `text-white`:

```bash
# Find headings that might be missing text-white
grep -B5 "<h[1-3]" src/pages/*.astro | grep -A1 "from-primary\|bg-primary\|overlay" | grep "<h" | grep -v "text-white"
```

| Check | Status | Notes |
|-------|--------|-------|
| CTA section headings have text-white | | |
| Hero section headings have text-white | | |
| Gradient section headings have text-white | | |

### 5.3 Files Requiring text-white

| File | Sections | Fixed |
|------|----------|-------|
| menu.astro | CTA | |
| shop.astro | CTA | |
| about.astro | CTA | |
| contact.astro | CTA | |
| services.astro | CTA | |
| faq.astro | CTA | |
| gallery.astro | CTA | |
| terms.astro | Hero | |
| privacy.astro | Hero | |

---

## 6. Shadow & Overlay Variables

### 6.1 Shadow Variables

```bash
grep "shadow-" src/styles/themes.css | head -10
```

| Variable | Defined |
|----------|---------|
| `--shadow-color` | |
| `--shadow-opacity-sm` | |
| `--shadow-opacity-md` | |
| `--shadow-opacity-lg` | |

### 6.2 Overlay Variables

```bash
grep "overlay-" src/styles/themes.css | head -10
```

| Variable | Defined |
|----------|---------|
| `--overlay-light` | |
| `--overlay-medium` | |
| `--overlay-heavy` | |

### 6.3 Overlay Utility Classes

```bash
grep -E "\.overlay-(light|medium|heavy)" src/styles/*.css
```

| Check | Status | Notes |
|-------|--------|-------|
| `.overlay-light` class exists | | |
| `.overlay-medium` class exists | | |
| `.overlay-heavy` class exists | | |
| Components use utility classes | | |

---

## 7. Header Stability

> **Note:** Header stability is a structural concern. See `AUDIT_v2_2_STRUCTURE.md` Section 3.4 for detailed checks and Procedures F & G for fixes.

Quick verification:

```bash
# Verify header stability patterns exist
grep -rE "whitespace-nowrap|flex-shrink-0" src/components/layout/Header.astro | wc -l
# Should be 4+ matches
```

| Check | Status | Notes |
|-------|--------|-------|
| Header passed v2_2 Section 3.4 | | See Structure Audit |

---

## 8. Dark Mode

### 8.1 Dark Mode Selector

```bash
grep "data-theme.*dark\|\.dark" src/styles/themes.css | head -5
```

| Check | Status | Notes |
|-------|--------|-------|
| Dark theme defined | | |
| `.dark` class supported | | |
| System preference detected | | |

### 8.2 Dark Mode Variables

| Variable | Light Value | Dark Value |
|----------|-------------|------------|
| `--color-background` | | Inverted |
| `--color-surface` | | Inverted |
| `--color-text-primary` | | Inverted |
| `--shadow-opacity-*` | | Higher |

---

## Summary

**Template:** _______________
**Auditor:** _______________
**Date:** _______________

| Section | Checks | Passed | Failed |
|---------|--------|--------|--------|
| 1. CSS Variable Architecture | 18 | | |
| 2. Tailwind Configuration | 5 | | |
| 3. No Hardcoded Colors | 8 | | |
| 4. Component Color Usage | 6 | | |
| 5. Heading Text Colors | 12 | | |
| 6. Shadow & Overlay | 10 | | |
| 7. Header Stability | 1 | | See v2_2 Section 3.4 |
| 8. Dark Mode | 5 | | |
| **TOTAL** | **65** | | |

### Result

- [ ] **PASS** - Base template is theme-ready. Proceed to Theme Application (v2_5)
- [ ] **FAIL** - Fix hardcoded colors before proceeding

### Issues Found

**Blocking (hardcoded colors):**
1.
2.

**Non-blocking:**
1.
2.

---

## Tactical Greps & Discovery Commands

### Finding Hardcoded Colors

```bash
# Find hardcoded Tailwind neutral/gray classes (MUST be zero)
grep -rE "neutral-[0-9]|gray-[0-9]|slate-[0-9]|stone-[0-9]|zinc-[0-9]" src/components/ src/pages/ --include="*.astro"

# Find hardcoded hex colors in components
grep -rE "#[0-9A-Fa-f]{6}" src/components/ --include="*.astro" | grep -v "var(--"

# Find hardcoded RGB/RGBA values
grep -rE "rgba?\\([0-9]" src/components/ --include="*.astro" | grep -v "var(--"

# Find old variable patterns (should be zero)
grep -rE "tw-color-" src/ --include="*.astro" --include="*.css"
```

### Finding Dark Section Heading Issues

The global CSS rule `h1-h6 { @apply text-text-primary; }` overrides inherited `text-white` on dark backgrounds.

```bash
# Find headings in dark/gradient sections that might be missing text-white
grep -B5 "<h[1-3]" src/pages/*.astro | grep -A1 "from-primary\|bg-primary\|overlay" | grep "<h" | grep -v "text-white"

# Find all gradient sections
grep -rE "from-primary|bg-primary-dark|bg-gradient" src/pages/*.astro

# Count text-white usage (should be high in CTA sections)
grep -c "text-white" src/pages/*.astro
```

### Finding Header/Layout Stability Issues

```bash
# Check for whitespace-nowrap on text elements that shouldn't wrap
grep -rE "whitespace-nowrap" src/components/layout/Header.astro

# Check for flex-shrink-0 on elements that shouldn't shrink
grep -rE "flex-shrink-0" src/components/layout/Header.astro

# Check for dynamic header height
grep -rE "header-height" src/components/layout/Header.astro
```

### Finding Unsplash/External Dependencies

```bash
# Find any Unsplash references (should be zero except ATTRIBUTION)
grep -ri "unsplash" src/ --include="*.astro" --include="*.ts" --include="*.json" | grep -v ATTRIBUTION

# Find external image URLs
grep -rE "images\\.unsplash\\.com|cloudinary\\.com|imgix\\.net" src/

# Find legacy image props
grep -rE "generatedKey|backgroundKey|fallbackQuery" src/
```

### Finding Footer Token Issues

```bash
# Check footer uses correct variable names
grep -rE "footer-accent|footer-text|footer-surface" src/components/layout/Footer.astro

# Find footer gradient patterns
grep -rE "from-.*to-" src/components/layout/Footer.astro
```

---

## Most Impactful Fixes (From Real Cleanup)

### Fix 1: Global Heading Override

**Problem:** Global CSS sets all headings to `text-text-primary`, overriding inherited `text-white` on dark sections.

**Location:** `src/styles/global.css`
```css
h1, h2, h3, h4, h5, h6 {
  @apply font-heading leading-tight font-bold text-text-primary;  /* This overrides inherited colors! */
}
```

**Solution:** Add explicit `text-white` to ALL headings in dark/gradient sections:
```astro
<!-- Every h1-h6 in a dark section needs explicit text-white -->
<section class="bg-gradient-to-br from-primary to-primary-dark text-white">
  <h2 class="text-3xl font-heading font-bold text-white mb-4">Title</h2>
  <p>This inherits text-white from parent (paragraphs work fine)</p>
</section>
```

**Files typically requiring this fix:**
- `menu.astro` - CTA sections
- `shop.astro` - CTA sections
- `about.astro` - CTA sections
- `contact.astro` - CTA sections
- `services.astro` - CTA sections
- `faq.astro` - CTA sections
- `gallery.astro` - CTA sections
- `terms.astro` - Hero sections
- `privacy.astro` - Hero sections

### Fix 2 & 3: Header Stability

> **Moved to Structure Audit** - See `AUDIT_v2_2_STRUCTURE.md`:
> - Section 3.4: Header Stability Checks
> - Procedure F: Fix Header Font Flash / Layout Shift
> - Procedure G: Fix Mobile Menu Positioning

### Fix 4: CSS Variable Naming Mismatch

**Problem:** Tailwind's `cssVar()` helper adds `--color-` prefix automatically.

**Wrong:**
```css
/* themes.css */
--tw-primary: 2 162 106;  /* Wrong prefix */
--footer-accent: 58 214 158;  /* Missing color- prefix */
```

**Correct:**
```css
/* themes.css - ALL variables need --color- prefix */
--color-primary: 2 162 106;
--color-footer-accent: 58 214 158;

/* Usage in CSS */
background: rgb(var(--color-primary));
color: rgb(var(--color-footer-accent));
```

### Fix 5: Footer Token Separation

**Problem:** Footer needs distinct tokens for dark background that work in both light and dark mode.

**Solution:** Define footer-specific tokens:
```css
:root,
:root[data-theme="ga-light"],
:root[data-theme="ga-dark"] {
  /* Footer is always dark, so these don't change between modes */
  --color-footer-accent: 58 214 158;      /* Lighter for dark bg */
  --color-footer-text: 245 251 248;
  --color-footer-text-secondary: 200 220 212;
  --color-footer-text-muted: 150 175 165;
  --color-footer-border: 45 65 55;
  --color-footer-surface: 25 42 36;
}
```

---

## Quick Fixes

### Replace Hardcoded Neutral Classes

| Before | After |
|--------|-------|
| `bg-neutral-900` | `bg-surface` |
| `bg-neutral-800` | `bg-surface` |
| `bg-neutral-200` | `bg-surface-alt` |
| `bg-neutral-100` | `bg-surface-alt` |
| `bg-neutral-50` | `bg-background` |
| `text-neutral-900` | `text-text-primary` |
| `text-neutral-700` | `text-text-secondary` |
| `text-neutral-500` | `text-text-muted` |
| `border-neutral-200` | `border-border` |

### Add text-white to Dark Section Headings

```astro
<!-- Before -->
<section class="bg-gradient-to-br from-primary to-primary-dark text-white">
  <h2 class="font-heading font-bold">{title}</h2>
</section>

<!-- After -->
<section class="bg-gradient-to-br from-primary to-primary-dark text-white">
  <h2 class="font-heading font-bold text-white">{title}</h2>
</section>
```

---

*Theme Prep Audit v2.4 | Phase 1, Step 4*
