# Autumn Template Standards

> Warm, Earthy Color Palette
> Forest Green + Burnt Orange + Olive Chartreuse

---

## 1. Color Palette

### 1.1 Autumn Theme - Light Mode

| Token | RGB | Hex | Usage |
|-------|-----|-----|-------|
| **Primary** | `24 51 33` | `#183321` | Forest Green - buttons, links |
| **Primary Darker** | `8 21 13` | `#08150d` | Deep forest |
| **Primary Dark** | `16 36 23` | `#102417` | Hover states |
| **Primary Light** | `34 68 44` | `#22442c` | Highlights |
| **Primary Lighter** | `45 89 58` | `#2d593a` | Subtle accents |
| **Secondary** | `160 45 0` | `#a02d00` | Burnt Orange - CTAs, accents |
| **Secondary Darker** | `82 15 0` | `#520f00` | Deep rust |
| **Secondary Dark** | `114 26 2` | `#721a02` | Hover |
| **Secondary Light** | `199 68 26` | `#c7441a` | Lighter rust |
| **Secondary Lighter** | `225 98 64` | `#e16240` | Subtle rust |
| **Accent** | `155 177 44` | `#9bb12c` | Olive Chartreuse - highlights |
| **Accent Darker** | `84 103 18` | `#546712` | Deep olive |
| **Accent Dark** | `115 135 29` | `#73871d` | Hover |
| **Accent Light** | `191 209 67` | `#bfd143` | Bright olive |
| **Accent Lighter** | `223 238 121` | `#dfee79` | Pale chartreuse |
| **Background** | `249 245 237` | `#f9f5ed` | Warm cream |
| **Surface** | `242 236 223` | `#f2ecdf` | Warm tan |
| **Surface Alt** | `229 216 196` | `#e5d8c4` | Deeper tan |
| **Text Primary** | `35 31 26` | `#231f1a` | Warm dark brown |
| **Text Secondary** | `75 67 56` | `#4b4338` | Muted brown |
| **Text Muted** | `122 109 91` | `#7a6d5b` | Soft brown |
| **Border** | `212 195 167` | `#d4c3a7` | Warm border |

### 1.2 Autumn Theme - Dark Mode

| Token | RGB | Hex | Usage |
|-------|-----|-----|-------|
| **Primary** | `28 56 34` | `#1c3822` | Muted forest |
| **Primary Darker** | `45 89 58` | `#2d593a` | Lighter variant |
| **Primary Dark** | `34 68 44` | `#22442c` | Medium |
| **Primary Light** | `24 45 27` | `#182d1b` | Darker |
| **Primary Lighter** | `19 36 22` | `#132416` | Darkest |
| **Secondary** | `160 45 0` | `#a02d00` | Burnt orange |
| **Secondary Darker** | `225 98 64` | `#e16240` | Lighter for dark |
| **Secondary Dark** | `199 68 26` | `#c7441a` | Medium |
| **Secondary Light** | `114 26 2` | `#721a02` | Darker |
| **Secondary Lighter** | `82 15 0` | `#520f00` | Darkest |
| **Accent** | `155 177 44` | `#9bb12c` | Olive |
| **Accent Darker** | `223 238 121` | `#dfee79` | Lighter for dark |
| **Accent Dark** | `191 209 67` | `#bfd143` | Medium |
| **Accent Light** | `115 135 29` | `#73871d` | Darker |
| **Accent Lighter** | `84 103 18` | `#546712` | Darkest |
| **Background** | `27 20 15` | `#1b140f` | Deep warm brown |
| **Surface** | `42 33 25` | `#2a2119` | Elevated brown |
| **Surface Alt** | `58 43 31` | `#3a2b1f` | Alt surface |
| **Text Primary** | `248 244 234` | `#f8f4ea` | Warm white |
| **Text Secondary** | `214 201 180` | `#d6c9b4` | Warm gray |
| **Text Muted** | `164 147 125` | `#a4937d` | Muted warm |
| **Border** | `76 59 44` | `#4c3b2c` | Dark warm border |

### 1.3 Neutral Palette

