# GA Template Standards

> GrowthAutomations Brewing Co. Theme
> Emerald Green + Golden Yellow

---

## 1. Color Palette

### 1.1 GA Core Theme - Light Mode

| Token | Hex | oklch | Usage |
|-------|-----|-------|-------|
| **Primary** | `#02a26a` | `oklch(0.58 0.15 160)` | Emerald Green - buttons, links, accents |
| **Primary Dark** | `#0c7e5a` | `oklch(0.48 0.12 160)` | Hover states |
| **Primary Light** | `#3ad69e` | `oklch(0.75 0.17 160)` | Highlights |
| **Accent** | `#ffdd6a` | `oklch(0.90 0.13 90)` | Golden Yellow - CTAs, badges |
| **Accent Dark** | `#e6be46` | `oklch(0.80 0.14 85)` | Accent hover |
| **Background** | `#FFFFFF` | `oklch(1 0 0)` | Page background |
| **Surface** | `#FFFFFF` | `oklch(1 0 0)` | Cards, elevated |
| **Surface Alt** | `#f5fbf8` | `oklch(0.98 0.01 160)` | Alternate surface |
| **Text** | `#0f1c18` | `oklch(0.15 0.02 160)` | Headings, body |
| **Text Secondary** | `#374b44` | `oklch(0.35 0.03 160)` | Muted text |
| **Text Muted** | `#64786e` | `oklch(0.50 0.03 160)` | Placeholders |
| **Border** | `#dcebe4` | `oklch(0.92 0.02 160)` | Dividers |

### 1.2 GA Core Theme - Dark Mode

| Token | Hex | oklch | Usage |
|-------|-----|-------|-------|
| **Primary** | `#3ad69e` | `oklch(0.75 0.17 160)` | Lighter emerald |
| **Primary Dark** | `#1fa874` | `oklch(0.60 0.14 160)` | Hover |
| **Primary Light** | `#64e6b4` | `oklch(0.82 0.15 160)` | Highlights |
| **Accent** | `#f8d15f` | `oklch(0.87 0.13 85)` | Muted gold |
| **Background** | `#101c19` | `oklch(0.13 0.02 160)` | Dark green-black |
| **Surface** | `#192a24` | `oklch(0.18 0.03 160)` | Elevated |
| **Surface Alt** | `#233730` | `oklch(0.24 0.03 160)` | Alt surface |
| **Text** | `#f5fbf8` | `oklch(0.97 0.01 160)` | Light text |
| **Text Secondary** | `#c8dcd4` | `oklch(0.87 0.02 160)` | Secondary |
| **Text Muted** | `#96afa5` | `oklch(0.70 0.03 160)` | Muted |
| **Border** | `#2d4137` | `oklch(0.28 0.03 160)` | Dark border |

### 1.3 On-Color Text

| Token | Hex | oklch | Usage |
|-------|-----|-------|-------|
| **On Primary** | `#FFFFFF` | `oklch(1 0 0)` | Text on green buttons |
| **On Accent** | `#0f1c18` | `oklch(0.15 0.02 160)` | Text on yellow backgrounds |

### 1.4 Footer (Always Dark)

| Token | Hex | oklch |
|-------|-----|-------|
| **Footer BG** | `#192a24` | `oklch(0.18 0.03 160)` |
| **Footer Text** | `#f5fbf8` | `oklch(0.97 0.01 160)` |
| **Footer Text Secondary** | `#c8dcd4` | `oklch(0.80 0.02 160)` |
| **Footer Text Muted** | `#96afa5` | `oklch(0.70 0.03 160)` |
| **Footer Border** | `#2d4137` | `oklch(0.28 0.03 160)` |
| **Footer Accent** | `#3ad69e` | `oklch(0.75 0.17 160)` |
| **Footer Surface** | `#1f332c` | `oklch(0.22 0.03 160)` |

---

## 2. Typography

### 2.1 Font Families

