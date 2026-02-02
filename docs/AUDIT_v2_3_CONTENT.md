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

Guidelines for written content style and humor throughout GA Universe templates.

> **Reference:** `Growth_Automations_Brand_Guidelines.md` for visual/personality alignment

---

#### The GA Universe Concept

GA marketplace templates use **deadpan occupational displacement** — a humor style where Growth Automations (a systems/automation company) earnestly runs businesses in other industries. The comedy comes from applying tech/SaaS vocabulary and values to hospitality, trades, and service industries.

**The premise:** "What if a systems-obsessed automation company ran a restaurant/barber/HVAC business?"

**Why it works:**
- Templates remain fully functional and professional
- Humor creates a cohesive brand across the marketplace
- Easy for buyers to identify what's "GA flavor" vs. structural content
- Demonstrates the template without generic Lorem Ipsum

---

#### Humor Style: Deadpan Absurdism

| Trait | Description |
|-------|-------------|
| **Deadpan** | Present absurd concepts with complete sincerity |
| **Occupational displacement** | Tech/SaaS vocabulary applied to other industries |
| **Self-aware but not winking** | Committed to the bit; never breaks character |
| **Gentle, not mocking** | We're not making fun of tech culture or the industry |

**Think:** Parks & Recreation earnestness, not Silicon Valley satire.

---

#### Voice Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Business name follows "GrowthAutomations [Industry]" format | | |
| Tagline blends systems-thinking with industry | | |
| Stats use SaaS-style metrics for industry context | | |
| Fictional staff have punny industry-related names | | e.g., "Barley Hopper" |
| Staff bios read like LinkedIn for the industry | | |
| Testimonials praise the "systems" alongside the product | | |
| Service/product names reference process or precision | | |
| Puns/wordplay used in names, headlines, services | | |
| Menu/core offerings played straight (no jokes) | | |
| No aggressive or sarcastic humor | | |
| No dated memes or internet slang | | |
| Humor is accessible (no inside jokes) | | |
| Content easy to find-and-replace | | |

---

#### Naming Conventions

**Business Name:**
```
GrowthAutomations [Industry Term]
```
- GrowthAutomations Brewing Co.
- GrowthAutomations Barbershop
- GrowthAutomations Climate Systems (HVAC)
- GrowthAutomations Legal Group

**Tagline Formula:**
```
[Industry craft] + [systems/automation concept]
```
- "Craft beer that runs like clockwork"
- "Precision cuts. Systematic style."
- "Climate control, fully automated"

**Service/Product Names:**
Name services after the *process*, not just the outcome:
- ✅ "Systematic Pale Ale" / "Precision Porter" (beer)
- ✅ "The Calibrated Cut" / "Process Fade" (barber)
- ✅ "Scheduled Maintenance Protocol" (HVAC)
- ❌ "Dave's Famous IPA" (too generic, no GA flavor)

---

#### Wordplay & Puns

**Puns and wordplay are encouraged** throughout GA Universe content. Names, services, headlines, and descriptive copy can all use industry-related puns — as long as they remain professional and accessible.

| Where | Puns Encouraged | Examples |
|-------|-----------------|----------|
| Fictional staff names | ✅ Yes | Industry tool/term puns |
| Service/product names | ✅ Yes | Process + craft wordplay |
| Headlines & taglines | ✅ Yes | Blend systems + industry terms |
| Testimonial names | ✅ Yes | Subtle puns welcome |
| Menu item descriptions | ⚠️ Light touch | Keep functional but can be playful |
| Form labels / CTAs | ❌ No | Clarity over cleverness |

**Good puns are:**
- Groan-worthy but not cringe
- Immediately understandable (no obscure references)
- Related to the industry's tools, techniques, or terminology
- Delivered deadpan (never acknowledged as jokes)

---

#### Staff & Team Guidelines

**Eric Hoyer** — The founder. Appears in every template as Owner/Founder. Real person, genuine bio that connects GA's mission to the industry.

**Fictional Staff Names** — Use punny names based on industry tools, techniques, or terminology:

