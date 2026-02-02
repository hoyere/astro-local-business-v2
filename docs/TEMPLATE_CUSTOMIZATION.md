# Template Customization Guide

> Step-by-step guide for customizing the astro-local-business-v2 template for a new client

## Overview

This guide walks through the complete process of taking the base template and customizing it for a specific client. Follow these steps in order for best results.

---

## Phase 1: Project Setup

### 1.1 Clone the Template

```bash
# Clone the template
git clone https://github.com/hoyere/astro-local-business-v2.git client-name-site
cd client-name-site

# Remove git history and start fresh
rm -rf .git
git init
git add .
git commit -m "Initial commit from astro-local-business-v2 template"

# Create new remote (optional)
gh repo create client-name-site --private
git remote add origin https://github.com/youruser/client-name-site.git
git push -u origin main
```

### 1.2 Install Dependencies

```bash
npm install
npm run dev  # Verify it works
```

---

## Phase 2: Core Configuration

### 2.1 Update Site Configuration

Edit `src/site.config.ts`:

```typescript
export const siteConfig = {
  // Basic Info
  name: "Client Business Name",
  tagline: "Their tagline or slogan",
  description: "SEO description - 150-160 characters describing the business",
  url: "https://clientdomain.com",

  // Contact Information
  contact: {
    phone: "(555) 123-4567",
    email: "info@clientdomain.com",
    address: {
      street: "123 Main Street",
      city: "City Name",
      state: "ST",
      zip: "12345",
    },
  },

  // Social Media (leave empty string if not used)
  social: {
    facebook: "https://facebook.com/clientpage",
    instagram: "https://instagram.com/clienthandle",
    twitter: "",
    linkedin: "",
    youtube: "",
  },

  // Business Hours
  hours: [
    { days: "Monday - Friday", hours: "8:00 AM - 5:00 PM" },
    { days: "Saturday", hours: "9:00 AM - 2:00 PM" },
    { days: "Sunday", hours: "Closed" },
  ],

  // Navigation (add/remove as needed)
  navigation: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Gallery", href: "/gallery" },  // Add if using gallery
    { label: "Contact", href: "/contact" },
  ],
};
```

### 2.2 Update Astro Config

Edit `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://clientdomain.com',  // Update this!
  // ... rest stays the same
});
```

---

## Phase 3: Branding & Colors

### 3.1 Update Color Scheme

Edit `src/styles/global.css` - find the `@theme` block:

```css
@theme {
  /* Primary color - change the hue (last number) for different colors
     Hue values: 0=red, 30=orange, 60=yellow, 120=green,
                 180=cyan, 240=blue, 270=purple, 300=pink */
  --color-primary: oklch(0.55 0.2 210);      /* Example: teal */
  --color-primary-light: oklch(0.65 0.18 210);
  --color-primary-dark: oklch(0.45 0.22 210);

  /* ... */
}
```

**Common color presets:**

| Industry | Hue | Example |
|----------|-----|---------|
| Landscaping | 140 | Green |
| Plumbing | 220 | Blue |
| Electrical | 45 | Yellow/Gold |
| HVAC | 200 | Light Blue |
| Construction | 30 | Orange |
| Legal/Finance | 240 | Deep Blue |
| Healthcare | 180 | Teal |
| Restaurant | 0 | Red |

### 3.2 Add Logo

1. Get logo files from client (SVG preferred)
2. Place in `src/assets/images/brand/`:
   - `logo.svg` - Main logo
   - `logo-dark.svg` - For dark mode (optional)
   - `favicon.svg` - Square version for favicon

3. Update Header component if using image logo instead of text.

---

## Phase 4: Content

### 4.1 Services

Create/edit files in `src/content/services/`:

```markdown
---
title: Service Name
description: Brief description for cards and SEO (1-2 sentences)
icon: tool  # Optional: icon name
features:
  - Key feature or benefit 1
  - Key feature or benefit 2
  - Key feature or benefit 3
  - Key feature or benefit 4
order: 1  # Display order (lower = first)
featured: true  # Show on homepage
---

Full service description here. This appears on the individual service page.

## What We Offer

Detailed explanation of the service...

## Why Choose Us

- Benefit 1
- Benefit 2
- Benefit 3
```

### 4.2 Team Members

Create files in `src/content/team/`:

```markdown
---
name: John Smith
role: Owner / Lead Technician
bio: Brief 1-2 sentence bio for the card
social:
  email: john@clientdomain.com
  linkedin: https://linkedin.com/in/johnsmith
order: 1
---

Optional longer bio that appears on expanded view or about page.
```

