# Content Quality Audit v2.3

> Placeholder text, SEO, accessibility, content completeness
> **Phase 1, Step 3** - Theme-agnostic

---

## Pre-Audit

- [ ] Structure Audit (v2_2) passed
- [ ] Dev server running
- [ ] Browser DevTools ready

---

## 1. No Placeholder Content

### 1.1 Lorem Ipsum Check

```bash
grep -ri "lorem ipsum\|dolor sit\|consectetur adipiscing" src/
grep -ri "placeholder\|sample\|example text" src/content/
```

| Check | Status | Notes |
|-------|--------|-------|
| No Lorem Ipsum text | | |
| No "placeholder" text visible | | |
| No "sample" or "example" text | | |
| All content is meaningful | | |

### 1.2 Image Alt Text

```bash
grep -r 'alt=""' src/ --include="*.astro"
grep -r "alt=\"placeholder\|alt=\"image" src/ --include="*.astro"
```

| Check | Status | Notes |
|-------|--------|-------|
| No empty alt attributes | | |
| No generic "image" alt text | | |
| Alt text is descriptive | | |
| Decorative images use `alt=""` intentionally | | |

### 1.3 Contact Information

```bash
grep -r "555-\|123-4567\|example\.com\|test@\|your-" src/
```

| Check | Status | Notes |
|-------|--------|-------|
| No fake phone numbers (555-) | | |
| No example.com emails | | |
| No "your-" placeholder text | | |
| Real or realistic contact info | | |

---

## 2. Content Collections

### 2.1 Staff/Team

```bash
ls src/content/staff/
cat src/content/staff/*.json | head -50
```

| Check | Status | Notes |
|-------|--------|-------|
| Staff entries have names | | |
| Staff entries have titles | | |
| Staff entries have bios | | |
| Staff photos referenced correctly | | |

### 2.2 Menu/Services

```bash
ls src/content/menu/ 2>/dev/null || ls src/content/services/
```

| Check | Status | Notes |
|-------|--------|-------|
| Items have names | | |
| Items have descriptions | | |
| Items have prices (if applicable) | | |
| No placeholder items | | |

### 2.3 Events/Blog

```bash
ls src/content/events/ 2>/dev/null
ls src/content/blog/ 2>/dev/null
```

| Check | Status | Notes |
|-------|--------|-------|
| Entries have titles | | |
| Entries have descriptions | | |
| Dates are realistic | | |
| Content is complete | | |

### 2.4 Content Tone & Voice

> **Full guide:** See [`GA_UNIVERSE_VOICE_GUIDE.md`](./GA_UNIVERSE_VOICE_GUIDE.md) for naming conventions, humor style, copy formulas, and industry examples.

| Check | Status | Notes |
|-------|--------|-------|
| Business name follows "GrowthAutomations [Industry]" format | | |
| Content tone is deadpan professional (not sarcastic) | | |
| Fictional staff have punny industry-related names | | |
| No aggressive humor, dated memes, or internet slang | | |
| Functional content (forms, nav, legal) played straight | | |

---

## 3. SEO Meta Tags

### 3.1 Base Layout Meta

```bash
cat src/layouts/BaseLayout.astro | grep -A2 "<title\|<meta"
```

| Check | Status | Notes |
|-------|--------|-------|
| Title tag present | | |
| Meta description present | | |
| Canonical URL set | | |
| OG tags present | | |
| Twitter card tags present | | |

### 3.2 Per-Page Meta

Check each page passes title and description:

| Page | Title | Description |
|------|-------|-------------|
| Home | | |
| About | | |
| Contact | | |
| Menu/Services | | |
| 404 | | |

### 3.3 Structured Data

```bash
grep -r "application/ld+json" src/
```

| Check | Status | Notes |
|-------|--------|-------|
| LocalBusiness schema present | | |
| Schema has correct business info | | |
| No placeholder data in schema | | |

---

## 4. Accessibility

### 4.1 Semantic HTML

| Check | Status | Notes |
|-------|--------|-------|
| Uses `<header>`, `<main>`, `<footer>` | | |
| Uses `<nav>` for navigation | | |
| Uses `<section>` with headings | | |
| Uses `<article>` for standalone content | | |
| Skip link present | | `#main-content` |

### 4.2 Heading Hierarchy

```bash
grep -rE "<h[1-6]" src/pages/ --include="*.astro" | head -30
```

| Check | Status | Notes |
|-------|--------|-------|
| One `<h1>` per page | | |
| Headings in logical order | | |
| No skipped heading levels | | |

### 4.3 Form Accessibility

```bash
grep -r "<label\|aria-label\|aria-describedby" src/components/forms/
```

| Check | Status | Notes |
|-------|--------|-------|
| All inputs have labels | | |
| Required fields marked | | |
| Error messages accessible | | |
| Form has submit feedback | | |

### 4.4 Interactive Elements

| Check | Status | Notes |
|-------|--------|-------|
| All links have text or aria-label | | |
| All buttons have text or aria-label | | |
| Focus states visible | | |
| Keyboard navigation works | | |

---

## 5. Images

### 5.1 Image Optimization

```bash
find src/assets/images -type f -size +500k
du -sh src/assets/images/photos/*
```

| Check | Status | Notes |
|-------|--------|-------|
| No images over 500KB | | |
| Images use appropriate format | | |
| Responsive images used | | |
| Lazy loading implemented | | |

### 5.2 Image Attribution