| Industry | Example Names | Pun Source |
|----------|---------------|------------|
| Brewery | Barley Hopper, Porter Stout, Amber Lager | Beer ingredients/styles |
| Barbershop | Cliff Trimmer, Harry Shears, Buzz Fademan | Cutting tools/styles |
| HVAC | Doug Ductson, Flo Ventura, Cole Compressor | Equipment/parts |
| Restaurant | Basil Sauté, Pepper Grillman, Rosemary Stockton | Ingredients/techniques |
| Plumber | Drew Pipeline, Flo Waters, Wade Copper | Pipes/water terms |
| Electrician | Watts Current, Amber Ohm, Ray Circuit | Electrical terms |

**Staff Archetypes** (adapt names per industry):
| Archetype | Role Type | Name Style |
|-----------|-----------|------------|
| Operations/Process | Manager, Director | Tool or process pun |
| Technical/Craft Expert | Head [Role], Lead | Material or technique pun |
| Customer Experience | Front of House, Client Relations | Friendly-sounding pun |
| Creative/Marketing | Events, Brand | Style or trend pun |

**Bio Formula:**
Write bios as if for a SaaS company, but for the industry role:
```
[Punny Name] brings [tech-adjacent skill] to [industry craft].
[They] developed our [systematic approach to industry task].
```

Example (Brewer — "Barley Hopper"):
> "Barley brings precision science to the art of brewing. She developed our automated fermentation monitoring system that ensures batch-to-batch consistency."

Example (Barber — "Cliff Trimmer"):
> "Cliff brings precision engineering to the art of the fade. He built our scheduling system that eliminates wait times without rushing the craft."

Example (HVAC — "Flo Ventura"):
> "Flo brings thermodynamic precision to residential comfort. She designed our dispatch optimization system for same-day response."

---

#### Copy Formulas

**Hero Stats** — Apply SaaS metrics to the industry:
| Industry | Example Stats |
|----------|---------------|
| Brewery | "99% Batch Consistency" / "24 Fermentation Sensors" |
| Barber | "12-Minute Average Wait" / "98% On-Time Appointments" |
| HVAC | "4-Hour Response Window" / "99.2% First-Visit Resolution" |
| Restaurant | "8-Minute Ticket Time" / "Zero Reservation Errors" |

**Testimonial Formula:**
Customers should praise the *systems* as much as the product:
```
"[Genuine product praise]. [Observation about how smoothly things run]."
```
- "Best IPA in Portland. And I've never waited more than 2 minutes for a pour."
- "Great haircut, but what impressed me was the zero-wait booking system."

**Section Headlines** — Blend craft language with systems language:
- ✅ "Systematically Delicious"
- ✅ "Precision Pours, Every Time"
- ✅ "Where Craft Meets Clockwork"
- ❌ "Our Awesome Menu!" (too generic)
- ❌ "Disrupting the Brewery Space" (too Silicon Valley)

---

#### What to Play Straight

Not everything should carry the humor. These elements should be **genuine and functional**:

| Play Straight | Why |
|---------------|-----|
| Menu items / service descriptions | Buyers need real examples to customize |
| Prices | Must feel realistic |
| Contact information | Functional template element |
| Legal pages | No jokes in Terms/Privacy |
| Form labels | Usability over cleverness |
| Error messages | Clarity is critical |

The humor lives in **framing** (headlines, bios, stats, testimonials), not in **utility** (forms, navigation, core content).

---

#### Alignment with Brand Guidelines

Per `Growth_Automations_Brand_Guidelines.md`, the voice must feel:

| Brand Trait | How It Applies to Voice |
|-------------|-------------------------|
| **Calm** | Never frantic, hyperbolic, or salesy |
| **Neutral** | Humor is gentle, never mocking or edgy |
| **Professional** | Copy is polished; jokes don't undermine credibility |
| **Human** | Warm, not robotic; systems serve people |
| **Durable** | No slang, memes, or trends that will date |

**Avoid** (per brand guidelines):
- ❌ Flashy or hype-driven copy ("AMAZING!" "BEST EVER!")
- ❌ Trend-chasing references (current memes, TikTok slang)
- ❌ Aggressive humor (sarcasm, snark, punching down)
- ❌ "AI magic" language ("powered by AI," "smart," "intelligent")
- ❌ Overly playful to the point of undermining professionalism

