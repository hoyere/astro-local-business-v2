# Theme Application Guide

> How to apply a new theme/brand to astro-local-business-v2
> Follow these steps to customize colors, fonts, and branding

---

## Overview

The template uses CSS custom properties (variables) for all visual theming. To apply a new theme, you'll update:

1. **Color variables** in `src/styles/global.css`
2. **Site config** in `src/site.config.ts`
3. **Assets** (logo, favicon, OG image)

---

## Step 1: Gather Brand Assets

Before starting, collect from the client:

| Asset | Format | Notes |
|-------|--------|-------|
| Primary color | Hex code | Main brand color |
| Secondary color | Hex code | Optional accent |
| Logo | SVG preferred | For header |
| Favicon | SVG + ICO | Multiple sizes |
| OG Image | 1200x630 PNG | Social sharing |
| Font | Google Fonts or files | If custom |

---

## Step 2: Convert Colors to OKLCH

The template uses OKLCH color format for better perceptual uniformity.

### Online Converter
Use: https://oklch.com/

### Quick Conversion Examples

| Hex | OKLCH | Notes |
|-----|-------|-------|
| `#02a26a` (emerald) | `oklch(0.58 0.15 160)` | GA Primary |
| `#ffdd6a` (gold) | `oklch(0.90 0.13 90)` | GA Accent |
| `#0f1c18` (green-black) | `oklch(0.15 0.02 160)` | GA Text |
| `#1e40af` (blue) | `oklch(0.45 0.2 260)` | |
| `#dc2626` (red) | `oklch(0.55 0.22 25)` | |

### OKLCH Format
```
oklch(L C H)
  L = Lightness (0-1, where 0=black, 1=white)
  C = Chroma (0-0.4, color intensity)
  H = Hue (0-360, color wheel angle)
```

---

## Step 3: Update Color Variables

Edit `src/styles/global.css`:

### Primary Colors

```css
@theme {
  /* ----------------------------------------
     Colors - Primary (Example: GA Emerald Green)
     Replace these with your client's brand colors
     ---------------------------------------- */
  --color-primary: oklch(0.58 0.15 160);      /* Main brand color */
  --color-primary-light: oklch(0.75 0.17 160); /* Lighter variant */
  --color-primary-dark: oklch(0.48 0.12 160);  /* Darker (hover) */
```

**Tip:** Keep the same chroma (C) and hue (H), just adjust lightness (L):
- Light variant: L + 0.10
- Dark variant: L - 0.10

### Accent Color

```css
  /* Accent color (stars, badges, CTAs, highlights) */
  --color-accent: oklch(0.90 0.13 90);       /* Example: GA Golden Yellow */
  --color-accent-dark: oklch(0.80 0.14 85);
```

### Footer Colors

The footer has its own color scheme (usually dark, matches primary hue):

```css
  /* ----------------------------------------
     Colors - Footer (dark, matches primary hue)
     ---------------------------------------- */
  --color-footer-bg: oklch(0.18 0.03 160);     /* Dark green */
  --color-footer-text: oklch(0.97 0.01 160);
  --color-footer-text-muted: oklch(0.70 0.03 160);
  --color-footer-border: oklch(0.28 0.03 160);
  --color-footer-accent: oklch(0.75 0.17 160);  /* Match primary hue */
```

---

## Step 4: Update Dark Mode

Scroll to the `[data-theme="dark"]` section and update:

```css
[data-theme="dark"] {
  /* Primary adjustments for dark - slightly brighter */
  --color-primary: oklch(0.6 0.2 250);      /* L + 0.05 from light */
  --color-primary-light: oklch(0.7 0.18 250);

  /* Accent - slightly brighter in dark mode */
  --color-accent: oklch(0.78 0.15 85);

  /* Footer - slightly darker in dark mode */
  --color-footer-bg: oklch(0.1 0.02 250);
  --color-footer-accent: oklch(0.65 0.18 250);
}
```

---

## Step 5: Update Site Config

Edit `src/site.config.ts`:

