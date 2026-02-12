# Site Audit Toolkit

Automated site audit CLI that runs Lighthouse, accessibility, SEO, link checking, content validation, code quality, and cross-browser screenshot checks against a built Astro site.

## Setup

```bash
cd tools/site-audit
npm install
npx playwright install --with-deps chromium firefox webkit
npm run build
```

## Usage

```bash
# Run all checks (auto-starts preview server)
node dist/cli.js all -v

# Run a single audit category
node dist/cli.js lighthouse
node dist/cli.js code-quality
node dist/cli.js a11y
node dist/cli.js links
node dist/cli.js seo
node dist/cli.js content
node dist/cli.js screenshots

# Options
node dist/cli.js all -u http://localhost:3000    # Custom URL
node dist/cli.js all --no-server                 # Skip auto server start
node dist/cli.js all -p /path/to/astro-project   # Custom project root
node dist/cli.js all -c custom-config.json        # Custom thresholds
node dist/cli.js all -v                           # Verbose output
```

## Commands

| Command | What it checks |
|---------|---------------|
| `all` | Run all checks (default) |
| `lighthouse` | Performance, accessibility, best practices, SEO scores + Core Web Vitals |
| `code-quality` | tsc, astro check, build, npm audit, forbidden patterns |
| `a11y` | axe-core WCAG 2.1 AA across all pages |
| `links` | Crawl internal links, HEAD-check external links |
| `seo` | Meta tags, OG tags, structured data, sitemap, robots.txt |
| `content` | Placeholder text, alt text, heading hierarchy, image sizes |
| `screenshots` | Full-page screenshots across Chrome/Firefox/WebKit x 3 viewports |

## Configuration

Default thresholds are in `config/default-thresholds.json`. Override with `-c`:

```json
{
  "lighthouse": {
    "scores": { "performance": 95 }
  }
}
```

## Exit Codes

- `0` — All checks passed
- `1` — One or more checks failed

## Check Statuses

- **PASS** — Check passed
- **FAIL** — Check failed (contributes to exit code 1)
- **WARN** — Non-blocking issue (TODOs, oversized images)
- **SKIP** — Check couldn't run (missing dependency, unreachable page)