### 4.3 Testimonials

Create files in `src/content/testimonials/`:

```markdown
---
author: Jane Doe
company: Doe Industries  # Optional
role: Homeowner  # Optional
rating: 5
featured: true  # Show on homepage
---

"The testimonial quote goes here. Keep it authentic and specific about what the client appreciated."
```

---

## Phase 5: Images

### 5.1 Download Stock Images

Use image-studio CLI to download relevant images:

```bash
# Install globally if not already
npm install -g image-studio

# Download images
image-studio fetch "landscaping lawn care" --count 5 --output src/assets/images/photos
image-studio fetch "team professional portrait" --count 3 --output src/assets/images/photos
image-studio fetch "garden outdoor patio" --count 4 --output src/assets/images/photos
```

### 5.2 Use Client-Provided Images

1. Optimize images before adding (max 2000px wide, compressed)
2. Place in `src/assets/images/photos/`
3. Update `ATTRIBUTION.md` with source info

### 5.3 Add Images to Components

```astro
---
import { getImage } from '@lib/images';
import Hero from '@components/sections/Hero.astro';

const heroImage = getImage('photos/hero-landscaping.jpg');
---

<Hero
  title="Professional Landscaping"
  image={heroImage}
  variant="overlay"
/>
```

---

## Phase 6: Page Customization

### 6.1 Homepage (`src/pages/index.astro`)

Adjust sections based on client needs:

```astro
---
import BaseLayout from '@layouts/BaseLayout.astro';
import Hero from '@components/sections/Hero.astro';
import Services from '@components/sections/Services.astro';
import About from '@components/sections/About.astro';
import Testimonials from '@components/sections/Testimonials.astro';
import Gallery from '@components/sections/Gallery.astro';
import CTA from '@components/sections/CTA.astro';
import FAQ from '@components/sections/FAQ.astro';
---

<BaseLayout>
  <Hero ... />
  <Services />
  <About />
  <Gallery />  <!-- Add/remove sections as needed -->
  <Testimonials />
  <FAQ items={clientFAQs} />  <!-- Customize FAQ content -->
  <CTA />
</BaseLayout>
```

### 6.2 Add/Remove Pages

**To add a page:** Create new file in `src/pages/`

**To remove a page:**
1. Delete the file
2. Remove from navigation in `site.config.ts`
3. Remove footer link if present

---

## Phase 7: Final Checks

### 7.1 Content Review

- [ ] All placeholder text replaced
- [ ] Phone numbers correct and clickable
- [ ] Email addresses correct
- [ ] Address is accurate
- [ ] Business hours are correct
- [ ] Social media links work

### 7.2 Technical Review

- [ ] `npm run build` succeeds with no errors
- [ ] No console warnings in browser
- [ ] All images load correctly
- [ ] Links work (no 404s)
- [ ] Forms submit correctly (if applicable)

### 7.3 SEO Review

- [ ] Page titles are descriptive
- [ ] Meta descriptions are set
- [ ] OG image exists
- [ ] Sitemap generates
- [ ] LocalBusiness schema has correct info

### 7.4 Performance Review

- [ ] Run Lighthouse audit
- [ ] Performance score 90+
- [ ] Accessibility score 95+
- [ ] All images optimized

---

## Common Customizations

### Add a Gallery Page

1. Create `src/pages/gallery.astro`:

```astro
---
import BaseLayout from '@layouts/BaseLayout.astro';
import Hero from '@components/sections/Hero.astro';
import Gallery from '@components/sections/Gallery.astro';
import { getImages } from '@lib/images';

const photos = getImages('photos/gallery');
const galleryImages = photos.map((src, i) => ({
  src,
  alt: `Project photo ${i + 1}`
}));
---

<BaseLayout title="Our Work">
  <Hero title="Our Work" variant="centered" />
  <Gallery images={galleryImages} columns={3} />
</BaseLayout>
```

2. Add to navigation in `site.config.ts`

### Change Footer Layout

Edit `src/components/layout/Footer.astro` to adjust columns, add/remove sections.

### Add Google Maps

In Contact section, add an iframe or use a maps component.

### Add Contact Form Backend

Options:
- Netlify Forms (add `netlify` attribute to form)
- Formspree
- Custom API endpoint

---

## Deployment

### Netlify

```bash
npm run build
# Deploy dist/ folder
```

Or connect GitHub repo for automatic deploys.

### Vercel

```bash
npx vercel
```

### Manual (any static host)

Upload contents of `dist/` folder after build.

---

*Last updated: January 2026*