```bash
cat src/assets/images/ATTRIBUTION.md
```

| Check | Status | Notes |
|-------|--------|-------|
| ATTRIBUTION.md exists | | |
| All images credited | | |
| License information included | | |
| Source links provided | | |

---

## 6. Legal Pages

### 6.1 Required Pages

```bash
ls src/pages/privacy.astro src/pages/terms.astro
```

| Check | Status | Notes |
|-------|--------|-------|
| Privacy Policy page exists | | |
| Terms of Service page exists | | |
| 404 page exists | | |
| Legal pages have content | | |

### 6.2 Footer Links

| Check | Status | Notes |
|-------|--------|-------|
| Privacy link in footer | | |
| Terms link in footer | | |
| Links work correctly | | |

---

## 7. Navigation

### 7.1 Header Navigation

| Check | Status | Notes |
|-------|--------|-------|
| Logo links to home | | |
| All nav links work | | |
| Mobile menu works | | |
| CTA button visible | | |

### 7.2 Footer Navigation

| Check | Status | Notes |
|-------|--------|-------|
| Quick links present | | |
| Contact info present | | |
| Social links work (or removed) | | |

---

## 8. Forms

### 8.1 Contact Form

| Check | Status | Notes |
|-------|--------|-------|
| All fields labeled | | |
| Validation works | | |
| Submit feedback shown | | |
| No console errors | | |

### 8.2 Newsletter (if present)

| Check | Status | Notes |
|-------|--------|-------|
| Email field validates | | |
| Submit works | | |
| Success message shown | | |

---

## Summary

**Template:** _______________
**Auditor:** _______________
**Date:** _______________

| Section | Checks | Passed | Failed |
|---------|--------|--------|--------|
| 1. No Placeholder Content | 12 | | |
| 2. Content Collections (2.1-2.3) | 12 | | |
| 2.4 Content Tone & Voice | 5 | | |
| 3. SEO Meta Tags | 13 | | |
| 4. Accessibility | 16 | | |
| 5. Images | 8 | | |
| 6. Legal Pages | 7 | | |
| 7. Navigation | 7 | | |
| 8. Forms | 7 | | |
| **TOTAL** | **87** | | |

### Result

- [ ] **PASS** - Proceed to Theme Prep Audit (v2_4)
- [ ] **FAIL** - Fix issues before proceeding

### Issues Found

**Blocking:**
1.
2.

**Non-blocking:**
1.
2.

---

## Content Guidelines

### Business Information (site.config.ts)

All business info should be centralized in `src/site.config.ts`:

```typescript
export const siteConfig = {
  business: {
    name: "Business Name",           // ← MUST CUSTOMIZE
    tagline: "Your tagline here",    // ← MUST CUSTOMIZE
    logo: "~/assets/images/brand/logo.svg",
    contact: {
      phone: {
        main: "(XXX) XXX-XXXX",      // ← MUST CUSTOMIZE
        raw: "XXXXXXXXXX"
      },
      email: "contact@domain.com",   // ← MUST CUSTOMIZE
    },
    location: {
      address: {
        street: "123 Main St",       // ← MUST CUSTOMIZE
        city: "City",
        state: "ST",
        zip: "XXXXX"
      }
    },
    hours: {
      // ← MUST CUSTOMIZE
    },
    social: {
      // ← CUSTOMIZE or remove
    }
  },
  metadata: {
    siteUrl: "https://yourdomain.com",  // ← MUST CUSTOMIZE
    // ...
  }
}
```

### Required Content Customization Checklist

| Item | Location | Placeholder Check |
|------|----------|-------------------|
| Business Name | `site.config.ts` → `business.name` | |
| Tagline | `site.config.ts` → `business.tagline` | |
| Phone Number | `site.config.ts` → `business.contact.phone` | No 555- numbers |
| Email | `site.config.ts` → `business.contact.email` | No example.com |
| Address | `site.config.ts` → `business.location.address` | |
| Hours | `site.config.ts` → `business.hours` | |
| Site URL | `site.config.ts` → `metadata.siteUrl` | |

### Verify No Placeholder Business Info

```bash
# Find placeholder patterns in site.ts
grep -E "Business Name|Your.*here|XXX|example\.com|555-" src/site.config.ts

# Find in all content
grep -rE "Lorem|placeholder|example\.com|555-|XXX-XXXX" src/content/ src/site.config.ts
```

### Content Collection Format

```json
// src/content/staff/person-name.json
{
  "name": "Full Name",
  "slug": "person-name",
  "title": "Job Title",
  "bio": "Brief biography...",
  "photo": {
    "src": "~/assets/images/photos/person.jpg",
    "alt": "Full Name, Job Title"
  }
}
```

### Menu/Services Content

```json
// src/content/menu/item-name.json
{
  "name": "Item Name",
  "slug": "item-name",
  "description": "Detailed description...",
  "price": 12.99,
  "category": "category-slug",
  "image": {
    "src": "~/assets/images/photos/item.jpg",
    "alt": "Item Name"
  }
}
```

### Events Content

```json
// src/content/events/event-name.json
{
  "title": "Event Title",
  "slug": "event-name",
  "date": "2024-12-25",
  "time": "7:00 PM",
  "description": "Event description...",
  "image": {
    "src": "~/assets/images/photos/event.jpg",
    "alt": "Event Title"
  }
}
```

---

*Content Audit v2.2 | Phase 1, Step 3*
