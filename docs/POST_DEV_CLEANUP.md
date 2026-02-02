# Post-Development Cleanup Checklist

> Run this checklist after development is complete, before shipping
> Catches common issues introduced during development

---

## Overview

During development, it's easy to introduce:
- Hardcoded colors for quick testing
- Placeholder content that wasn't replaced
- Console.log statements for debugging
- TODO comments that were forgotten

This checklist helps catch these before shipping.

---

## 1. Hardcoded Colors Scan

Development often introduces hardcoded colors. Scan and fix:

```bash
# From template root
cd astro-local-business-v2

# Hex colors (should be 0)
echo "=== Hex Colors ==="
grep -rE "#[0-9A-Fa-f]{6}" src/components/ src/pages/ --include="*.astro" | grep -v "var(--"

# RGBA colors (should be 0)
echo "=== RGBA Colors ==="
grep -rE "rgba?\([0-9]" src/components/ src/pages/ --include="*.astro" | grep -v "var(--"

# Tailwind gray classes (should be 0)
echo "=== Tailwind Grays ==="
grep -rE "neutral-[0-9]|gray-[0-9]|slate-[0-9]|zinc-[0-9]|stone-[0-9]" src/ --include="*.astro"
```

### Fixes

| Found | Replace With |
|-------|--------------|
| `#ffffff` | `var(--color-background)` or `white` |
| `#000000` | `var(--color-text)` |
| `rgba(0,0,0,0.5)` | `var(--overlay-dark-medium)` |
| `rgba(255,255,255,0.9)` | `var(--overlay-white-text)` |
| `gray-500` | `text-text-muted` |
| `bg-gray-100` | `bg-surface` |

- [ ] Zero hardcoded hex colors
- [ ] Zero hardcoded rgba values
- [ ] Zero Tailwind gray classes

---

## 2. Placeholder Content

```bash
# Lorem ipsum
echo "=== Lorem Ipsum ==="
grep -ri "lorem ipsum" src/ --include="*.astro" --include="*.md" --include="*.json"

# Placeholder domains
echo "=== Placeholder Domains ==="
grep -ri "example\.com\|yoursite\.com\|placeholder\|acme" src/ --include="*.astro" --include="*.ts" --include="*.json"

# Placeholder phone numbers
echo "=== Placeholder Phones ==="
grep -rE "\(555\)|\(123\)|555-555|123-456" src/ --include="*.astro" --include="*.ts" --include="*.json"

# Placeholder images
echo "=== Placeholder Images ==="
grep -ri "placeholder\|unsplash\.com" src/ --include="*.astro"
```

- [ ] No lorem ipsum
- [ ] No example.com (except in comments)
- [ ] No 555 phone numbers
- [ ] No placeholder images

---

## 3. Debug Code

```bash
# Console statements
echo "=== Console Statements ==="
grep -rE "console\.(log|warn|error|debug)" src/ --include="*.astro" --include="*.ts" --include="*.js"

# Debugger statements
echo "=== Debugger ==="
grep -r "debugger" src/ --include="*.astro" --include="*.ts" --include="*.js"

# Alert statements
echo "=== Alerts ==="
grep -r "alert(" src/ --include="*.astro" --include="*.ts" --include="*.js"
```

- [ ] No console.log (except intentional)
- [ ] No debugger statements
- [ ] No alert() calls

---

## 4. TODO/FIXME Comments

```bash
echo "=== TODO/FIXME ==="
grep -rE "TODO|FIXME|HACK|XXX|BUG" src/ --include="*.astro" --include="*.ts" --include="*.css"
```

Review each and either:
- Fix the issue
- Remove the comment
- Convert to GitHub issue

- [ ] All TODOs addressed or removed

---

## 5. Unused Files

```bash
# Find files not imported anywhere
# Components
echo "=== Potentially Unused Components ==="
for f in src/components/**/*.astro; do
  name=$(basename "$f" .astro)
  count=$(grep -r "$name" src/ --include="*.astro" --include="*.ts" | wc -l)
  if [ "$count" -lt 2 ]; then
    echo "$f (found $count times)"
  fi
done
```

- [ ] Remove unused components
- [ ] Remove unused utilities
- [ ] Remove test files

---

## 6. Image Optimization

```bash
# Large images
echo "=== Large Images (>500KB) ==="
find src/assets public -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.webp" \) -size +500k

# Missing alt text
echo "=== Images Missing Alt ==="
grep -rE '<img[^>]+(?!alt=)' src/ --include="*.astro" | grep -v "alt="
# or
grep -rE '<Image[^>]+(?!alt=)' src/ --include="*.astro" | grep -v "alt="
```

