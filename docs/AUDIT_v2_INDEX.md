# Template Audit System v2

> Modular audit system for creating theme-agnostic base templates
> Then applying themes from Standards documents

---

## Philosophy

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLEAN BASE TEMPLATE                          │
│  (Code quality, content, structure - NO theme-specific colors)  │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │  GA Theme   │     │Autumn Theme │     │ New Theme   │
   │   Branch    │     │   Branch    │     │   Branch    │
   └─────────────┘     └─────────────┘     └─────────────┘
```

**Separation of Concerns:**
- **Audit Docs** = Code, content, structure (theme-agnostic)
- **Standards Docs** = Colors, fonts, cosmetics (theme-specific)

---

## Audit Sequence

### Phase 1: Base Cleanup (Theme-Agnostic)

| Step | Audit | Focus |
|------|-------|-------|
| 1 | `AUDIT_v2_1_CODE.md` | TypeScript, security, dependencies, build |
| 2 | `AUDIT_v2_2_STRUCTURE.md` | File organization, **image system**, components, dead code |
| 3 | `AUDIT_v2_3_CONTENT.md` | Placeholder text, SEO, accessibility |
| 4 | `AUDIT_v2_4_THEME_PREP.md` | CSS variables, no hardcoded colors, theme-ready |

### Phase 2: Theme Application

| Step | Document | Focus |
|------|----------|-------|
| 5 | `AUDIT_v2_5_THEME_APPLY.md` | Apply specific theme from `*_TEMPLATE_STANDARDS.md` |

### Phase 3: Repo & Deploy

| Step | Document | Focus |
|------|----------|-------|
| 6 | `AUDIT_v2_6_DEPLOY.md` | GitHub repo setup, Netlify provisioning, DNS, deploy hooks |

---

## Document Overview

### Phase 1 Documents

| Document | Checks | Purpose |
|----------|--------|---------|
| `AUDIT_v2_1_CODE.md` | 48 | TypeScript compiles, no security issues, deps clean |
| `AUDIT_v2_2_STRUCTURE.md` | 116 | File structure, **image system (Astro 5.x native)**, components, dead code |
| `AUDIT_v2_3_CONTENT.md` | 87 | No Lorem ipsum, SEO complete, accessibility |
| `AUDIT_v2_4_THEME_PREP.md` | 82 | All colors use CSS vars (`@theme` + `oklch()`), no hardcoded values |

### Phase 2 Documents

| Document | Purpose |
|----------|---------|
| `AUDIT_v2_5_THEME_APPLY.md` | Apply a theme from standards doc, create branch |

### Phase 3 Documents

| Document | Checks | Purpose |
|----------|--------|---------|
| `AUDIT_v2_6_DEPLOY.md` | 34 | GitHub repo, Netlify site, DNS, deploy configuration |

### Standards Documents (Theme Definitions)

| Document | Theme |
|----------|-------|
| `GA_TEMPLATE_STANDARDS.md` | Emerald + Gold (#02a26a, #ffdd6a) |
| `AUTUMN_TEMPLATE_STANDARDS.md` | Forest + Burnt Orange (#183321, #a02d00) |
| `[NEW]_TEMPLATE_STANDARDS.md` | Create your own! |

### Reference Documents

| Document | Purpose |
|----------|---------|
| `GA_UNIVERSE_VOICE_GUIDE.md` | Content tone, humor style, naming conventions, copy formulas |
| `REMEDIATION_PLAYBOOK.md` | Step-by-step fix procedures (image migration, header stability, etc.) |

---

## Workflow

### Creating a New Themed Template

```bash
# 1. Start from clean base
git checkout main

# 2. Run Phase 1 audits (ensure base is clean)
# Follow AUDIT_v2_1 through AUDIT_v2_4

# 3. Create theme branch
git checkout -b theme/ga-core

# 4. Apply theme using AUDIT_v2_5_THEME_APPLY.md
# Reference: GA_TEMPLATE_STANDARDS.md

# 5. Commit themed version
git add .
git commit -m "Apply GA Core theme"

# 6. Run Phase 3 deploy audit
# Follow AUDIT_v2_6_DEPLOY.md
```

### Creating a New Theme

1. Copy `GA_TEMPLATE_STANDARDS.md` to `[NEWTHEME]_TEMPLATE_STANDARDS.md`
2. Update colors, fonts, cosmetics
3. Follow `AUDIT_v2_5_THEME_APPLY.md` to apply

---

## Quick Reference

### CSS Variable Pattern (Tailwind v4 + oklch)

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(0.55 0.2 165);
  --color-accent: oklch(0.88 0.15 85);
  /* ... */
}

/* Dark mode */
[data-theme="dark"] {
  --color-primary: oklch(0.7 0.2 165);
  /* ... */
}
```

```css
/* Components - Use variables via Tailwind classes or CSS */
.element {
  background: var(--color-primary);
  color: var(--color-text-primary);
}
```

### What Goes Where

| In Audit Docs | In Standards Docs |
|---------------|-------------------|
| File structure | Color values (hex, oklch) |
| Component patterns | Font families |
| Content guidelines | Logo specifications |
| CSS variable naming | Brand identity |
| Build requirements | Theme-specific cosmetics |

---

## Branch Strategy

```
main (or base)
├── Clean, theme-agnostic template
├── Uses placeholder/neutral CSS variables
└── All Phase 1 audits pass

theme/ga-core
├── GA Core theme applied
├── References GA_TEMPLATE_STANDARDS.md
└── Phase 2 audit complete

theme/autumn
├── Autumn theme applied
├── References AUTUMN_TEMPLATE_STANDARDS.md
└── Phase 2 audit complete

theme/[new-theme]
├── Your custom theme
├── References [NEW]_TEMPLATE_STANDARDS.md
└── Phase 2 audit complete
```

---

## Checklist

### Template: _______________
### Date: _______________

**Phase 1: Base Cleanup**
- [ ] Code Audit (v2_1) - PASS
- [ ] Structure Audit (v2_2) - PASS
- [ ] Content Audit (v2_3) - PASS
- [ ] Theme Prep Audit (v2_4) - PASS

**Phase 2: Theme Application**
- [ ] Theme Applied (v2_5) - Theme: _______________
- [ ] Branch Created: _______________

**Phase 3: Repo & Deploy**
- [ ] Deploy Audit (v2_6) - PASS

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.2 | 2026-02-08 | Merged addendum into main docs, added Phase 3 (deploy), extracted voice guide and remediation playbook, recounted all checks, updated to Tailwind v4 / Astro 5.x / oklch() throughout |
| 2.0 | 2024-12-23 | New modular system separating base cleanup from theming |

---

*Template Audit System v2.2*
