import type { AuditRunner, AuditConfig, RunnerResult, CheckResult } from '../types';
import { discoverPages } from '../utils';

export const seoRunner: AuditRunner = {
  name: 'SEO',

  async run(config: AuditConfig, baseUrl: string, _projectRoot: string): Promise<RunnerResult> {
    const start = Date.now();
    const checks: CheckResult[] = [];
    const sc = config.seo;

    let playwright: typeof import('playwright');
    try {
      playwright = require('playwright');
    } catch {
      checks.push({ name: 'Playwright', status: 'skip', message: 'playwright not installed — run npm install' });
      return { name: 'SEO', checks, durationMs: Date.now() - start };
    }

    // 1. Check required files (sitemap, robots.txt)
    for (const file of sc.requiredFiles) {
      try {
        const response = await fetch(`${baseUrl}/${file}`);
        if (response.ok) {
          checks.push({ name: `File: ${file}`, status: 'pass', message: `Found (${response.status})` });
        } else {
          checks.push({ name: `File: ${file}`, status: 'fail', message: `HTTP ${response.status}` });
        }
      } catch (err: any) {
        checks.push({ name: `File: ${file}`, status: 'fail', message: err.message });
      }
    }

    // 2. Per-page meta tag checks using Playwright
    const pages = await discoverPages(baseUrl, sc.requiredFiles.length > 0 ? ['/', '/about', '/services', '/contact'] : ['/']);
    const browser = await playwright.chromium.launch({ headless: true });

    try {
      const context = await browser.newContext();
      const page = await context.newPage();

      for (const pagePath of pages.slice(0, 20)) {
        const url = `${baseUrl}${pagePath}`;

        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        } catch {
          checks.push({ name: `SEO: ${pagePath}`, status: 'skip', message: 'Page load failed' });
          continue;
        }

        const pageLabel = pagePath === '/' ? 'Homepage' : pagePath;

        // Title tag
        const title = await page.title();
        if (!title) {
          checks.push({ name: `${pageLabel}: title`, status: 'fail', message: 'Missing title tag' });
        } else if (title.length > sc.maxTitleLength) {
          checks.push({
            name: `${pageLabel}: title`,
            status: 'warn',
            message: `Title too long (${title.length}/${sc.maxTitleLength} chars)`,
            details: [title],
          });
        } else {
          checks.push({ name: `${pageLabel}: title`, status: 'pass', message: `"${title.slice(0, 50)}"` });
        }

        // Required meta tags
        for (const metaName of sc.requiredMeta) {
          const content = await page.$eval(
            `meta[name="${metaName}"]`,
            (el: any) => el.getAttribute('content')
          ).catch(() => null);

          if (!content) {
            checks.push({ name: `${pageLabel}: meta ${metaName}`, status: 'fail', message: 'Missing' });
          } else if (metaName === 'description') {
            if (content.length < sc.minDescriptionLength) {
              checks.push({
                name: `${pageLabel}: meta ${metaName}`,
                status: 'warn',
                message: `Too short (${content.length}/${sc.minDescriptionLength} min)`,
              });
            } else if (content.length > sc.maxDescriptionLength) {
              checks.push({
                name: `${pageLabel}: meta ${metaName}`,
                status: 'warn',
                message: `Too long (${content.length}/${sc.maxDescriptionLength} max)`,
              });
            } else {
              checks.push({ name: `${pageLabel}: meta ${metaName}`, status: 'pass', message: 'Present' });
            }
          } else {
            checks.push({ name: `${pageLabel}: meta ${metaName}`, status: 'pass', message: 'Present' });
          }
        }

        // OG tags
        for (const ogProp of sc.requiredOg) {
          const content = await page.$eval(
            `meta[property="${ogProp}"]`,
            (el: any) => el.getAttribute('content')
          ).catch(() => null);

          if (!content) {
            checks.push({ name: `${pageLabel}: ${ogProp}`, status: 'fail', message: 'Missing' });
          } else {
            checks.push({ name: `${pageLabel}: ${ogProp}`, status: 'pass', message: 'Present' });
          }
        }

        // Structured data (JSON-LD)
        const schemas = await page.$$eval('script[type="application/ld+json"]', (els: any[]) =>
          els.map((el: any) => el.textContent ?? '')
        );

        for (const schemaType of sc.requiredSchema) {
          const found = schemas.some(s => s.includes(`"${schemaType}"`));
          if (found) {
            checks.push({ name: `${pageLabel}: schema ${schemaType}`, status: 'pass', message: 'Found' });
          } else {
            // Only require schema on homepage
            if (pagePath === '/') {
              checks.push({ name: `${pageLabel}: schema ${schemaType}`, status: 'fail', message: 'Not found' });
            }
          }
        }

        // Canonical URL
        const canonical = await page.$eval(
          'link[rel="canonical"]',
          (el: any) => el.getAttribute('href')
        ).catch(() => null);

        if (canonical) {
          checks.push({ name: `${pageLabel}: canonical`, status: 'pass', message: canonical });
        } else {
          checks.push({ name: `${pageLabel}: canonical`, status: 'warn', message: 'Missing canonical link' });
        }
      }
    } finally {
      await browser.close();
    }

    return { name: 'SEO', checks, durationMs: Date.now() - start };
  },
};
