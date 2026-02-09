# Image Workflow Guide

> Best practices for handling images in Astro local business templates

## Overview

Images are the #1 source of issues in template projects (40%+ of fix commits). This guide establishes a reliable workflow that ensures:

- **Deterministic builds** - Same input = same output every time
- **Full optimization** - WebP conversion, responsive sizes, lazy loading
- **Proper organization** - Clear folder structure and attribution tracking
- **No runtime fetching** - All images are local files

---

## The Two-Phase Workflow

### Phase 1: Download (Development Time)

Use the **image-studio CLI** to download images during development:

```bash
# Install the CLI
npm install -g image-studio

# Download images for a project
image-studio fetch "landscaping lawn care" --count 5 --output src/assets/images/photos
```

### Phase 2: Use (Build Time)

Use **Astro's Image component** to optimize and serve images:

```astro
---
import { Image } from 'astro:assets';
import heroImage from '@assets/images/photos/hero.jpg';
---

<Image src={heroImage} alt="Description" width={1200} />
```

**Why this works:**
- Images exist as files before build starts
- Astro can analyze dimensions, generate srcset, convert to WebP
- Build is reproducible - no network requests during build
- Full TypeScript support with ImageMetadata types

---

## Directory Structure

```
src/assets/images/
├── photos/           # Stock photos and project images
│   ├── hero.jpg
│   ├── about.jpg
│   ├── service-1.jpg
│   └── gallery/
│       ├── project-1.jpg
│       └── project-2.jpg
├── brand/            # Logo and brand assets
│   ├── logo.svg
│   ├── logo-dark.svg
│   └── favicon.svg
├── icons/            # SVG icons
│   └── *.svg
└── team/             # Team member photos
    ├── person-1.jpg
    └── person-2.jpg

public/
└── placeholder.svg   # Fallback for missing images
```

---

## Using image-studio CLI

### Basic Usage

```bash
# Search and download
image-studio fetch "search query" --count 3

# Specify output directory
image-studio fetch "modern office" --output src/assets/images/photos

# Download specific size
image-studio fetch "landscape" --width 1920 --height 1080
```

### Recommended Queries by Business Type

| Business | Suggested Queries |
|----------|-------------------|
| Landscaping | "lawn care garden", "landscape design", "outdoor patio" |
| Plumbing | "plumber working", "bathroom renovation", "pipe repair" |
| HVAC | "air conditioning", "heating system", "hvac technician" |
| Electrical | "electrician working", "electrical panel", "home wiring" |
| Construction | "construction site", "home renovation", "building project" |
| Restaurant | "restaurant interior", "food plating", "chef cooking" |

### After Downloading

1. Review images for quality and relevance
2. Rename files descriptively: `hero-landscaping.jpg` not `photo-123.jpg`
3. Update `ATTRIBUTION.md` with credits
4. Commit images to git

---

## Using Images in Components

### Method 1: Direct Import (Recommended for known images)

```astro
---
import { Image } from 'astro:assets';
import heroImage from '@assets/images/photos/hero.jpg';
---

<Image
  src={heroImage}
  alt="Professional landscaping services"
  width={1920}
  height={1080}
  format="webp"
  quality={80}
  loading="eager"  <!-- Use "eager" for above-fold images -->
/>
```

### Method 2: Image Utilities (For dynamic paths)

```astro
---
import { Image } from 'astro:assets';
import { getImage, getImages } from '@lib/images';

// Get single image
const aboutImage = getImage('photos/about.jpg');

// Get all images from folder
const galleryImages = getImages('photos/gallery');
---

{aboutImage && (
  <Image src={aboutImage} alt="About us" width={800} />
)}

{galleryImages.map((img, i) => (
  <Image src={img} alt={`Gallery image ${i + 1}`} width={400} />
))}
```

### Method 3: OptimizedImage Component (With fallback)

