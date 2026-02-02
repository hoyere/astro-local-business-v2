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

## 2. Update themes.css

### 2.1 Copy Color Values from Standards Doc

Open your chosen `*_TEMPLATE_STANDARDS.md` and copy the color values into `src/styles/themes.css`.

**Example from GA_TEMPLATE_STANDARDS.md:**

```css
/* GA Core - Light (Default) */
:root,
:root[data-theme="ga-light"] {
  /* Primary Colors - from Standards doc */
  --color-primary: 2 162 106;          /* #02a26a */
  --color-primary-dark: 12 126 90;     /* #0c7e5a */
  --color-primary-light: 58 214 158;   /* #3ad69e */

  /* Accent Colors - from Standards doc */
  --color-accent: 255 221 106;         /* #ffdd6a */
  --color-accent-dark: 230 190 70;
  --color-accent-light: 255 235 160;

  /* Surfaces */
  --color-background: 255 255 255;
  --color-surface: 255 255 255;
  --color-surface-alt: 245 251 248;

  /* Text */
  --color-text-primary: 15 28 24;
  --color-text-secondary: 55 75 68;
  --color-text-muted: 100 120 110;

  /* Borders */
  --color-border: 220 235 228;

  /* On-color text */
  --color-on-primary: 255 255 255;
  --color-on-accent: 15 28 24;
}
```

### 2.2 Update Dark Mode

```css
/* GA Core - Dark */
:root[data-theme="ga-dark"],
:root.dark[data-theme="ga-light"],
:root.dark:not([data-theme]) {
  --color-primary: 58 214 158;
  --color-primary-dark: 31 168 116;
  --color-primary-light: 100 230 180;

  --color-accent: 248 209 95;

  --color-background: 16 28 25;
  --color-surface: 25 42 36;
  --color-surface-alt: 35 55 48;

  --color-text-primary: 245 251 248;
  --color-text-secondary: 200 220 212;
  --color-text-muted: 150 175 165;

  --color-border: 45 65 55;

  --color-on-primary: 16 28 25;
  --color-on-accent: 16 28 25;
}
```

### 2.3 Update Footer Tokens

```css
:root,
:root[data-theme="ga-light"],
:root[data-theme="ga-dark"] {
  --color-footer-accent: 58 214 158;
  --color-footer-accent-dark: 2 162 106;
  --color-footer-text: 245 251 248;
  --color-footer-text-secondary: 200 220 212;
  --color-footer-text-muted: 150 175 165;
  --color-footer-border: 45 65 55;
  --color-footer-surface: 25 42 36;
}
```

---

## 3. Update SVG Placeholders (Optional)

If using branded placeholder SVGs, update gradients to match theme:

```bash
ls src/assets/images/icons/*.svg
ls src/assets/images/library/*.svg
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

Place theme-specific logos in `src/assets/images/logos/`:

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

Edit `src/data/site.ts`:

```typescript
export default {
  business: {
    name: "GrowthAutomations Brewing Co.",  // Theme-specific name
    tagline: "Systematic Craft Brewing Since 2019",
    // ...
  }
}
```

### 5.2 Default Theme

Edit `src/layouts/Base.astro`:

```html
<html lang="en" data-theme="ga-light">
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
| Body text | Theme text-primary | |
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

- Updated themes.css with [THEME_NAME] colors
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

Edit `src/styles/themes.css` to modify colors.
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
| `src/styles/themes.css` | Color values |
| `src/assets/images/logos/` | Logo files |
| `public/favicon.*` | Favicon |
| `public/og-image.jpg` | Social image |
| `src/data/site.ts` | Business name (if applicable) |
| `src/layouts/Base.astro` | Default theme |

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
| `--color-text-primary` | Main text |
| `--color-text-secondary` | Secondary text |
| `--color-text-muted` | Muted/placeholder text |
| `--color-border` | Borders, dividers |
| `--color-on-primary` | Text on primary background |
| `--color-on-accent` | Text on accent background |
| `--color-footer-*` | Footer-specific colors |

---

*Theme Application Guide v2.5 | Phase 2*