| Token | RGB | Hex |
|-------|-----|-----|
| Neutral 50 | `247 242 233` | `#f7f2e9` |
| Neutral 100 | `238 227 209` | `#eee3d1` |
| Neutral 200 | `224 208 182` | `#e0d0b6` |
| Neutral 300 | `204 180 148` | `#ccb494` |
| Neutral 400 | `177 144 114` | `#b19072` |
| Neutral 500 | `145 114 85` | `#917255` |
| Neutral 600 | `111 84 60` | `#6f543c` |
| Neutral 700 | `83 63 45` | `#533f2d` |
| Neutral 800 | `58 43 31` | `#3a2b1f` |
| Neutral 900 | `36 27 19` | `#241b13` |
| Neutral 950 | `18 13 10` | `#120d0a` |

### 1.4 Semantic Colors

| Token | RGB | Hex |
|-------|-----|-----|
| Success | `95 167 95` | `#5fa75f` |
| Warning | `240 173 73` | `#f0ad49` |
| Error | `210 75 55` | `#d24b37` |
| Info | `87 150 217` | `#5796d9` |

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

```css
/* Autumn Theme - Light Mode */
:root[data-theme="autumn-light"] {
  /* Primary - Forest Green */
  --color-primary: 24 51 33;
  --color-primary-darker: 8 21 13;
  --color-primary-dark: 16 36 23;
  --color-primary-light: 34 68 44;
  --color-primary-lighter: 45 89 58;

  /* Secondary - Burnt Orange */
  --color-secondary: 160 45 0;
  --color-secondary-darker: 82 15 0;
  --color-secondary-dark: 114 26 2;
  --color-secondary-light: 199 68 26;
  --color-secondary-lighter: 225 98 64;

  /* Accent - Olive Chartreuse */
  --color-accent: 155 177 44;
  --color-accent-darker: 84 103 18;
  --color-accent-dark: 115 135 29;
  --color-accent-light: 191 209 67;
  --color-accent-lighter: 223 238 121;

  /* Surfaces */
  --color-background: 249 245 237;
  --color-surface: 242 236 223;
  --color-surface-alt: 229 216 196;

  /* Text */
  --color-text-primary: 35 31 26;
  --color-text-secondary: 75 67 56;
  --color-text-muted: 122 109 91;

  /* Border */
  --color-border: 212 195 167;

  /* On-color text */
  --color-on-primary: 248 244 234;
  --color-on-secondary: 248 244 234;
  --color-on-accent: 35 31 26;
}

/* Autumn Theme - Dark Mode */
:root[data-theme="autumn-dark"] {
  /* Primary - Forest Green (inverted) */
  --color-primary: 45 89 58;
  --color-primary-dark: 34 68 44;
  --color-primary-light: 24 51 33;

  /* Secondary - Burnt Orange (lighter for dark) */
  --color-secondary: 225 98 64;
  --color-secondary-dark: 199 68 26;
  --color-secondary-light: 160 45 0;

  /* Accent - Olive (lighter for dark) */
  --color-accent: 223 238 121;
  --color-accent-dark: 191 209 67;
  --color-accent-light: 155 177 44;

  /* Surfaces */
  --color-background: 27 20 15;
  --color-surface: 42 33 25;
  --color-surface-alt: 58 43 31;

  /* Text */
  --color-text-primary: 248 244 234;
  --color-text-secondary: 214 201 180;
  --color-text-muted: 164 147 125;

  /* Border */
  --color-border: 76 59 44;

  /* On-color text */
  --color-on-primary: 27 20 15;
  --color-on-secondary: 27 20 15;
  --color-on-accent: 35 31 26;
}
```

---

## 4. Footer (Always Dark)

```css
:root[data-theme="autumn-light"],
:root[data-theme="autumn-dark"] {
  --color-footer-accent: 225 98 64;       /* Burnt orange */
  --color-footer-accent-dark: 160 45 0;
  --color-footer-accent-muted: 251 146 60;
  --color-footer-text: 248 244 234;       /* Warm white */
  --color-footer-text-secondary: 214 201 180;
  --color-footer-text-muted: 164 147 125;
  --color-footer-border: 76 59 44;
  --color-footer-surface: 42 33 25;       /* Warm brown */
}
```

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
