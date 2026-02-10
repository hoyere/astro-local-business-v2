# Autumn Template Standards

> Warm, Earthy Color Palette
> Forest Green + Burnt Orange + Olive Chartreuse

---

## 1. Color Palette

### 1.1 Autumn Theme - Light Mode

| Token | Hex | oklch | Usage |
|-------|-----|-------|-------|
| **Primary** | `#183321` | `oklch(0.29 0.05 153)` | Forest Green - buttons, links |
| **Primary Dark** | `#102417` | `oklch(0.24 0.04 154)` | Hover states |
| **Primary Light** | `#22442c` | `oklch(0.35 0.06 152)` | Highlights |
| **Secondary** | `#a02d00` | `oklch(0.47 0.16 37)` | Burnt Orange - CTAs, accents |
| **Accent** | `#9bb12c` | `oklch(0.72 0.15 119)` | Olive Chartreuse - highlights |
| **Accent Dark** | `#73871d` | `oklch(0.59 0.13 120)` | Hover |
| **Accent Light** | `#bfd143` | `oklch(0.82 0.16 116)` | Bright olive |
| **Background** | `#f9f5ed` | `oklch(0.97 0.01 85)` | Warm cream |
| **Surface** | `#f2ecdf` | `oklch(0.94 0.02 86)` | Warm tan |
| **Surface Alt** | `#e5d8c4` | `oklch(0.89 0.03 79)` | Deeper tan |
| **Text** | `#231f1a` | `oklch(0.24 0.01 73)` | Warm dark brown |
| **Text Secondary** | `#4b4338` | `oklch(0.39 0.02 76)` | Muted brown |
| **Text Muted** | `#7a6d5b` | `oklch(0.54 0.03 76)` | Soft brown |
| **Border** | `#d4c3a7` | `oklch(0.82 0.04 80)` | Warm border |

### 1.2 Autumn Theme - Dark Mode

| Token | Hex | oklch | Usage |
|-------|-----|-------|-------|
| **Primary** | `#2d593a` | `oklch(0.42 0.07 152)` | Lighter forest for dark |
| **Primary Dark** | `#22442c` | `oklch(0.35 0.06 152)` | Hover |
| **Primary Light** | `#1c3822` | `oklch(0.31 0.05 150)` | Darker |
| **Secondary** | `#e16240` | `oklch(0.65 0.17 36)` | Lighter burnt orange |
| **Accent** | `#dfee79` | `oklch(0.91 0.14 115)` | Lighter olive |
| **Accent Dark** | `#bfd143` | `oklch(0.82 0.16 116)` | Medium |
| **Accent Light** | `#9bb12c` | `oklch(0.72 0.15 119)` | Darker |
| **Background** | `#1b140f` | `oklch(0.20 0.02 57)` | Deep warm brown |
| **Surface** | `#2a2119` | `oklch(0.26 0.02 63)` | Elevated brown |
| **Surface Alt** | `#3a2b1f` | `oklch(0.30 0.03 60)` | Alt surface |
| **Text** | `#f8f4ea` | `oklch(0.97 0.01 89)` | Warm white |
| **Text Secondary** | `#d6c9b4` | `oklch(0.84 0.03 80)` | Warm gray |
| **Text Muted** | `#a4937d` | `oklch(0.67 0.04 74)` | Muted warm |
| **Border** | `#4c3b2c` | `oklch(0.37 0.03 63)` | Dark warm border |

### 1.3 Neutral Palette

| Token | Hex |
|-------|-----|
| Neutral 50 | `#f7f2e9` |
| Neutral 100 | `#eee3d1` |
| Neutral 200 | `#e0d0b6` |
| Neutral 300 | `#ccb494` |
| Neutral 400 | `#b19072` |
| Neutral 500 | `#917255` |
| Neutral 600 | `#6f543c` |
| Neutral 700 | `#533f2d` |
| Neutral 800 | `#3a2b1f` |
| Neutral 900 | `#241b13` |
| Neutral 950 | `#120d0a` |

### 1.4 Semantic Colors

| Token | Hex |
|-------|-----|
| Success | `#5fa75f` |
| Warning | `#f0ad49` |
| Error | `#d24b37` |
| Info | `#5796d9` |

