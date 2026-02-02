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

---

## Document Overview

### Phase 1 Documents

| Document | Checks | Purpose |
|----------|--------|---------|
| `AUDIT_v2_1_CODE.md` | Code quality | TypeScript compiles, no security issues, deps clean |
| `AUDIT_v2_2_STRUCTURE.md` | Architecture | File structure, **image migration**, component organization, no dead code |
| `AUDIT_v2_3_CONTENT.md` | Content | No Lorem ipsum, SEO complete, accessibility |
| `AUDIT_v2_4_THEME_PREP.md` | Theme-ready | All colors use CSS vars, no hardcoded values |

### Phase 2 Documents

| Document | Purpose |
|----------|---------|
| `AUDIT_v2_5_THEME_APPLY.md` | Apply a theme from standards doc, create branch |

### Standards Documents (Theme Definitions)

| Document | Theme |
|----------|-------|
| `GA_TEMPLATE_STANDARDS.md` | Emerald + Gold (#02a26a, #ffdd6a) |
| `AUTUMN_TEMPLATE_STANDARDS.md` | Forest + Burnt Orange (#183321, #a02d00) |
| `[NEW]_TEMPLATE_STANDARDS.md` | Create your own! |

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
```

### Creating a New Theme

1. Copy `GA_TEMPLATE_STANDARDS.md` to `[NEWTHEME]_TEMPLATE_STANDARDS.md`
2. Update colors, fonts, cosmetics
3. Follow `AUDIT_v2_5_THEME_APPLY.md` to apply

---

## Quick Reference

### CSS Variable Pattern (Theme-Ready)

```css
/* themes.css - Define variables */
:root[data-theme="theme-light"] {
  --color-primary: R G B;
  --color-accent: R G B;
  /* ... */
}

/* Components - Use variables */
.element {
  background: rgb(var(--color-primary));
  color: rgb(var(--color-text-primary));
}
```

### Tailwind Integration

```javascript
// tailwind.config.mjs
const cssVar = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

colors: {
  primary: cssVar('primary'),
  accent: cssVar('accent'),
  // ...
}
```

### What Goes Where

| In Audit Docs | In Standards Docs |
|---------------|-------------------|
| File structure | Color values (hex, RGB) |
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

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.1 | 2026-01-30 | Added [AUDIT_v2_ADDENDUM_2026.md](./AUDIT_v2_ADDENDUM_2026.md) - Astro 5.x, Tailwind v4, new image workflow |
| 2.0 | 2024-12-23 | New modular system separating base cleanup from theming |

---

## Important Update (January 2026)

See **[AUDIT_v2_ADDENDUM_2026.md](./AUDIT_v2_ADDENDUM_2026.md)** for critical updates:

- Image system overhaul (no runtime fetching)
- Tailwind v4 via `@tailwindcss/vite`
- Content collections in `src/content.config.ts`
- Header stability patterns
- New reference template: [astro-local-business-v2](https://github.com/hoyere/astro-local-business-v2)

---

*Template Audit System v2.1*
