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
ls src/styles/global.css
grep -c "@theme" src/styles/global.css
grep -c "data-theme" src/styles/global.css
```

| Check | Status | Notes |
|-------|--------|-------|
| `global.css` exists with `@theme` block | | |
| Colors use `oklch()` format | | Not space-separated RGB |
| Light/dark mode pairs defined | | |
| `@import "tailwindcss"` present | | |

### 1.2 Variable Naming Convention

**Required pattern:** `--color-{name}` with `oklch()` values

```bash
# Check variable names in @theme block
grep -E "^\s+--color-" src/styles/global.css | head -20
grep -E "^\s+--[a-z]+-" src/styles/global.css | grep -v "color-" | head -10
```

| Check | Status | Notes |
|-------|--------|-------|
| Variables use `--color-` prefix | | |
| Values use `oklch()` format | | Not space-separated RGB |
| No unprefixed color variables | | |
| Footer tokens use `--color-footer-` | | |

### 1.3 Required Variables

Each theme must define:

| Variable | Defined | Purpose |
|----------|---------|---------|
| `--color-primary` | | Main brand color |
| `--color-primary-dark` | | Darker variant |
| `--color-primary-light` | | Lighter variant |
| `--color-accent` | | Accent color |
| `--color-accent-dark` | | Accent darker variant |
| `--color-accent-light` | | Accent lighter variant |
| `--color-secondary` | | *(Optional)* For 3-color themes |
| `--color-secondary-dark` | | *(Optional)* Secondary darker |
| `--color-secondary-light` | | *(Optional)* Secondary lighter |
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

## 2. Tailwind v4 Integration

### 2.1 CSS-Native Theme Definition

With Tailwind v4, colors are defined directly in CSS using `@theme` blocks. No `tailwind.config.mjs` or `cssVar()` helper needed.

```bash
# Verify no legacy tailwind config
ls tailwind.config.mjs 2>/dev/null  # Should NOT exist
grep "@theme" src/styles/global.css  # Should exist
```

| Check | Status | Notes |
|-------|--------|-------|
| No `tailwind.config.mjs` file | | Not needed with Tailwind v4 |
| No `cssVar()` helper function | | Colors defined in CSS `@theme` |
| Colors defined in `@theme` block | | Using `oklch()` values |
| No hardcoded hex values in config | | |
| Footer colors defined in `@theme` | | |

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
background: var(--color-primary);
color: var(--color-text-primary);
border-color: var(--color-border);
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

## 7. Dark Mode

### 7.1 Dark Mode Selector

```bash
grep "data-theme.*dark\|\[data-theme" src/styles/global.css | head -5
```

| Check | Status | Notes |
|-------|--------|-------|
| Dark theme defined | | |
| Uses `[data-theme="dark"]` selector | | Not `.dark` class |
| System preference detected | | |

### 7.2 Dark Mode Variables

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
| 1. CSS Variable Architecture | 30 | | |
| 2. Tailwind v4 Integration | 5 | | |
| 3. No Hardcoded Colors | 11 | | |
| 4. Component Color Usage | 6 | | |
| 5. Heading Text Colors | 12 | | |
| 6. Shadow & Overlay | 11 | | |
| 7. Dark Mode | 7 | | |
| **TOTAL** | **82** | | |

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

### Fix 1: CSS Variable Naming Mismatch

**Problem:** Variables must use the `--color-` prefix consistently.

**Wrong:**
```css
--tw-primary: oklch(0.55 0.2 165);      /* Wrong prefix */
--footer-accent: oklch(0.7 0.2 165);    /* Missing color- prefix */
```

**Correct:**
```css
@theme {
  --color-primary: oklch(0.55 0.2 165);
  --color-footer-accent: oklch(0.7 0.2 165);
}
```

### Fix 2: Footer Token Separation

**Problem:** Footer needs distinct tokens for dark background that work in both light and dark mode.

**Solution:** Define footer-specific tokens in the `@theme` block (footer is always dark, so these don't change between modes):
```css
@theme {
  --color-footer-accent: oklch(0.7 0.2 165);
  --color-footer-text: oklch(0.97 0.005 165);
  --color-footer-text-secondary: oklch(0.85 0.02 165);
  --color-footer-text-muted: oklch(0.7 0.02 165);
  --color-footer-border: oklch(0.3 0.03 165);
  --color-footer-surface: oklch(0.2 0.03 165);
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

*Theme Prep Audit v2.2 | Phase 1, Step 4*