---

## 2. Typography

### 2.1 Font Families

```css
--font-heading: "Alfa Slab One", "Roboto Slab", "Roboto", system-ui, serif;
--font-body: "Roboto", "Source Sans Pro", "Inter", system-ui, sans-serif;
--font-mono: "Roboto Mono", "SFMono-Regular", "Cascadia Code", monospace;
```

### 2.2 Font Sizes

| Token | Size | Line Height |
|-------|------|-------------|
| Display | 4.75rem | 1.1 |
| Heading XL | 3.5rem | 1.3 |
| Heading LG | 2.5rem | 1.3 |
| Heading | 2rem | 1.3 |
| Heading SM | 1.5rem | 1.3 |
| Body LG | 1.125rem | 1.65 |
| Body | 1rem | 1.65 |
| Body SM | 0.9375rem | 1.65 |

---

## 3. CSS Variable Reference

> **Implementation note:** Colors are defined as `oklch()` values inside a Tailwind v4 `@theme` block in `src/styles/global.css`. This makes every `--color-*` variable available as a Tailwind utility class (e.g., `bg-primary`, `text-text-secondary`, `border-border`).

```css
/* Autumn Theme - Light (Default) — defined in @theme block */
@theme {
  /* Primary - Forest Green */
  --color-primary: oklch(0.29 0.05 153);          /* #183321 */
  --color-primary-dark: oklch(0.24 0.04 154);     /* #102417 */
  --color-primary-light: oklch(0.35 0.06 152);    /* #22442c */

  /* Secondary - Burnt Orange */
  --color-secondary: oklch(0.47 0.16 37);         /* #a02d00 */

  /* Accent - Olive Chartreuse */
  --color-accent: oklch(0.72 0.15 119);           /* #9bb12c */
  --color-accent-dark: oklch(0.59 0.13 120);      /* #73871d */
  --color-accent-light: oklch(0.82 0.16 116);     /* #bfd143 */

  /* Text */
  --color-text: oklch(0.24 0.01 73);              /* #231f1a */
  --color-text-secondary: oklch(0.39 0.02 76);    /* #4b4338 */
  --color-text-muted: oklch(0.54 0.03 76);        /* #7a6d5b */
  --color-text-inverse: oklch(0.97 0.01 89);      /* #f8f4ea */

  /* On-color text */
  --color-on-primary: oklch(0.97 0.01 89);        /* #f8f4ea */
  --color-on-accent: oklch(0.24 0.01 73);         /* #231f1a */

  /* Surfaces */
  --color-background: oklch(0.97 0.01 85);        /* #f9f5ed */
  --color-surface: oklch(0.94 0.02 86);           /* #f2ecdf */
  --color-surface-alt: oklch(0.89 0.03 79);       /* #e5d8c4 */
  --color-surface-elevated: oklch(0.97 0.01 85);
  --color-border: oklch(0.82 0.04 80);            /* #d4c3a7 */

  /* Footer (always dark) */
  --color-footer-bg: oklch(0.26 0.02 63);         /* #2a2119 */
  --color-footer-text: oklch(0.97 0.01 89);       /* #f8f4ea */
  --color-footer-text-secondary: oklch(0.84 0.03 80); /* #d6c9b4 */
  --color-footer-text-muted: oklch(0.67 0.04 74); /* #a4937d */
  --color-footer-border: oklch(0.37 0.03 63);     /* #4c3b2c */
  --color-footer-accent: oklch(0.65 0.17 36);     /* #e16240 */
  --color-footer-surface: oklch(0.26 0.02 63);    /* #2a2119 */
}

/* Autumn Theme - Dark */
[data-theme="dark"] {
  /* Primary - Forest Green (lighter for dark) */
  --color-primary: oklch(0.42 0.07 152);          /* #2d593a */
  --color-primary-dark: oklch(0.35 0.06 152);     /* #22442c */
  --color-primary-light: oklch(0.31 0.05 150);    /* #1c3822 */

  /* Secondary - Burnt Orange (lighter for dark) */
  --color-secondary: oklch(0.65 0.17 36);         /* #e16240 */

  /* Accent - Olive (lighter for dark) */
  --color-accent: oklch(0.91 0.14 115);           /* #dfee79 */
  --color-accent-dark: oklch(0.82 0.16 116);      /* #bfd143 */
  --color-accent-light: oklch(0.72 0.15 119);     /* #9bb12c */

  /* Text */
  --color-text: oklch(0.97 0.01 89);              /* #f8f4ea */
  --color-text-secondary: oklch(0.84 0.03 80);    /* #d6c9b4 */
  --color-text-muted: oklch(0.67 0.04 74);        /* #a4937d */
  --color-text-inverse: oklch(0.20 0.02 57);      /* #1b140f */

  /* On-color text */
  --color-on-primary: oklch(0.20 0.02 57);        /* #1b140f */
  --color-on-accent: oklch(0.24 0.01 73);         /* #231f1a */

  /* Surfaces */
  --color-background: oklch(0.20 0.02 57);        /* #1b140f */
  --color-surface: oklch(0.26 0.02 63);           /* #2a2119 */
  --color-surface-alt: oklch(0.30 0.03 60);       /* #3a2b1f */
  --color-surface-elevated: oklch(0.37 0.03 63);
  --color-border: oklch(0.37 0.03 63);            /* #4c3b2c */

  /* Footer - darker in dark mode */
  --color-footer-bg: oklch(0.16 0.02 57);
  --color-footer-text: oklch(0.97 0.01 89);
  --color-footer-text-secondary: oklch(0.84 0.03 80);
  --color-footer-text-muted: oklch(0.60 0.04 74);
  --color-footer-border: oklch(0.30 0.02 60);
  --color-footer-accent: oklch(0.65 0.17 36);
  --color-footer-surface: oklch(0.20 0.02 57);
}
```

