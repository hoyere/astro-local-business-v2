# Theme Application Guide v2.5

> Apply a specific theme from a Standards document
> **Phase 2** - Creates themed branch from clean base

---

## Pre-Application

- [ ] All Phase 1 audits passed (v2_1 through v2_4)
- [ ] Base template is theme-agnostic
- [ ] Standards document selected (e.g., `GA_TEMPLATE_STANDARDS.md`)
- [ ] On clean branch (main or base)

---

## 1. Create Theme Branch

```bash
# Ensure you're on clean base
git checkout main
git pull

# Create theme branch
git checkout -b theme/ga-core  # or theme/autumn, etc.
```

---

## 2. Update global.css

### 2.1 Copy Color Values from Standards Doc

Open your chosen `*_TEMPLATE_STANDARDS.md` and copy the color values into `src/styles/global.css`.

**Example from GA_TEMPLATE_STANDARDS.md:**

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  /* Primary Colors - from Standards doc */
  --color-primary: oklch(0.55 0.2 165);          /* #02a26a */
  --color-primary-dark: oklch(0.45 0.15 165);    /* #0c7e5a */
  --color-primary-light: oklch(0.7 0.2 165);     /* #3ad69e */

  /* Accent Colors - from Standards doc */
  --color-accent: oklch(0.88 0.15 85);           /* #ffdd6a */
  --color-accent-dark: oklch(0.8 0.14 85);
  --color-accent-light: oklch(0.93 0.1 85);

  /* Surfaces */
  --color-background: oklch(1 0 0);
  --color-surface: oklch(1 0 0);
  --color-surface-alt: oklch(0.97 0.01 165);

  /* Text */
  --color-text: oklch(0.15 0.03 165);
  --color-text-secondary: oklch(0.35 0.03 165);
  --color-text-muted: oklch(0.5 0.02 165);
  --color-text-inverse: oklch(0.98 0 0);

  /* Borders */
  --color-border: oklch(0.9 0.02 165);

  /* On-color text */
  --color-on-primary: oklch(1 0 0);
  --color-on-accent: oklch(0.15 0.03 165);
}
```

### 2.2 Update Dark Mode

```css
/* Dark mode */
[data-theme="dark"] {
  --color-primary: oklch(0.7 0.2 165);
  --color-primary-dark: oklch(0.55 0.18 165);
  --color-primary-light: oklch(0.8 0.18 165);

  --color-accent: oklch(0.82 0.13 85);

  --color-background: oklch(0.15 0.02 165);
  --color-surface: oklch(0.2 0.03 165);
  --color-surface-alt: oklch(0.25 0.03 165);

  --color-text: oklch(0.97 0.005 165);
  --color-text-secondary: oklch(0.85 0.02 165);
  --color-text-muted: oklch(0.7 0.02 165);
  --color-text-inverse: oklch(0.15 0.02 165);

  --color-border: oklch(0.3 0.03 165);

  --color-on-primary: oklch(0.15 0.02 165);
  --color-on-accent: oklch(0.15 0.02 165);
}
```

### 2.3 Update Footer Tokens

Footer tokens are defined inside the `@theme` block (always dark, shared across light/dark modes):

```css
@theme {
  /* Footer (always dark) */
  --color-footer-bg: oklch(0.18 0.03 160);
  --color-footer-text: oklch(0.97 0.01 160);
  --color-footer-text-secondary: oklch(0.80 0.02 160);
  --color-footer-text-muted: oklch(0.70 0.03 160);
  --color-footer-border: oklch(0.28 0.03 160);
  --color-footer-accent: oklch(0.75 0.17 160);
  --color-footer-surface: oklch(0.22 0.03 160);
}
```

---

## 3. Update SVG Placeholders (Optional)

If using branded placeholder SVGs, update gradients to match theme:

```bash
ls src/assets/images/icons/*.svg
```

**Update gradient stops:**
```xml
<!-- Before (generic) -->
<stop offset="0%" stop-color="#0f172a"/>
<stop offset="100%" stop-color="#2f6f4e"/>

<!-- After (GA theme) -->
<stop offset="0%" stop-color="#02a26a"/>
<stop offset="100%" stop-color="#ffdd6a"/>
```

---

## 4. Update Logo Files

### 4.1 Replace Logo SVGs

Place theme-specific logos in `src/assets/images/brand/`:

| File | Purpose |
|------|---------|
| `logo.svg` | Logo for light backgrounds |
| `logo-light.svg` | Logo for dark backgrounds |

### 4.2 Update Favicon

Replace `public/favicon.svg` and `public/favicon.ico` with themed versions.

### 4.3 Update OG Image

Replace `public/og-image.jpg` with themed social share image.

---

## 5. Update Site Configuration

### 5.1 Business Name (if theme-specific)

Edit `src/site.config.ts`:

```typescript
export const siteConfig = {
  business: {
    name: "GrowthAutomations Brewing Co.",  // Theme-specific name
    tagline: "Systematic Craft Brewing Since 2019",
    // ...
  }
}
```

### 5.2 Default Theme

Edit `src/layouts/BaseLayout.astro`:

```html
<html lang="en">
```

---

## 6. Verification Checklist

### 6.1 Visual Check

Run dev server and verify:

```bash
npm run dev
```

| Page | Light Mode | Dark Mode |
|------|------------|-----------|
| Home | | |
| About | | |
| Contact | | |
| Menu | | |
| All CTA sections | | |
| Footer | | |

### 6.2 Color Verification

| Element | Expected Color | Actual |
|---------|----------------|--------|
| Primary buttons | Theme primary | |
| Accent badges | Theme accent | |
| Body text | Theme text | |
| Muted text | Theme text-muted | |
| Card backgrounds | Theme surface | |
| Page background | Theme background | |
| Footer background | Theme footer-surface | |

### 6.3 Contrast Check

| Combination | WCAG AA (4.5:1) |
|-------------|-----------------|
| Text on background | |
| Text on surface | |
| Text on primary button | |
| Text on accent | |
| Footer text | |

---

## 7. Build & Commit

### 7.1 Verify Build

```bash
npm run build
```

| Check | Status |
|-------|--------|
| Build succeeds | |
| No color-related errors | |
| All pages generated | |

### 7.2 Commit Theme

```bash
git add .
git commit -m "Apply [THEME_NAME] theme

- Updated global.css with [THEME_NAME] colors
- Updated logo and favicon
- References [THEME_NAME]_TEMPLATE_STANDARDS.md"
```

---

## 8. Document Theme

### 8.1 Update README

Add theme information to README:

```markdown
## Theme

This template uses the **[THEME_NAME]** color scheme.

See `[THEME_NAME]_TEMPLATE_STANDARDS.md` for color reference.

### Customizing Colors

Edit `src/styles/global.css` to modify colors.
```

### 8.2 Tag Release (Optional)

```bash
git tag -a v1.0-ga-core -m "GA Core theme release"
git push origin v1.0-ga-core
```

---

## Theme Application Summary

**Theme Applied:** _______________
**Standards Doc:** _______________
**Branch:** _______________
**Date:** _______________

### Files Modified

| File | Change |
|------|--------|
| `src/styles/global.css` | Color values |
| `src/assets/images/brand/` | Logo files |
| `public/favicon.*` | Favicon |
| `public/og-image.jpg` | Social image |
| `src/site.config.ts` | Business name (if applicable) |
| `src/layouts/BaseLayout.astro` | Default theme |

### Verification

- [ ] All colors match Standards doc
- [ ] Light mode looks correct
- [ ] Dark mode looks correct
- [ ] Footer colors correct
- [ ] Contrast meets WCAG AA
- [ ] Build succeeds
- [ ] Committed to theme branch

---

## Creating a New Theme

To create a new theme:

1. **Create Standards Doc**
   ```bash
   cp GA_TEMPLATE_STANDARDS.md NEW_TEMPLATE_STANDARDS.md
   ```

2. **Define Colors**
   Edit the new Standards doc with your color palette.

3. **Apply Theme**
   Follow this guide (v2_5) using your new Standards doc.

4. **Create Branch**
   ```bash
   git checkout -b theme/new-theme-name
   ```

---

## 9. OKLCH Conversion Reference

### Format
```
oklch(L C H)
  L = Lightness (0-1, where 0=black, 1=white)
  C = Chroma (0-0.4, color intensity)
  H = Hue (0-360, color wheel angle)
```

**Converter:** https://oklch.com/

### Common Conversions

| Hex | OKLCH | Notes |
|-----|-------|-------|
| `#02a26a` (emerald) | `oklch(0.58 0.15 160)` | GA Primary |
| `#ffdd6a` (gold) | `oklch(0.90 0.13 90)` | GA Accent |
| `#0f1c18` (green-black) | `oklch(0.15 0.02 160)` | GA Text |
| `#1e40af` (blue) | `oklch(0.45 0.2 260)` | |
| `#dc2626` (red) | `oklch(0.55 0.22 25)` | |

**Tip:** Keep the same chroma (C) and hue (H), adjust lightness (L):
- Light variant: L + 0.10
- Dark variant: L - 0.10

### Industry Color Quick Reference

| Brand Type | Primary Hue | Example |
|------------|-------------|---------|
| Law/Finance | Blue (250-270) | `oklch(0.45 0.2 260)` |
| Health/Nature | Green (140-160) | `oklch(0.55 0.18 150)` |
| Food/Restaurant | Red/Orange (20-40) | `oklch(0.55 0.2 30)` |
| Tech/Modern | Purple (280-300) | `oklch(0.5 0.2 290)` |
| Construction | Orange (50-70) | `oklch(0.6 0.18 60)` |

---

## 10. Troubleshooting

| Problem | Fix |
|---------|-----|
| Colors look wrong | Check OKLCH conversion at oklch.com; verify no hardcoded colors remain; check dark mode overrides |
| Footer text hard to read | Increase `--color-footer-text` lightness; decrease `--color-footer-bg` lightness; verify 4.5:1 contrast |
| Dark mode flashes white | Ensure theme script is in `<head>` before CSS; check `is:inline` on theme script |
| Fonts not loading | Verify Google Fonts URL; check `font-display: swap`; check network tab for 404s |

---

## Quick Reference: Color Token Mapping

| Token | Usage |
|-------|-------|
| `--color-primary` | Main brand color, buttons |
| `--color-primary-dark` | Hover states |
| `--color-primary-light` | Highlights, accents |
| `--color-accent` | Secondary color, CTAs |
| `--color-background` | Page background |
| `--color-surface` | Cards, elevated elements |
| `--color-surface-alt` | Alternate surfaces |
| `--color-text` | Main text |
| `--color-text-secondary` | Secondary text |
| `--color-text-muted` | Muted/placeholder text |
| `--color-border` | Borders, dividers |
| `--color-on-primary` | Text on primary background |
| `--color-on-accent` | Text on accent background |
| `--color-footer-*` | Footer-specific colors |

---

*Theme Application Guide v2.2 | Phase 2*
