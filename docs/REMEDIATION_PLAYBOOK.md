# Remediation Playbook

> Step-by-step procedures for fixing common issues found during template audits

---

## Procedure A: Remove Legacy Image System

**Step 1: Delete legacy files**
```bash
# Remove legacy utilities
rm -f src/utils/unsplash.ts
rm -f src/utils/sections.ts

# Remove legacy components
rm -f src/components/ui/UnsplashImage.astro

# Remove manifest files
find src -name "manifest.*" -delete

# Remove image index files
find src -name "index.ts" -path "*/images/*" -delete

# Remove generated directory
rm -rf src/assets/images/generated/

# Remove public images
rm -rf public/images/
```

**Step 2: Create new structure**
```bash
mkdir -p src/assets/images/{icons,logos,photos,placeholders}
```

**Step 3: Create default placeholder**
```bash
cat > src/assets/images/placeholders/default.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect fill="#e5e7eb" width="400" height="300"/>
  <text x="200" y="150" text-anchor="middle" fill="#9ca3af" font-size="16">Image Placeholder</text>
</svg>
EOF
```

---

## Procedure B: Set Up Image Component (Astro 5.x)

Use Astro's native `<Image />` component with static imports. No custom `Image.astro` wrapper or `resolveImage()` utility needed.

**Step 1: Import and use images directly**

```astro
---
// In any .astro component
import { Image } from 'astro:assets';
import heroPhoto from '@assets/images/photos/hero.jpg';
import logoSvg from '@assets/images/logos/logo.svg';
---

<!-- Standard image -->
<Image src={heroPhoto} alt="Hero banner" />

<!-- With options -->
<Image src={heroPhoto} alt="Hero banner" width={1920} height={1080} loading="eager" />

<!-- SVG (use img tag directly) -->
<img src={logoSvg.src} alt="Logo" />
```

**Step 2: Use images from content collections**

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const staff = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/staff' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    title: z.string(),
    photo: image().optional(),  // Validates image exists at build time
  }),
});

export const collections = { staff };
```

```astro
---
// In a component using collection data
import { Image } from 'astro:assets';
import { getCollection } from 'astro:content';

const staff = await getCollection('staff');
---

{staff.map(({ data }) => (
  data.photo && <Image src={data.photo} alt={data.name} width={400} height={400} />
))}
```

**Step 3: Background images**

For background images, use a standard `<div>` with inline styles:

```astro
---
import heroPhoto from '@assets/images/photos/hero.jpg';
---

<div
  class="hero-bg"
  style={`background-image: url(${heroPhoto.src});`}
  role="img"
  aria-label="Hero background"
>
  <slot />
</div>
```

---

## Procedure C: Migrate Content Collection Images

**Step 1: Find all image references**
```bash
grep -rE "generatedKey|backgroundKey|query|/images/unsplash" src/content/ --include="*.json"
```

**Step 2: Update content files**

Before:
```json
{
  "image": {
    "generatedKey": "hero",
    "alt": "Hero image"
  }
}
```

After:
```json
{
  "name": "Item Name",
  "photo": "./photos/hero.jpg",
  "alt": "Hero image"
}
```

**Step 3: Update content schema**
```typescript
// src/content.config.ts
const imageSchema = ({ image }) => z.object({
  photo: image().optional(),
  alt: z.string().optional(),
});
```

---

## Procedure D: Update Component Image Usage

**Step 1: Find components using old patterns**
```bash
grep -rE "UnsplashImage|generatedKey|backgroundKey" src/components/ --include="*.astro"
```

**Step 2: Replace with Astro native Image**

Before:
```astro
<UnsplashImage query="restaurant" alt="Restaurant" />
```

After:
```astro
---
import { Image } from 'astro:assets';
import restaurantPhoto from '@assets/images/photos/restaurant.jpg';
---
<Image src={restaurantPhoto} alt="Restaurant" />
```

---

## Procedure E: Verify Migration Complete

Run these checks (all should return zero results):

```bash
# No legacy imports
grep -ri "UnsplashImage" src/ --include="*.astro"
grep -ri "from.*unsplash" src/ --include="*.astro" --include="*.ts"

# No legacy props
grep -ri "generatedKey\|backgroundKey\|fallbackQuery" src/

# No legacy paths
grep -ri "/images/unsplash\|images.unsplash.com" src/

# No legacy files
ls src/utils/unsplash.ts 2>/dev/null
ls src/components/ui/UnsplashImage.astro 2>/dev/null
ls public/images/ 2>/dev/null
find src -name "manifest.*"

# No custom image resolver (replaced by astro:assets)
ls src/utils/imageResolver.ts 2>/dev/null
ls src/components/ui/Image.astro 2>/dev/null
```

---

## Procedure F: Fix Header Font Flash / Layout Shift

**Problem:** Font loading changes text width, causing header elements to reflow and buttons to wrap.

**Step 1: Add Font Preload in `Base.astro`**

```html
<head>
  <!-- Preconnect to font origins -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <!-- Preload critical heading font -->
  <link
    rel="preload"
    href="https://fonts.gstatic.com/s/alfaslabone/v19/6NUQ8FmMKwSEKjnm5-4v-4Jh6dVretWvYmE.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  />
</head>
```

**Step 2: Add `whitespace-nowrap` in `Header.astro`**

```astro
<!-- Business name - prevent wrap -->
<span class="text-xl font-heading font-bold text-text-primary hidden lg:block whitespace-nowrap">
  {business.name}
</span>

<!-- CTA button - prevent wrap -->
<a href={ctaHref} class="hidden lg:inline-flex items-center btn btn-primary whitespace-nowrap">
  {ctaLabel}
</a>

<!-- Nav links - prevent wrap -->
<a href={item.href} class="text-text-secondary hover:text-primary whitespace-nowrap">
  {item.label}
</a>
```

**Step 3: Add `flex-shrink-0` to containers**

```astro
<!-- Logo container -->
<a href="/" class="flex items-center space-x-2 group flex-shrink-0">

<!-- CTA container -->
<div class="flex items-center space-x-4 flex-shrink-0">
```

---

## Procedure G: Fix Mobile Menu Positioning

**Problem:** Hardcoded `top-[73px]` doesn't match actual header height.

**Step 1: Use CSS variable for mobile menu**

```astro
<!-- Mobile menu uses dynamic height -->
<div
  id="mobile-menu"
  class="hidden lg:hidden fixed left-0 right-0 bg-surface shadow-lg z-40"
  style="top: var(--header-height, 73px)"
>
```

**Step 2: Add height calculation script**

```html
<script>
  function updateHeaderHeight() {
    const header = document.querySelector('header');
    if (header) {
      const height = header.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
  }

  // Update on load
  updateHeaderHeight();

  // Update on resize
  window.addEventListener('resize', updateHeaderHeight);

  // Update when fonts finish loading
  document.fonts?.ready.then(updateHeaderHeight);
</script>
```

---

*Remediation Playbook v1.0*