```css
--font-heading: "Alfa Slab One", "Roboto Slab", serif;
--font-body: "Roboto", "Source Sans Pro", system-ui, sans-serif;
--font-mono: "Roboto Mono", monospace;
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

## 3. Shadows

Defined as complete shadow values in the `@theme` block:

```css
--shadow-sm: 0 1px 2px oklch(0 0 0 / 0.05);
--shadow-md: 0 4px 6px oklch(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px oklch(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px oklch(0 0 0 / 0.1);
```

Dark mode uses higher opacity (0.3 - 0.45).

---

## 4. Overlays

```css
--overlay-dark-light: oklch(0.13 0.02 160 / 0.3);
--overlay-dark-medium: oklch(0.13 0.02 160 / 0.5);
--overlay-dark-heavy: oklch(0.13 0.02 160 / 0.7);
--overlay-white-light: oklch(1 0 0 / 0.1);
--overlay-white-medium: oklch(1 0 0 / 0.3);
--overlay-white-heavy: oklch(1 0 0 / 0.5);
```

---

## 5. CSS Variable Reference

> **Implementation note:** Colors are defined as `oklch()` values inside a Tailwind v4 `@theme` block in `src/styles/global.css`. This makes every `--color-*` variable available as a Tailwind utility class (e.g., `bg-primary`, `text-text-secondary`, `border-border`).

```css
/* GA Core - Light (Default) — defined in @theme block */
@theme {
  --color-primary: oklch(0.58 0.15 160);
  --color-primary-dark: oklch(0.48 0.12 160);
  --color-primary-light: oklch(0.75 0.17 160);

  --color-accent: oklch(0.90 0.13 90);
  --color-accent-dark: oklch(0.80 0.14 85);
  --color-accent-light: oklch(0.94 0.10 95);

  --color-text: oklch(0.15 0.02 160);
  --color-text-secondary: oklch(0.35 0.03 160);
  --color-text-muted: oklch(0.50 0.03 160);
  --color-text-inverse: oklch(0.98 0 0);
  --color-on-primary: oklch(1 0 0);
  --color-on-accent: oklch(0.15 0.02 160);

  --color-background: oklch(1 0 0);
  --color-surface: oklch(1 0 0);
  --color-surface-alt: oklch(0.98 0.01 160);
  --color-border: oklch(0.92 0.02 160);

  /* Footer (always dark) */
  --color-footer-bg: oklch(0.18 0.03 160);
  --color-footer-text: oklch(0.97 0.01 160);
  --color-footer-text-secondary: oklch(0.80 0.02 160);
  --color-footer-text-muted: oklch(0.70 0.03 160);
  --color-footer-border: oklch(0.28 0.03 160);
  --color-footer-accent: oklch(0.75 0.17 160);
  --color-footer-surface: oklch(0.22 0.03 160);
}

/* GA Core - Dark */
[data-theme="dark"] {
  --color-primary: oklch(0.75 0.17 160);
  --color-primary-dark: oklch(0.60 0.14 160);
  --color-primary-light: oklch(0.82 0.15 160);

  --color-accent: oklch(0.87 0.13 85);
  --color-accent-dark: oklch(0.80 0.14 85);

  --color-text: oklch(0.97 0.01 160);
  --color-text-secondary: oklch(0.87 0.02 160);
  --color-text-muted: oklch(0.70 0.03 160);
  --color-text-inverse: oklch(0.13 0.02 160);
  --color-on-primary: oklch(0.13 0.02 160);
  --color-on-accent: oklch(0.13 0.02 160);

  --color-background: oklch(0.13 0.02 160);
  --color-surface: oklch(0.18 0.03 160);
  --color-surface-alt: oklch(0.24 0.03 160);
  --color-border: oklch(0.28 0.03 160);

  /* Footer - darker in dark mode */
  --color-footer-bg: oklch(0.10 0.02 160);
  --color-footer-text: oklch(0.97 0.01 160);
  --color-footer-text-secondary: oklch(0.80 0.02 160);
  --color-footer-text-muted: oklch(0.65 0.03 160);
  --color-footer-border: oklch(0.20 0.02 160);
  --color-footer-accent: oklch(0.75 0.17 160);
  --color-footer-surface: oklch(0.15 0.02 160);
}
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2 | 2026-02-10 | Migrated all color values to oklch, updated §5 to match actual global.css @theme block, fixed dark mode selector to `[data-theme="dark"]` |
| 1.1 | 2026-02-08 | Added footer text secondary/muted tokens, CSS reference for footer |
| 1.0 | 2024-12-23 | Initial GA theme documentation |
