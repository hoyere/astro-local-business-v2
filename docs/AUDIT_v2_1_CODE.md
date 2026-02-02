# Code Quality Audit v2.1

> TypeScript, security, dependencies, and build verification
> **Phase 1, Step 1** - Theme-agnostic

---

## Pre-Audit

- [ ] Fresh clone or clean working directory
- [ ] Node.js 18+ installed
- [ ] Run `npm install`

---

## 1. TypeScript Compilation

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Or via Astro check
npx astro check
```

| Check | Status | Notes |
|-------|--------|-------|
| TypeScript compiles without errors | | |
| No `any` types (except intentional) | | |
| All imports resolve | | |
| No unused variables (warnings OK) | | |

---

## 2. Build Verification

```bash
# Clean build
rm -rf dist/ .astro/
npm run build
```

| Check | Status | Notes |
|-------|--------|-------|
| Build completes without errors | | |
| No missing file errors | | |
| All pages generated | | Count: ___ |
| Dist folder size reasonable | | Size: ___ |

---

## 3. Dependencies

### 3.1 Audit Dependencies

```bash
npm audit
npm outdated
```

| Check | Status | Notes |
|-------|--------|-------|
| No high/critical vulnerabilities | | |
| No severely outdated packages | | |
| All peer dependencies satisfied | | |

### 3.2 Required Dependencies

```bash
cat package.json | grep -E "astro|tailwindcss|typescript"
```

| Package | Required | Present | Version |
|---------|----------|---------|---------|
| astro | Yes | | |
| @astrojs/tailwind | Yes | | |
| tailwindcss | Yes | | |
| typescript | Yes | | |

### 3.3 No Unnecessary Dependencies

| Check | Status | Notes |
|-------|--------|-------|
| No unused npm packages | | |
| No dev dependencies in production | | |
| No duplicate functionality packages | | |

---

## 4. Security

### 4.1 No Exposed Secrets

```bash
# Check for potential secrets
grep -rE "(API_KEY|SECRET|PASSWORD|TOKEN).*=" src/ --include="*.ts" --include="*.astro"
grep -rE "sk-|pk_|api_key" src/
```

| Check | Status | Notes |
|-------|--------|-------|
| No hardcoded API keys | | |
| No exposed secrets in code | | |
| Environment variables used properly | | |
| No .env files committed | | Check .gitignore |

### 4.2 Safe Patterns

```bash
# Check for dangerous patterns
grep -r "dangerouslySetInnerHTML\|v-html\|set:html" src/ --include="*.astro"
grep -r "eval\|Function(" src/ --include="*.ts" --include="*.js"
```

| Check | Status | Notes |
|-------|--------|-------|
| No unsafe HTML injection | | Or properly sanitized |
| No eval() usage | | |
| No Function() constructor | | |

---

## 5. Code Quality

### 5.1 No Debug Code

```bash
grep -rE "console\.(log|debug|warn|error)" src/ --include="*.astro" --include="*.ts"
grep -r "debugger" src/
grep -r "TODO\|FIXME\|HACK" src/
```

| Check | Status | Notes |
|-------|--------|-------|
| No console.log statements | | Or intentional only |
| No debugger statements | | |
| No unresolved TODOs | | Or documented |

### 5.2 Clean Imports

```bash
# Check for problematic imports
grep -r "from '\.\./\.\./\.\./\.\." src/  # Deep relative imports
```

| Check | Status | Notes |
|-------|--------|-------|
| No excessively deep imports | | Use aliases |
| Import aliases configured | | `~/` pattern |
| No circular dependencies | | |

---

## 6. Configuration Files

### 6.1 Required Config Files

```bash
ls -la astro.config.mjs tailwind.config.mjs tsconfig.json
```

| File | Present | Valid |
|------|---------|-------|
| `astro.config.mjs` | | |
| `tailwind.config.mjs` | | |
| `tsconfig.json` | | |
| `package.json` | | |

### 6.2 Config Validation

| Check | Status | Notes |
|-------|--------|-------|
| Astro config has required integrations | | |
| Tailwind config has content paths | | |
| TypeScript strict mode enabled | | |
| Package.json has correct scripts | | |

---

## 7. Astro-Specific

### 7.1 Component Patterns

```bash
# Check for proper Astro patterns
grep -r "client:" src/components/ --include="*.astro" | head -10
```

| Check | Status | Notes |
|-------|--------|-------|
| Client directives used sparingly | | |
| No unnecessary client-side JS | | |
| Props interfaces defined | | |
| Slots used appropriately | | |

### 7.2 Content Collections

```bash
ls src/content/
cat src/content/config.ts | head -50
```

| Check | Status | Notes |
|-------|--------|-------|
| Content config exists | | |
| Schemas properly defined | | |
| Collections follow naming convention | | |

---

## Summary

**Template:** _______________
**Auditor:** _______________
**Date:** _______________

| Section | Checks | Passed | Failed |
|---------|--------|--------|--------|
| 1. TypeScript | 4 | | |
| 2. Build | 4 | | |
| 3. Dependencies | 7 | | |
| 4. Security | 6 | | |
| 5. Code Quality | 6 | | |
| 6. Configuration | 6 | | |
| 7. Astro-Specific | 6 | | |
| **TOTAL** | **39** | | |

### Result

- [ ] **PASS** - Proceed to Structure Audit (v2_2)
- [ ] **FAIL** - Fix issues before proceeding

### Issues Found

**Blocking:**
1.
2.

**Non-blocking (document and continue):**
1.
2.

---

## Quick Fix Reference

### Common TypeScript Fixes

```typescript
// Fix: Implicit any
// Before
function process(data) { }
// After
function process(data: SomeType) { }

// Fix: Missing return type
// Before
function getData() { return { name: 'test' }; }
// After
function getData(): { name: string } { return { name: 'test' }; }
```

### Common Import Fixes

```typescript
// Before (deep relative)
import { thing } from '../../../../utils/helpers';

// After (alias)
import { thing } from '~/utils/helpers';
```

---

*Code Quality Audit v2.1 | Phase 1, Step 1*