---

## 4. Footer (Always Dark)

Footer tokens are defined inside the `@theme` block (always dark, shared across light/dark modes):

| Token | Hex | oklch |
|-------|-----|-------|
| **Footer BG** | `#2a2119` | `oklch(0.26 0.02 63)` |
| **Footer Text** | `#f8f4ea` | `oklch(0.97 0.01 89)` |
| **Footer Text Secondary** | `#d6c9b4` | `oklch(0.84 0.03 80)` |
| **Footer Text Muted** | `#a4937d` | `oklch(0.67 0.04 74)` |
| **Footer Border** | `#4c3b2c` | `oklch(0.37 0.03 63)` |
| **Footer Accent** | `#e16240` | `oklch(0.65 0.17 36)` |
| **Footer Surface** | `#2a2119` | `oklch(0.26 0.02 63)` |

---

## 5. Design Characteristics

### 5.1 Color Personality

- **Warm & Earthy**: Cream backgrounds, warm browns
- **Natural**: Forest greens, olive accents
- **Rustic**: Burnt orange secondary creates autumn feel
- **Cozy**: Low contrast, soft edges

### 5.2 Ideal Use Cases

- Restaurants & Cafes
- Farm-to-table concepts
- Breweries & Wineries
- Autumn/Harvest themes
- Rustic/Country aesthetics
- Natural/Organic brands

### 5.3 Color Psychology

| Color | Emotion |
|-------|---------|
| Forest Green | Growth, nature, grounding |
| Burnt Orange | Warmth, creativity, energy |
| Olive | Earthiness, authenticity |
| Cream | Comfort, simplicity |

---

## 6. Comparison with GA Theme

| Element | GA Theme | Autumn Theme |
|---------|----------|--------------|
| Primary | Emerald #02a26a | Forest #183321 |
| Secondary | Gold #ffdd6a | Burnt Orange #a02d00 |
| Accent | (same as secondary) | Olive #9bb12c |
| Background | Pure white | Warm cream #f9f5ed |
| Text | Cool dark #0f1c18 | Warm dark #231f1a |
| Feel | Modern, fresh | Rustic, cozy |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1 | 2026-02-08 | Version aligned with audit system v2.2 |
| 1.0 | 2024-12-23 | Extracted from pre-rebranding theme (commit cb682fe) |