```typescript
export const siteConfig = {
  // Business Info
  name: "Client Business Name",
  description: "Brief description for SEO",

  // Contact
  contact: {
    phone: "(555) 123-4567",
    email: "info@clientdomain.com",
    address: {
      street: "123 Main Street",
      city: "City",
      state: "ST",
      zip: "12345",
    },
  },

  // Social Media
  social: {
    facebook: "https://facebook.com/clientpage",
    instagram: "https://instagram.com/clienthandle",
    bluesky: "https://bsky.app/profile/clienthandle.bsky.social",
    linkedin: "https://linkedin.com/company/clientcompany",
    // ... etc
  },

  // Business Hours
  hours: [
    { days: "Mon-Fri", hours: "9:00 AM - 5:00 PM" },
    { days: "Saturday", hours: "10:00 AM - 2:00 PM" },
    { days: "Sunday", hours: "Closed" },
  ],
};
```

---

## Step 6: Update Assets

### Logo
1. Place logo in `public/` or `src/assets/`
2. Update Header.astro to use new logo

### Favicon
1. Replace `public/favicon.svg`
2. Replace `public/favicon.ico`
3. Generate from https://realfavicongenerator.net/

### OG Image
1. Create 1200x630 image with brand colors
2. Replace `public/og-image.jpg`

---

## Step 7: Update Fonts (Optional)

If using custom fonts:

### Google Fonts
Add to `src/layouts/BaseLayout.astro`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=CustomFont:wght@400;600;700&display=swap" rel="stylesheet">
```

### Update CSS
```css
@theme {
  --font-sans: 'CustomFont', system-ui, sans-serif;
  --font-display: 'CustomFont', system-ui, sans-serif;
}
```

---

## Step 8: Test Theme

### Visual Check
1. `npm run dev`
2. Check all pages in light mode
3. Toggle to dark mode (DevTools: `document.documentElement.dataset.theme = 'dark'`)
4. Check footer contrast

### Color Contrast
Use Chrome DevTools or https://webaim.org/resources/contrastchecker/

| Check | Minimum Ratio |
|-------|---------------|
| Body text on background | 4.5:1 |
| Primary on white | 4.5:1 (if used for text) |
| Footer text on footer bg | 4.5:1 |

### Build Test
```bash
npm run build
npm run preview
```

---

## Quick Reference: Common Brand Colors

| Brand Type | Primary Hue | Example |
|------------|-------------|---------|
| Law/Finance | Blue (250-270) | `oklch(0.45 0.2 260)` |
| Health/Nature | Green (140-160) | `oklch(0.55 0.18 150)` |
| Food/Restaurant | Red/Orange (20-40) | `oklch(0.55 0.2 30)` |
| Tech/Modern | Purple (280-300) | `oklch(0.5 0.2 290)` |
| Construction | Orange (50-70) | `oklch(0.6 0.18 60)` |

---

## Checklist

### Before Starting
- [ ] Have all brand assets
- [ ] Colors converted to OKLCH

### Color Updates
- [ ] Primary colors updated
- [ ] Accent color updated
- [ ] Footer colors updated
- [ ] Dark mode variants updated

### Config Updates
- [ ] site.config.ts updated
- [ ] Business info correct
- [ ] Contact info correct
- [ ] Social links correct

### Assets
- [ ] Logo replaced
- [ ] Favicon replaced
- [ ] OG image replaced

### Testing
- [ ] Light mode looks correct
- [ ] Dark mode looks correct
- [ ] Color contrast passes
- [ ] Build succeeds
- [ ] All pages checked

---

## Troubleshooting

### Colors look wrong
- Check OKLCH conversion (use oklch.com)
- Verify no hardcoded colors remain
- Check dark mode overrides

### Footer text hard to read
- Increase `--color-footer-text` lightness
- Decrease `--color-footer-bg` lightness
- Check contrast ratio is 4.5:1+

### Dark mode flashes white
- Ensure theme script is in `<head>` before any CSS
- Check `is:inline` on theme script

### Fonts not loading
- Check Google Fonts URL is correct
- Verify `font-display: swap` is set
- Check network tab for 404s

---

*Theme Application Guide v1.0 | astro-local-business-v2*
