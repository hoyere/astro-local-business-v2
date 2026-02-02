# GA Template Standards

> GrowthAutomations Brewing Co. Theme
> Emerald Green + Golden Yellow

---

## 1. Color Palette

### 1.1 GA Core Theme - Light Mode

| Token | RGB | Hex | Usage |
|-------|-----|-----|-------|
| **Primary** | `2 162 106` | `#02a26a` | Emerald Green - buttons, links, accents |
| **Primary Dark** | `12 126 90` | `#0c7e5a` | Hover states |
| **Primary Light** | `58 214 158` | `#3ad69e` | Highlights |
| **Accent** | `255 221 106` | `#ffdd6a` | Golden Yellow - CTAs, badges |
| **Accent Dark** | `230 190 70` | `#e6be46` | Accent hover |
| **Background** | `255 255 255` | `#FFFFFF` | Page background |
| **Surface** | `255 255 255` | `#FFFFFF` | Cards, elevated |
| **Surface Alt** | `245 251 248` | `#f5fbf8` | Alternate surface |
| **Text Primary** | `15 28 24` | `#0f1c18` | Headings, body |
| **Text Secondary** | `55 75 68` | `#374b44` | Muted text |
| **Text Muted** | `100 120 110` | `#64786e` | Placeholders |
| **Border** | `220 235 228` | `#dcebe4` | Dividers |

### 1.2 GA Core Theme - Dark Mode

| Token | RGB | Hex | Usage |
|-------|-----|-----|-------|
| **Primary** | `58 214 158` | `#3ad69e` | Lighter emerald |
| **Primary Dark** | `31 168 116` | `#1fa874` | Hover |
| **Primary Light** | `100 230 180` | `#64e6b4` | Highlights |
| **Accent** | `248 209 95` | `#f8d15f` | Muted gold |
| **Background** | `16 28 25` | `#101c19` | Dark green-black |
| **Surface** | `25 42 36` | `#192a24` | Elevated |
| **Surface Alt** | `35 55 48` | `#233730` | Alt surface |
| **Text Primary** | `245 251 248` | `#f5fbf8` | Light text |
| **Text Secondary** | `200 220 212` | `#c8dcd4` | Secondary |
| **Text Muted** | `150 175 165` | `#96afa5` | Muted |
| **Border** | `45 65 55` | `#2d4137` | Dark border |

### 1.3 On-Color Text

| Token | RGB | Hex | Usage |
|-------|-----|-----|-------|
| **On Primary** | `255 255 255` | `#FFFFFF` | Text on green buttons |
| **On Accent** | `15 28 24` | `#0f1c18` | Text on yellow backgrounds |

### 1.4 Footer (Always Dark)

| Token | RGB | Hex |
|-------|-----|-----|
| **Footer Accent** | `58 214 158` | `#3ad69e` |
| **Footer Text** | `245 251 248` | `#f5fbf8` |
| **Footer Surface** | `25 42 36` | `#192a24` |
| **Footer Border** | `45 65 55` | `#2d4137` |

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

Uses CSS variables for theme-aware shadow colors:

```css
--shadow-color: 15 28 24;  /* Dark green-black */
--shadow-opacity-sm: 0.05;
--shadow-opacity-md: 0.08;
--shadow-opacity-lg: 0.12;
--shadow-opacity-xl: 0.16;
```

Dark mode uses higher opacity (0.2 - 0.5).

---

## 4. Overlays

```css
--overlay-light: 0 0 0 / 0.3;
--overlay-medium: 0 0 0 / 0.5;
--overlay-heavy: 0 0 0 / 0.7;
```

---

## 5. CSS Variable Reference

```css
/* GA Core - Light (Default) */
:root,
:root[data-theme="ga-light"] {
  --color-primary: 2 162 106;
  --color-primary-dark: 12 126 90;
  --color-primary-light: 58 214 158;
  --color-accent: 255 221 106;
  --color-accent-dark: 230 190 70;
  --color-accent-light: 255 235 160;
  --color-background: 255 255 255;
  --color-surface: 255 255 255;
  --color-surface-alt: 245 251 248;
  --color-text-primary: 15 28 24;
  --color-text-secondary: 55 75 68;
  --color-text-muted: 100 120 110;
  --color-border: 220 235 228;
  --color-on-primary: 255 255 255;
  --color-on-accent: 15 28 24;
}

/* GA Core - Dark */
:root[data-theme="ga-dark"] {
  --color-primary: 58 214 158;
  --color-primary-dark: 31 168 116;
  --color-primary-light: 100 230 180;
  --color-accent: 248 209 95;
  --color-accent-dark: 230 190 70;
  --color-accent-light: 255 225 140;
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

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12-23 | Initial GA theme documentation |