```astro
---
import OptimizedImage from '@components/common/OptimizedImage.astro';
---

<!-- Falls back to placeholder if image not found -->
<OptimizedImage
  src="photos/hero.jpg"
  alt="Hero image"
  width={1200}
  aspectRatio="16:9"
/>
```

---

## Image Optimization Settings

### Recommended Settings by Use Case

| Use Case | Width | Format | Quality | Loading |
|----------|-------|--------|---------|---------|
| Hero background | 1920 | webp | 80 | eager |
| Content image | 800-1200 | webp | 80 | lazy |
| Thumbnail | 400 | webp | 75 | lazy |
| Team photo | 400 | webp | 85 | lazy |
| Gallery image | 600-800 | webp | 80 | lazy |

### Responsive Images

```astro
<Image
  src={heroImage}
  alt="Hero"
  widths={[400, 800, 1200, 1920]}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
/>
```

---

## Content Collection Images

### In Frontmatter

```yaml
---
title: Service Name
image: ../../assets/images/photos/service-1.jpg
---
```

### Schema Definition

```typescript
// src/content.config.ts
const services = defineCollection({
  schema: ({ image }) => z.object({
    title: z.string(),
    image: image().optional(),  // Validates image exists
  }),
});
```

### Using in Component

```astro
---
const { data } = Astro.props.service;
---

{data.image && (
  <Image src={data.image} alt={data.title} width={800} />
)}
```

---

## Troubleshooting

### "Image not found" Error

**Cause:** Path doesn't match actual file location

**Fix:**
1. Check exact path and filename (case-sensitive)
2. Ensure image is in `src/assets/images/` not `public/`
3. Use `getImage()` utility which handles missing images gracefully

### Build Fails with Image Error

**Cause:** Usually a path issue or missing file

**Fix:**
1. Run `ls src/assets/images/photos/` to verify files exist
2. Check import path matches exactly
3. Ensure no typos in filenames

### Images Not Optimizing

**Cause:** Image might be in `public/` folder

**Fix:** Move to `src/assets/images/` - only images in `src/` are processed by Astro

### Large Build Size

**Cause:** Too many large images or wrong format

**Fix:**
1. Resize source images before adding (max 2000px wide)
2. Use `format="webp"` and `quality={80}`
3. Remove unused images

---

## Anti-Patterns to Avoid

### ❌ Don't: Fetch images at runtime

```astro
<!-- BAD: Fetches during build, non-deterministic -->
<UnsplashImage query="landscaping" />
```

### ❌ Don't: Use external URLs directly

```astro
<!-- BAD: No optimization, external dependency -->
<img src="https://images.unsplash.com/photo-123" />
```

### ❌ Don't: Put optimizable images in public/

```
public/
└── hero.jpg  <!-- BAD: Won't be optimized -->
```

### ✅ Do: Download first, then use locally

```bash
# Download during development
image-studio fetch "landscaping" --output src/assets/images/photos
```

```astro
---
import { Image } from 'astro:assets';
import landscaping from '@assets/images/photos/landscaping.jpg';
---
<Image src={landscaping} alt="Professional landscaping" />
```

---

## Attribution Tracking

Always update `ATTRIBUTION.md` when adding images:

```markdown
| Image | Source | Photographer | License |
|-------|--------|--------------|---------|
| photos/hero.jpg | Unsplash | John Doe | Unsplash License |
| photos/about.jpg | Client | N/A | Client-provided |
```

---

## Quick Reference

### CLI Commands

```bash
# Download stock photos
image-studio fetch "query" --count 5 --output src/assets/images/photos

# List downloaded images
ls -la src/assets/images/photos/
```

### Import Patterns

```typescript
// Direct import
import hero from '@assets/images/photos/hero.jpg';

// Dynamic via utility
import { getImage } from '@lib/images';
const hero = getImage('photos/hero.jpg');
```

### Component Usage

```astro
<Image src={img} alt="description" width={800} format="webp" quality={80} />
```

---

*Last updated: January 2026*