---

#### Quick Examples by Industry

**Brewery:**
- Business: "GrowthAutomations Brewing Co."
- Tagline: "Craft beer that runs like clockwork"
- Beers: "Systematic Pale Ale," "Precision Porter," "Process Pilsner"
- Staff: Barley Hopper (Head Brewer), Porter Stout (Cellar Manager)
- Bio: "Barley developed our automated fermentation monitoring system"

**Barbershop:**
- Business: "GrowthAutomations Barbershop"
- Tagline: "Precision cuts. Zero wait times."
- Services: "The Calibrated Cut," "Systematic Fade," "Precision Lineup"
- Staff: Cliff Trimmer (Master Barber), Buzz Fademan (Style Director)
- Bio: "Cliff built our scheduling system that eliminates wait times"

**HVAC:**
- Business: "GrowthAutomations Climate Systems"
- Tagline: "Comfort, fully automated"
- Services: "Preventive Maintenance Protocol," "Precision Diagnostics"
- Staff: Flo Ventura (Lead Technician), Cole Compressor (Service Manager)
- Bio: "Flo designed our dispatch optimization system for same-day response"

**Restaurant:**
- Business: "GrowthAutomations Kitchen"
- Tagline: "Where every plate runs on schedule"
- Stats: "8-minute average ticket time," "Zero reservation errors"
- Staff: Basil Sauté (Executive Chef), Pepper Grillman (Sous Chef)
- Bio: "Basil streamlined our kitchen workflow for consistent quality at scale"

**Plumber:**
- Business: "GrowthAutomations Plumbing"
- Tagline: "Flow management, fully optimized"
- Services: "Diagnostic Flush Protocol," "Precision Pipe Mapping"
- Staff: Drew Pipeline (Master Plumber), Flo Waters (Service Coordinator)
- Bio: "Drew built our leak detection system that catches problems before they start"

**Electrician:**
- Business: "GrowthAutomations Electric"
- Tagline: "Current thinking. Grounded service."
- Services: "Circuit Optimization," "Panel Upgrade Protocol"
- Staff: Watts Current (Lead Electrician), Ray Circuit (Systems Specialist)
- Bio: "Watts designed our load-balancing diagnostic that prevents overloads"

---

## 3. SEO Meta Tags

### 3.1 Base Layout Meta

```bash
cat src/layouts/Base.astro | grep -A2 "<title\|<meta"
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
| 1. No Placeholder Content | 10 | | |
| 2. Content Collections (2.1-2.3) | 10 | | |
| 2.4 Content Tone & Voice | 13 | | |
| 3. SEO Meta Tags | 9 | | |
| 4. Accessibility | 12 | | |
| 5. Images | 6 | | |
| 6. Legal Pages | 5 | | |
| 7. Navigation | 7 | | |
| 8. Forms | 7 | | |
| **TOTAL** | **79** | | |

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

### Business Information (site.ts)

All business info should be centralized in `src/data/site.ts`:

```typescript
export default {
  business: {
    name: "Business Name",           // ← MUST CUSTOMIZE
    tagline: "Your tagline here",    // ← MUST CUSTOMIZE
    logo: "~/assets/images/logos/logo.svg",
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
| Business Name | `site.ts` → `business.name` | |
| Tagline | `site.ts` → `business.tagline` | |
| Phone Number | `site.ts` → `business.contact.phone` | No 555- numbers |
| Email | `site.ts` → `business.contact.email` | No example.com |
| Address | `site.ts` → `business.location.address` | |
| Hours | `site.ts` → `business.hours` | |
| Site URL | `site.ts` → `metadata.siteUrl` | |

### Verify No Placeholder Business Info

```bash
# Find placeholder patterns in site.ts
grep -E "Business Name|Your.*here|XXX|example\.com|555-" src/data/site.ts

# Find in all content
grep -rE "Lorem|placeholder|example\.com|555-|XXX-XXXX" src/content/ src/data/
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

*Content Audit v2.3 | Phase 1, Step 3*