- [ ] No images over 500KB
- [ ] All images have alt text
- [ ] Decorative images have `alt=""`

---

## 7. Links Check

```bash
# Broken internal links
echo "=== Internal Links ==="
grep -rE 'href="/' src/ --include="*.astro" | grep -v "http" | head -20

# External links without rel
echo "=== External Links Missing Rel ==="
grep -rE 'target="_blank"' src/ --include="*.astro" | grep -v 'rel='
```

- [ ] Internal links point to existing pages
- [ ] External links have `rel="noopener noreferrer"`
- [ ] No broken links (test manually)

---

## 8. SEO Check

```bash
# Pages missing title
echo "=== Check BaseLayout for title ==="
grep -l "title" src/layouts/BaseLayout.astro

# Meta descriptions
echo "=== Meta Descriptions ==="
grep -r "description" src/layouts/BaseLayout.astro

# Canonical URLs
echo "=== Canonical URLs ==="
grep -r "canonical" src/layouts/BaseLayout.astro
```

- [ ] All pages have unique titles
- [ ] All pages have meta descriptions
- [ ] Canonical URLs set correctly
- [ ] OG image exists and is correct size

---

## 9. Accessibility Check

```bash
# Missing aria-labels on icon buttons
echo "=== Icon Buttons ==="
grep -rE '<button[^>]*>[^<]*<svg' src/ --include="*.astro" | grep -v "aria-label"

# Missing form labels
echo "=== Form Inputs ==="
grep -rE '<input' src/ --include="*.astro" | head -10
```

- [ ] All icon buttons have aria-label
- [ ] All form inputs have labels
- [ ] Skip link exists and works
- [ ] Focus states visible

---

## 10. Build & Performance

```bash
# Clean build
rm -rf dist/
npm run build

# Check bundle size
echo "=== Bundle Sizes ==="
ls -lh dist/_astro/*.js
ls -lh dist/_astro/*.css
```

- [ ] Build completes without warnings
- [ ] No unexpected large bundles
- [ ] Sitemap generated

### Lighthouse Audit

Run Lighthouse on `npm run preview`:

| Metric | Target | Actual |
|--------|--------|--------|
| Performance | 90+ | |
| Accessibility | 90+ | |
| Best Practices | 90+ | |
| SEO | 90+ | |

- [ ] All Lighthouse scores 90+

---

## 11. Environment & Config

```bash
# Check for exposed secrets
echo "=== Potential Secrets ==="
grep -rE "api[_-]?key|secret|password|token" src/ --include="*.ts" --include="*.astro" | grep -v "// "

# Check .gitignore
echo "=== Gitignore ==="
cat .gitignore | grep -E "\.env|node_modules|dist"
```

- [ ] No API keys in code
- [ ] .env files in .gitignore
- [ ] No sensitive data committed

---

## 12. Cross-Browser Test

Test in multiple browsers:

| Browser | Works | Notes |
|---------|-------|-------|
| Chrome | [ ] | |
| Firefox | [ ] | |
| Safari | [ ] | |
| Edge | [ ] | |
| Mobile Safari | [ ] | |
| Mobile Chrome | [ ] | |

---

## 13. Final Review

### Visual Check
- [ ] Homepage looks correct
- [ ] All section pages checked
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Footer looks correct
- [ ] Forms work (if any)

### Functional Check
- [ ] Navigation works
- [ ] All links work
- [ ] Contact info correct
- [ ] Social links work
- [ ] Phone numbers clickable

---

## Summary

**Project:** _______________
**Date:** _______________
**Reviewer:** _______________

| Section | Clean | Issues |
|---------|-------|--------|
| 1. Hardcoded Colors | [ ] | |
| 2. Placeholder Content | [ ] | |
| 3. Debug Code | [ ] | |
| 4. TODO Comments | [ ] | |
| 5. Unused Files | [ ] | |
| 6. Image Optimization | [ ] | |
| 7. Links | [ ] | |
| 8. SEO | [ ] | |
| 9. Accessibility | [ ] | |
| 10. Build & Performance | [ ] | |
| 11. Environment | [ ] | |
| 12. Cross-Browser | [ ] | |
| 13. Final Review | [ ] | |

### Issues Found

| Issue | File | Fixed |
|-------|------|-------|
| | | [ ] |
| | | [ ] |
| | | [ ] |

### Sign-Off

- [ ] All issues resolved
- [ ] Ready for deployment

---

*Post-Development Cleanup v1.0 | astro-local-business-v2*
