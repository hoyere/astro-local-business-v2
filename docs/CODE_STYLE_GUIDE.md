# Code Style Guide

> Conventions for Astro Local Business Templates
> Based on research findings from Phase 5 (January 2026)

---

## Table of Contents

1. [Astro Component Patterns](#1-astro-component-patterns)
2. [TypeScript Conventions](#2-typescript-conventions)
3. [CSS & Tailwind](#3-css--tailwind)
4. [Accessibility](#4-accessibility)
5. [Performance](#5-performance)
6. [File Organization](#6-file-organization)

---

## 1. Astro Component Patterns

### Props Interface

Always define a TypeScript interface for component props:

```astro
---
interface Props {
  title: string;
  description?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

const {
  title,
  description,
  variant = 'primary'
} = Astro.props;
---
```

### Client Directives

Choose based on interaction timing:

| Directive | Use When |
|-----------|----------|
| `client:load` | Interactive immediately (forms, navigation) |
| `client:idle` | After page load (non-critical widgets) |
| `client:visible` | When scrolled into view (below-fold content) |
| `client:media` | At specific breakpoints |

### Slots

Use named slots for complex layouts:

```astro
---
// Component.astro
---
<section>
  <header><slot name="header" /></header>
  <div class="content"><slot /></div>
  <footer><slot name="footer" /></footer>
</section>

<!-- Usage -->
<Component>
  <h2 slot="header">Title</h2>
  <p>Main content goes in default slot</p>
  <nav slot="footer">Footer nav</nav>
</Component>
```

### Section/Widget Pattern

Standard pattern for page sections:

```astro
---
interface Props {
  id?: string;
  class?: string;
  alternate?: boolean;
}

const { id, class: className, alternate = false } = Astro.props;
---

<section
  id={id}
  class:list={['section', alternate && 'section-alt', className]}
>
  <div class="container">
    <slot />
  </div>
</section>
```

---

## 2. TypeScript Conventions

### Interface vs Type

- **Interface**: Object shapes, especially when extending
- **Type**: Unions, primitives, complex types

```typescript
// Interface - object shapes
interface User {
  id: string;
  name: string;
}

// Type - unions and utilities
type Status = 'pending' | 'active' | 'closed';
type UserWithStatus = User & { status: Status };
```

### Astro Content Types

```typescript
import type { CollectionEntry } from 'astro:content';

interface Props {
  post: CollectionEntry<'blog'>;
  showExcerpt?: boolean;
}
```

### Utility Types

```typescript
// Commonly useful utility types
Partial<T>    // All properties optional
Required<T>   // All properties required
Pick<T, K>    // Select specific properties
Omit<T, K>    // Exclude properties
Record<K, V>  // Typed object
```

---

## 3. CSS & Tailwind

### @theme Block (Tailwind v4)

Define design tokens in the `@theme` block:

```css
@theme {
  /* Colors - use semantic names (GA Brand example) */
  --color-primary: oklch(0.58 0.15 160);  /* Emerald green */
  --color-text: oklch(0.15 0.02 160);     /* Green-black */

  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-8: 2rem;

  /* Typography - fluid with clamp() */
  --text-base: clamp(0.9rem, 0.85rem + 0.25vw, 1rem);
  --text-xl: clamp(1.1rem, 1rem + 0.5vw, 1.25rem);
}
```

### Complete Color Variable Reference

The template defines 43+ color-related variables for full theme control:

```
Primary (4):     --color-primary, -light, -dark, --color-secondary
Text (4):        --color-text, -secondary, -muted, -inverse
On-Color (2):    --color-on-primary, --color-on-accent
Surfaces (4):    --color-background, -surface, -surface-alt, -surface-elevated
UI (4):          --color-border, --color-focus, --color-accent, -accent-dark
Footer (5):      --color-footer-bg, -text, -text-muted, -border, -accent
Overlays (7):    --overlay-dark-light/medium/heavy, --overlay-white-light/medium/heavy/text
Shadows (4):     --shadow-sm/md/lg/xl
```

All variables have dark mode variants in `[data-theme="dark"]` block.

### Class Organization Order

1. Layout (display, position, grid/flex)
2. Sizing (width, height, margin, padding)
3. Typography (font, text, leading)
4. Visual (background, border, shadow)
5. Interactive (hover, focus, transition)

```html
<!-- Good -->
<button class="flex items-center justify-center px-4 py-2 text-sm font-medium bg-primary rounded-lg hover:bg-primary/90 transition-colors">

<!-- Avoid mixing order randomly -->
```

### Avoid @apply Abuse

Use `@apply` sparingly, only for component-level abstractions:

```css
/* Good - semantic component */
.btn-primary {
  @apply inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg;
}

/* Bad - recreating CSS */
.my-margin { @apply mt-4; }
```

### CSS Custom Properties

Use semantic naming:

```css
/* Good */
--color-text
--color-surface-elevated
--space-section-padding

/* Avoid */
--color-gray-800
--padding-16
```

### Container Queries

Use for component-level responsiveness:

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

---

## 4. Accessibility

### Focus States

Always provide visible focus indicators:

```css
:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none;
}
```

### Skip Link

Include skip-to-content link in layouts:

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
<!-- ... header ... -->
<main id="main-content">
```

### Touch Targets

Minimum 44x44px for interactive elements:

```css
.touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

### ARIA Patterns

```html
<!-- Expandable navigation -->
<button
  aria-expanded="false"
  aria-controls="menu"
  aria-label="Toggle navigation"
>

<!-- Form validation -->
<input
  aria-invalid="true"
  aria-describedby="error-msg"
/>
<span id="error-msg" role="alert">Error message</span>
```

### Screen Reader Only

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Reduced Motion

Respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. Performance

### LCP (Largest Contentful Paint)

```html
<!-- Preload critical images -->
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high" />

<!-- Priority attribute on hero images -->
<img src="/hero.webp" fetchpriority="high" loading="eager" />
```

### CLS (Cumulative Layout Shift)

```css
/* Reserve space for images */
img {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
}

/* Fixed header height */
header {
  min-height: 64px;
}
```

### INP (Interaction to Next Paint)

- Debounce rapid interactions
- Use `{ passive: true }` for scroll listeners
- Break up long tasks with `requestIdleCallback`

### Font Loading

```html
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />
```

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-var.woff2') format('woff2');
  font-display: swap;
}
```

---

## 6. File Organization

### Project Structure

```
src/
├── assets/
│   └── images/           # Images for Astro Image optimization
├── components/
│   ├── common/           # Shared (Button, Card, Icon)
│   ├── layout/           # Layout (Header, Footer, Nav)
│   ├── sections/         # Page sections (Hero, Features)
│   └── seo/              # SEO components (Schema, Meta)
├── content/              # Content collection data
├── content.config.ts     # Collection schemas
├── layouts/              # Page layouts
├── lib/                  # Utility functions
├── pages/                # Route pages
├── styles/               # Global CSS
└── site.config.ts        # Site configuration
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `HeroSection.astro` |
| Layouts | PascalCase | `BaseLayout.astro` |
| Pages | kebab-case | `about-us.astro` |
| Utilities | camelCase | `formatPhone.ts` |
| CSS files | kebab-case | `global.css` |
| Config files | kebab-case | `site.config.ts` |

### Import Aliases

Use path aliases for cleaner imports:

```typescript
// tsconfig.json
{
  "paths": {
    "@components/*": ["src/components/*"],
    "@layouts/*": ["src/layouts/*"],
    "@assets/*": ["src/assets/*"],
    "@lib/*": ["src/lib/*"],
    "@content/*": ["src/content/*"],
    "@/*": ["src/*"]
  }
}
```

```astro
import Button from '@components/common/Button.astro';
import { cn } from '@lib/utils';
```

---

## Quick Reference

### Do

- Use TypeScript interfaces for props
- Use CSS custom properties for theming
- Use clamp() for fluid typography
- Provide focus-visible styles
- Include skip-to-content link
- Reserve space for images (aspect-ratio)
- Use semantic color names

### Don't

- Hardcode colors in components
- Skip focus states
- Use @apply for simple utilities
- Forget mobile testing
- Ignore reduced-motion preferences
- Create components without props interface

---

*Style Guide Version: 1.0*
*Created: January 2026*
*Based on: Phase 5 Research Findings*
