# Quick Audit - astro-local-business-v2

> Single-file audit checklist for the v2 template
> Run before shipping or after major changes

---

## Pre-Flight

```bash
cd astro-local-business-v2
npm run build   # Should complete without errors
npm run preview # Start server for testing
```

- [ ] Build completes successfully
- [ ] Preview server starts
- [ ] No console errors in browser

---

## 1. Hardcoded Colors (Must be 0)

```bash
# Run from template root - all should return 0
echo "Hex:" && grep -rE "#[0-9A-Fa-f]{6}" src/components/ --include="*.astro" | grep -v "var(--" | wc -l
echo "RGBA:" && grep -rE "rgba?\([0-9]" src/components/ --include="*.astro" | grep -v "var(--" | wc -l
echo "Tailwind grays:" && grep -rE "neutral-[0-9]|gray-[0-9]|slate-[0-9]" src/components/ --include="*.astro" | wc -l
```

| Check | Expected | Actual |
|-------|----------|--------|
| Hardcoded hex colors | 0 | |
| Hardcoded rgba values | 0 | |
| Tailwind gray classes | 0 | |

---

## 2. Theme Variables Complete

```bash
# Count variables in @theme block
grep -E "^  --color-" src/styles/global.css | wc -l
# Should be 40+
```

### Required Variables

| Category | Variables | Check |
|----------|-----------|-------|
| Primary | `--color-primary`, `-light`, `-dark` | [ ] |
| Text | `--color-text`, `-secondary`, `-muted`, `-inverse` | [ ] |
| On-color | `--color-on-primary`, `--color-on-accent` | [ ] |
| Surfaces | `--color-background`, `-surface`, `-surface-alt`, `-elevated` | [ ] |
| UI | `--color-border`, `--color-focus` | [ ] |
| Accent | `--color-accent`, `-accent-dark` | [ ] |
| Footer | `--color-footer-bg`, `-text`, `-text-muted`, `-border`, `-accent` | [ ] |
| Overlays | `--overlay-dark-*`, `--overlay-white-*` | [ ] |

### Dark Mode Variants

```bash
# Check dark mode has overrides
grep -A50 'data-theme="dark"' src/styles/global.css | grep -c "--color-"
# Should be 15+
```

- [ ] Dark mode section exists
- [ ] Key variables overridden for dark

---

## 3. Component Token Usage

Spot-check key components use theme tokens:

```bash
# Header - should use theme tokens
grep -E "var\(--color" src/components/layout/Header.astro | head -3

# Footer - should use footer tokens
grep -E "var\(--color-footer" src/components/layout/Footer.astro | head -3

# Hero - should use overlay variables
grep -E "var\(--overlay" src/components/sections/Hero.astro | head -3
```

| Component | Uses Tokens | Check |
|-----------|-------------|-------|
| Header.astro | `--color-*` | [ ] |
| Footer.astro | `--color-footer-*` | [ ] |
| Hero.astro | `--overlay-*` | [ ] |
| CTA.astro | `--color-*` or `--overlay-*` | [ ] |
| Services.astro | `--color-*` | [ ] |
| Testimonials.astro | `--color-accent` | [ ] |

---

## 4. Dark Mode Check

Open browser at `http://localhost:4321/` (or 4322)

### Toggle Test
1. Open DevTools Console
2. Run: `document.documentElement.dataset.theme = 'dark'`
3. Run: `document.documentElement.dataset.theme = 'light'`

| Check | Light | Dark |
|-------|-------|------|
| Background color changes | [ ] | [ ] |
| Text is readable | [ ] | [ ] |
| Primary color visible | [ ] | [ ] |
| Footer looks correct | [ ] | [ ] |
| No white flash on load | [ ] | [ ] |

### Persistence Test
1. Set dark mode
2. Refresh page
3. Should still be dark

- [ ] Theme persists across refresh

---

## 5. Accessibility Quick Check

### Skip Link
1. Load page
2. Press Tab once
3. "Skip to main content" should appear

- [ ] Skip link visible on focus
- [ ] Skip link works (jumps to main)

### Focus States
1. Tab through page
2. All interactive elements should have visible focus ring

- [ ] Buttons have focus ring
- [ ] Links have focus ring
- [ ] Form inputs have focus ring

### Color Contrast
Use browser DevTools or https://webaim.org/resources/contrastchecker/

| Element | Min Ratio | Check |
|---------|-----------|-------|
| Body text | 4.5:1 | [ ] |
| Muted text | 4.5:1 | [ ] |
| Links | 4.5:1 | [ ] |
| Footer text | 4.5:1 | [ ] |

---

## 6. Performance Quick Check

Run Lighthouse in Chrome DevTools:

| Metric | Target | Actual |
|--------|--------|--------|
| Performance | 90+ | |
| Accessibility | 90+ | |
| Best Practices | 90+ | |
| SEO | 90+ | |

### Core Web Vitals

| Metric | Target | Check |
|--------|--------|-------|
| LCP | < 2.5s | [ ] |
| CLS | < 0.1 | [ ] |
| FID/INP | < 200ms | [ ] |

---

## 7. Content Check

```bash
# Check for placeholder content
grep -ri "lorem ipsum" src/ --include="*.astro" --include="*.md" | wc -l
grep -ri "example.com" src/ --include="*.astro" --include="*.ts" | wc -l
grep -ri "TODO\|FIXME" src/ --include="*.astro" --include="*.ts" | wc -l
```

| Check | Expected | Actual |
|-------|----------|--------|
| Lorem ipsum | 0 | |
| example.com | 0 (except config) | |
| TODO/FIXME | 0 | |

---

## 8. SEO Check

### Meta Tags
View page source and verify:

- [ ] `<title>` is descriptive
- [ ] `<meta name="description">` present
- [ ] `<link rel="canonical">` present
- [ ] Open Graph tags present
- [ ] Twitter card tags present

### Structured Data
```bash
grep -l "LocalBusiness" src/components/seo/
```

- [ ] LocalBusinessSchema component exists
- [ ] Included in BaseLayout

---

## 9. Build Artifacts

```bash
# Check build output
ls -la dist/
ls dist/_astro/ | head -5
```

- [ ] dist/ folder created
- [ ] HTML files generated
- [ ] Assets in _astro/ folder
- [ ] sitemap.xml generated

---

## Summary

**Template:** astro-local-business-v2
**Date:** _______________
**Auditor:** _______________

| Section | Pass | Fail | Notes |
|---------|------|------|-------|
| 1. Hardcoded Colors | | | |
| 2. Theme Variables | | | |
| 3. Component Tokens | | | |
| 4. Dark Mode | | | |
| 5. Accessibility | | | |
| 6. Performance | | | |
| 7. Content | | | |
| 8. SEO | | | |
| 9. Build | | | |

### Result

- [ ] **PASS** - Ready to ship
- [ ] **FAIL** - Fix issues before shipping

### Issues Found

1.
2.
3.

---

*Quick Audit v1.0 | astro-local-business-v2*
