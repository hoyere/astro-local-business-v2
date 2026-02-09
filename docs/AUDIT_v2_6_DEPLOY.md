# Repo & Deploy Audit v2.6

> GitHub repository setup, Netlify provisioning, DNS, and deploy configuration
> **Phase 3** - Post-theme, pre-launch

---

## Pre-Audit

- [ ] Theme Application (v2_5) complete
- [ ] Access to GitHub org (Growth-Automations)
- [ ] Access to Netlify account
- [ ] DNS zone access (if custom domain)

> **Implementation Details:** See `SOT_REPO_AND_NETLIFY_PROVISIONING_CONVENTIONS.md` for full specs, API payloads, and source code references.

---

## 1. GitHub Repo Setup

```bash
# Verify repo settings via GitHub API or web UI
gh repo view --json name,visibility,description,licenseInfo,isTemplate
```

| Check | Status | Notes |
|-------|--------|-------|
| Repo under `Growth-Automations` org | | |
| Visibility is `private` | | |
| Initialized with README (`auto_init`) | | |
| `.gitignore` uses Node template | | |
| License is MIT | | |
| Description matches pattern (e.g., "Website built with {theme} theme") | | |

---

## 2. Branch Strategy

```bash
git branch -r
```

| Check | Status | Notes |
|-------|--------|-------|
| `main` branch exists | | Production |
| `staging` branch exists | | Development/preview |
| `staging` created from `main` HEAD | | |

---

## 3. GitHub Topics

```bash
gh repo view --json repositoryTopics
```

| Check | Status | Notes |
|-------|--------|-------|
| Has `growth-automations` topic | | Required on all repos |
| Has `ga-theme-template` topic | | Template repos only |
| Has `astro-theme` topic | | Astro-based templates |
| Has `theme-{slug}` topic | | Slug from theme name |
| Has `tid-{shortId}` topic | | First 8 chars of theme UUID |
| Topics are normalized (lowercase, no special chars) | | |

---

## 4. Netlify Site Setup

```bash
# Verify via Netlify CLI or API
netlify status
```

| Check | Status | Notes |
|-------|--------|-------|
| Site name uses `ga-theme-` prefix | | e.g., `ga-theme-flavor-starter` |
| Build command is `npm run build` | | |
| Publish directory is `dist` | | |
| Production branch is `main` | | |
| Allowed branches include `staging` | | |
| Force SSL enabled | | |

---

## 5. Deploy Configuration

```bash
# Check deploy hooks
netlify api listSiteBuildHooks --data '{"site_id": "SITE_ID"}'
```

| Check | Status | Notes |
|-------|--------|-------|
| Portal Deploy Hook exists on `main` | | Title contains "Portal" |
| No duplicate deploy hooks | | |
| Deploy key configured (private repo) | | Read-only GitHub deploy key |
| Deploy key title matches pattern | | `Netlify Deploy Key ({siteId})` |
| Netlify linked to correct GitHub repo | | |

---

## 6. Custom Domains & DNS

```bash
# Check domain configuration
netlify domains:list
```

| Check | Status | Notes |
|-------|--------|-------|
| Production domain configured | | `{site}.growthautomations.app` |
| CNAME record points to Netlify | | Target: `{site}.netlify.app` |
| TTL set to 3600 | | |
| Staging subdomain configured (if applicable) | | `staging--{site}.*` |

---

## 7. Environment Variables

```bash
# Check env var configuration
netlify env:list
```

| Check | Status | Notes |
|-------|--------|-------|
| Env vars use full scope (`builds`, `functions`, `runtime`, `post_processing`) | | |
| Context set to `all` | | |
| Required service vars configured (GitHub App, Netlify tokens) | | See SOT doc §11 |
| No secrets committed to repo | | Check `.gitignore` |

---

## 8. Pre-Launch Verification

### 8.1 Performance

Run Lighthouse on `npm run preview`:

| Metric | Target | Actual |
|--------|--------|--------|
| Performance | 90+ | |
| Accessibility | 90+ | |
| Best Practices | 90+ | |
| SEO | 90+ | |

| Core Web Vital | Target | Check |
|----------------|--------|-------|
| LCP | < 2.5s | |
| CLS | < 0.1 | |
| FID/INP | < 200ms | |

### 8.2 Cross-Browser Testing

| Browser | Works | Notes |
|---------|-------|-------|
| Chrome | | |
| Firefox | | |
| Safari | | |
| Edge | | |
| Mobile Safari | | |
| Mobile Chrome | | |

### 8.3 Final Visual & Functional Review

**Visual:**
- [ ] Homepage looks correct
- [ ] All section pages checked
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Footer looks correct
- [ ] Forms work (if any)

**Functional:**
- [ ] Navigation works
- [ ] All links work
- [ ] Contact info correct
- [ ] Social links work
- [ ] Phone numbers clickable

---

## Summary

**Template:** _______________
**Auditor:** _______________
**Date:** _______________

| Section | Checks | Passed | Failed |
|---------|--------|--------|--------|
| 1. GitHub Repo Setup | 6 | | |
| 2. Branch Strategy | 3 | | |
| 3. GitHub Topics | 6 | | |
| 4. Netlify Site Setup | 6 | | |
| 5. Deploy Configuration | 5 | | |
| 6. Custom Domains & DNS | 4 | | |
| 7. Environment Variables | 4 | | |
| 8. Pre-Launch Verification | 24 | | |
| **TOTAL** | **58** | | |

### Result

- [ ] **PASS** - Template is fully deployed and configured
- [ ] **FAIL** - Fix issues before launch

### Issues Found

**Blocking:**
1.
2.

**Non-blocking:**
1.
2.

---

*Repo & Deploy Audit v1.0 | Phase 3*
