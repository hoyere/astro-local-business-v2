# Common Edits Reference

> Quick reference for frequently needed template modifications

## Table of Contents

1. [Business Information](#business-information)
2. [Colors & Branding](#colors--branding)
3. [Navigation](#navigation)
4. [Sections](#sections)
5. [Content](#content)
6. [Components](#components)
7. [SEO](#seo)
8. [Forms](#forms)

---

## Business Information

### Change Business Name

**File:** `src/site.config.ts`

```typescript
export const siteConfig = {
  name: "New Business Name",  // ← Change this
  // ...
};
```

This automatically updates: header, footer, page titles, schema markup.

### Change Phone Number

**File:** `src/site.config.ts`

```typescript
contact: {
  phone: "(555) 987-6543",  // ← Change this
  // ...
},
```

### Change Address

**File:** `src/site.config.ts`

```typescript
address: {
  street: "456 Oak Avenue",
  city: "New City",
  state: "NC",
  zip: "54321",
},
```

### Change Business Hours

**File:** `src/site.config.ts`

```typescript
hours: [
  { days: "Monday - Friday", hours: "7:00 AM - 7:00 PM" },
  { days: "Saturday - Sunday", hours: "8:00 AM - 5:00 PM" },
],
```

### Change Social Media Links

**File:** `src/site.config.ts`

```typescript
social: {
  facebook: "https://facebook.com/newpage",
  instagram: "https://instagram.com/newhandle",
  twitter: "",  // Leave empty to hide
  linkedin: "https://linkedin.com/company/newcompany",
  youtube: "",
},
```

---

## Colors & Branding

### Change Primary Color

**File:** `src/styles/global.css`

```css
@theme {
  /* Change the hue (last number) for different colors */
  --color-primary: oklch(0.55 0.2 140);      /* Green */
  --color-primary-light: oklch(0.65 0.18 140);
  --color-primary-dark: oklch(0.45 0.22 140);
}
```

**Hue reference:**
- 0 = Red
- 30 = Orange
- 60 = Yellow
- 120 = Green
- 180 = Cyan
- 210 = Teal
- 240 = Blue
- 270 = Purple
- 300 = Pink

### Add Custom Logo

**File:** `src/components/layout/Header.astro`

Replace text logo with image:

```astro
---
import { Image } from 'astro:assets';
import logo from '@assets/images/brand/logo.svg';
---

<a href="/" class="header-logo">
  <Image src={logo} alt={name} width={150} height={40} />
</a>
```

### Change Fonts

**File:** `src/styles/global.css`

```css
@theme {
  --font-sans: 'Roboto', system-ui, sans-serif;
  --font-display: 'Montserrat', system-ui, sans-serif;
}
```

Add font import at top of file:

```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Roboto:wght@400;500&display=swap');
```

---

## Navigation

### Add a Nav Link

**File:** `src/site.config.ts`

```typescript
navigation: [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },  // ← Add new link
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
],
```

### Remove a Nav Link

Delete the line from the navigation array.

### Add Dropdown Menu (requires component edit)

**File:** `src/components/layout/Header.astro`

This requires modifying the Header component to support nested items.

---

## Sections

### Change Hero Variant

**File:** `src/pages/index.astro`

```astro
<Hero
  variant="overlay"  <!-- Options: simple, centered, split, overlay -->
  title="Welcome"
  image={heroImage}  <!-- Required for split/overlay -->
/>
```

### Add/Remove Homepage Sections

**File:** `src/pages/index.astro`

```astro
<BaseLayout>
  <Hero ... />
  <Services />
  <About />
  <!-- <Gallery /> -->  <!-- Comment out to hide -->
  <Testimonials />
  <FAQ items={customFAQs} />  <!-- Add with custom content -->
  <CTA />
</BaseLayout>
```

### Customize CTA Section

```astro
<CTA
  title="Ready to Transform Your Space?"
  description="Contact us today for a free estimate"
  primaryCta={{ text: "Get Free Quote", href: "/contact" }}
  secondaryCta={{ text: "Call Now", href: "tel:5551234567" }}
  variant="highlight"  <!-- Options: default, highlight -->
/>
```

### Customize FAQ Content

```astro
---
const faqs = [
  {
    question: "What areas do you serve?",
    answer: "We serve the greater metro area including..."
  },
  {
    question: "Do you offer free estimates?",
    answer: "Yes! Contact us to schedule a free consultation."
  },
];
---

<FAQ items={faqs} />
```

---

## Content

### Add a Service

**Create:** `src/content/services/new-service.md`

```markdown
---
title: New Service Name
description: Brief description for cards
features:
  - Feature 1
  - Feature 2
order: 4
featured: true
---

Full service description...
```

### Edit a Service

Edit the corresponding file in `src/content/services/`.

### Delete a Service

Delete the file from `src/content/services/`.

### Add Team Member

**Create:** `src/content/team/new-person.md`

```markdown
---
name: New Person
role: Job Title
bio: Short bio
order: 3
---
```

### Add Testimonial

**Create:** `src/content/testimonials/new-review.md`

```markdown
---
author: Customer Name
company: Their Company
rating: 5
featured: true
---

"Their testimonial quote..."
```

---

## Components

### Change Button Style

**File:** `src/styles/global.css`

```css
.btn-primary {
  background-color: var(--color-primary);
  border-radius: 9999px;  /* Make rounded */
}
```

### Change Section Padding

**File:** `src/styles/global.css`

```css
@theme {
  --section-padding-y: 6rem;  /* Default is 5rem */
}
```

### Change Container Width

**File:** `src/styles/global.css`

```css
@theme {
  --container-max: 1400px;  /* Default is 1280px */
}
```

---

## SEO

### Change Page Title

Each page can set its own title:

```astro
<BaseLayout title="Custom Page Title">
```

### Change Meta Description

```astro
<BaseLayout
  title="Page Title"
  description="Custom meta description for this specific page."
>
```

### Change OG Image

```astro
<BaseLayout ogImage="/images/custom-og-image.jpg">
```

### Update Schema Type

**File:** `src/components/seo/LocalBusinessSchema.astro`

Change the business type:

```astro
<LocalBusinessSchema type="Plumber" />
```

Options: LocalBusiness, Plumber, Electrician, HomeAndConstructionBusiness, etc.

---

## Forms

### Add Form Action (Netlify)

**File:** `src/components/sections/Contact.astro`

```html
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact" />
  <!-- rest of form -->
</form>
```

### Add Form Action (Formspree)

```html
<form action="https://formspree.io/f/YOUR_ID" method="POST">
  <!-- form fields -->
</form>
```

### Add Required Field Validation

```html
<input type="email" name="email" required />
```

### Add Custom Success Message

Requires JavaScript:

```astro
<script>
  const form = document.querySelector('form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    // Handle submission
    // Show success message
  });
</script>
```

---

## Quick Fixes

### Image Not Showing

1. Check file exists in `src/assets/images/`
2. Check import path is correct
3. Check filename spelling (case-sensitive)

### Section Not Appearing

1. Make sure component is imported
2. Make sure it's included in the page markup
3. Check for any conditional rendering

### Style Not Applying

1. Check CSS specificity
2. Check for typos in class names
3. Inspect element in browser DevTools

### Build Error

1. Run `npm run build` and read error message
2. Check for TypeScript errors
3. Check for missing imports

---

## File Quick Reference

| What to Change | File |
|----------------|------|
| Business info | `src/site.config.ts` |
| Colors | `src/styles/global.css` |
| Navigation | `src/site.config.ts` |
| Homepage | `src/pages/index.astro` |
| Services | `src/content/services/*.md` |
| Team | `src/content/team/*.md` |
| Testimonials | `src/content/testimonials/*.md` |
| Header | `src/components/layout/Header.astro` |
| Footer | `src/components/layout/Footer.astro` |
| SEO | `src/layouts/BaseLayout.astro` |

---

*Last updated: January 2026*
