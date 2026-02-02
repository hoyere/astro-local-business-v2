# AUDIT v2 Addendum - January 2026 Updates

> Updates to the audit system based on Astro 5.x, Tailwind v4, and lessons learned from 8 repo analysis

---

## Summary of Changes

Based on analysis of 1,121 commits across 8 template repositories, these patterns have been updated:

1. **Image System** - Two-phase workflow (download → use)
2. **Tailwind Setup** - v4 via `@tailwindcss/vite`
3. **Content Collections** - New location and API
4. **CSS Variables** - `@theme` block pattern
5. **Header Stability** - Required patterns

---

## 1. Image System (CRITICAL)

### Old Pattern (DEPRECATED)

```astro
<!-- DON'T DO THIS - Runtime fetching causes non-deterministic builds -->
<UnsplashImage query="landscaping" />
```

### New Pattern (REQUIRED)

**Phase 1: Download during development**
```bash
image-studio fetch "landscaping" --output src/assets/images/photos
```

**Phase 2: Use locally**
```astro
---
import { Image } from 'astro:assets';
import hero from '@assets/images/photos/hero.jpg';
---
<Image src={hero} alt="description" />
```

### Audit Checklist Update

In `AUDIT_v2_2_STRUCTURE.md`, add:

- [ ] No runtime image fetching (no `UnsplashImage` or similar)
- [ ] All images in `src/assets/images/` (not `public/`)
- [ ] Images use Astro's `<Image />` component
- [ ] `ATTRIBUTION.md` exists with image credits

---

## 2. Tailwind CSS v4 Setup

### Old Pattern (DEPRECATED)

```javascript
// astro.config.mjs - DON'T USE
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
});
```

### New Pattern (REQUIRED)

```javascript
// astro.config.mjs
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.55 0.2 250);
  /* ... */
}
```

### Audit Checklist Update

In `AUDIT_v2_1_CODE.md`, add:

- [ ] Using `@tailwindcss/vite` (not `@astrojs/tailwind`)
- [ ] Theme defined in CSS `@theme` block (not tailwind.config.js)
- [ ] No `tailwind.config.js` unless custom plugins needed

---

## 3. Content Collections

### Old Pattern

```typescript
// src/content/config.ts
import { defineCollection } from 'astro:content';
```

### New Pattern (Astro 5.x)

```typescript
// src/content.config.ts (note: different location!)
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    image: image().optional(),  // Validates image exists!
  }),
});

export const collections = { services };
```

### Audit Checklist Update

In `AUDIT_v2_2_STRUCTURE.md`, add:

- [ ] Collections defined in `src/content.config.ts` (not `src/content/config.ts`)
- [ ] Using `glob` loader (Astro 5.x pattern)
- [ ] Images validated with `image()` schema function

---

## 4. CSS Variables Pattern

### Required Structure

```css
@theme {
  /* Colors - using oklch for better color manipulation */
  --color-primary: oklch(0.55 0.2 250);
  --color-primary-light: oklch(0.65 0.18 250);
  --color-primary-dark: oklch(0.45 0.22 250);

  --color-text: oklch(0.2 0.02 250);
  --color-text-muted: oklch(0.45 0.02 250);
  --color-background: oklch(1 0 0);
  --color-surface: oklch(0.97 0.005 250);
  --color-border: oklch(0.9 0.01 250);

  /* Layout */
  --header-height: 80px;
  --header-height-scrolled: 64px;
  --container-max: 1280px;
  --section-padding-y: 5rem;
}

/* Dark mode */
[data-theme="dark"] {
  --color-text: oklch(0.95 0.01 250);
  --color-background: oklch(0.15 0.02 250);
  /* ... */
}
```

### Audit Checklist Update

In `AUDIT_v2_4_THEME_PREP.md`, add:

- [ ] Using `@theme` block (not custom properties in `:root`)
- [ ] Dark mode uses `[data-theme="dark"]` selector
- [ ] No hardcoded color values in components

---

## 5. Header Stability Patterns

### Required CSS

```css
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  z-index: 50;
}

.header-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* CRITICAL: Prevent layout shift */
.header-logo {
  flex-shrink: 0;
}

.header-nav {
  white-space: nowrap;
}

.header-cta {
  flex-shrink: 0;
}

/* Content offset */
main {
  padding-top: var(--header-height);
}
```

### Audit Checklist Update

In `AUDIT_v2_2_STRUCTURE.md`, add:

- [ ] Header uses `position: fixed` with CSS variable height
- [ ] Header elements have `flex-shrink: 0` to prevent collapse
- [ ] Navigation has `white-space: nowrap`
- [ ] Main content has `padding-top: var(--header-height)`
- [ ] Scroll behavior doesn't cause layout shift

---

## 6. New Required Files

### Project Root

| File | Purpose |
|------|---------|
| `src/content.config.ts` | Collection schemas (moved from content/) |
| `src/site.config.ts` | Centralized site configuration |
| `ATTRIBUTION.md` | Image credits tracking |

### Components

| Directory | Purpose |
|-----------|---------|
| `src/components/sections/` | Page sections (Hero, Services, etc.) |
| `src/components/common/` | Reusable UI (Button, Container) |
| `src/components/layout/` | Header, Footer |
| `src/components/seo/` | Schema, meta components |

---

## 7. Dependencies

### Required

```json
{
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/sitemap": "^3.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

### Deprecated (Remove if present)

- `@astrojs/tailwind`
- `astro-unsplash-integration`
- Any runtime image fetching package

---

## Reference

For full implementation details, see:

- [IMAGE_WORKFLOW.md](../IMAGE_WORKFLOW.md)
- [TEMPLATE_CUSTOMIZATION.md](../TEMPLATE_CUSTOMIZATION.md)
- [astro-local-business-v2](https://github.com/hoyere/astro-local-business-v2) - Reference implementation

---

*Addendum created: January 2026*
*Based on analysis of 8 repositories, 1,121 commits*
