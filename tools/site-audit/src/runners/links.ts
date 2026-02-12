import type { AuditRunner, AuditConfig, RunnerResult, CheckResult } from '../types';
import { discoverPages } from '../utils';

interface LinkInfo {
  href: string;
  text: string;
  source: string;
}

export const linksRunner: AuditRunner = {
  name: 'Links',

  async run(config: AuditConfig, baseUrl: string, _projectRoot: string): Promise<RunnerResult> {
    const start = Date.now();
    const checks: CheckResult[] = [];
    const lc = config.links;

    let playwright: typeof import('playwright');
    try {
      playwright = require('playwright');
    } catch {
      checks.push({ name: 'Playwright', status: 'skip', message: 'playwright not installed — run npm install' });
      return { name: 'Links', checks, durationMs: Date.now() - start };
    }

    const pages = await discoverPages(baseUrl, ['/', '/about', '/services', '/contact']);
    const browser = await playwright.chromium.launch({ headless: true });
    const internalLinks = new Map<string, LinkInfo>();
    const externalLinks = new Map<string, LinkInfo>();

    try {
      const context = await browser.newContext();
      const page = await context.newPage();

      // Collect all links from all pages
      for (const pagePath of pages.slice(0, 20)) {
        const url = `${baseUrl}${pagePath}`;

        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        } catch {
          checks.push({ name: `Crawl: ${pagePath}`, status: 'skip', message: 'Page load failed' });
          continue;
        }

        const links = await page.$$eval('a[href]', (anchors: any[]) =>
          anchors.map((a: any) => ({
            href: a.getAttribute('href') ?? '',
            text: (a.textContent ?? '').trim().slice(0, 50),
          }))
        );

        for (const link of links) {
          const { href } = link;

          // Skip ignored patterns
          if (lc.ignorePatterns.some(p => href.startsWith(p))) continue;
          if (!href || href === '#') continue;

          const info: LinkInfo = { href, text: link.text, source: pagePath };

          try {
            const resolved = new URL(href, url);
            if (resolved.origin === new URL(baseUrl).origin) {
              const key = resolved.pathname;
              if (!internalLinks.has(key)) {
                internalLinks.set(key, { ...info, href: resolved.href });
              }
            } else {
              if (!externalLinks.has(resolved.href)) {
                externalLinks.set(resolved.href, info);
              }
            }
          } catch {
            // Relative links that can't be parsed — treat as internal
            if (href.startsWith('/')) {
              if (!internalLinks.has(href)) {
                internalLinks.set(href, info);
              }
            }
          }
        }
      }
    } finally {
      await browser.close();
    }

    // Check internal links
    const brokenInternal: string[] = [];
    const validInternal: string[] = [];

    for (const [pathname, info] of internalLinks) {
      try {
        const response = await fetch(`${baseUrl}${pathname}`, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(lc.timeoutMs),
        });

        if (lc.acceptableStatusCodes.includes(response.status)) {
          validInternal.push(pathname);
        } else {
          brokenInternal.push(`${pathname} → ${response.status} (from ${info.source})`);
        }
      } catch (err: any) {
        brokenInternal.push(`${pathname} → ${err.message} (from ${info.source})`);
      }
    }

    if (brokenInternal.length === 0) {
      checks.push({
        name: 'Internal links',
        status: 'pass',
        message: `All ${internalLinks.size} internal links valid`,
      });
    } else {
      checks.push({
        name: 'Internal links',
        status: 'fail',
        message: `${brokenInternal.length}/${internalLinks.size} broken`,
        details: brokenInternal.slice(0, 20),
      });
    }

    // Check external links
    if (lc.checkExternal && externalLinks.size > 0) {
      const brokenExternal: string[] = [];

      for (const [href, info] of externalLinks) {
        try {
          const response = await fetch(href, {
            method: 'HEAD',
            redirect: 'follow',
            signal: AbortSignal.timeout(lc.timeoutMs),
            headers: { 'User-Agent': 'SiteAudit/1.0 Link Checker' },
          });

          if (!lc.acceptableStatusCodes.includes(response.status)) {
            // Retry with GET — some servers reject HEAD
            const getResponse = await fetch(href, {
              method: 'GET',
              redirect: 'follow',
              signal: AbortSignal.timeout(lc.timeoutMs),
              headers: { 'User-Agent': 'SiteAudit/1.0 Link Checker' },
            });

            if (!lc.acceptableStatusCodes.includes(getResponse.status)) {
              brokenExternal.push(`${href} → ${getResponse.status} (from ${info.source})`);
            }
          }
        } catch (err: any) {
          brokenExternal.push(`${href} → ${err.message} (from ${info.source})`);
        }
      }

      if (brokenExternal.length === 0) {
        checks.push({
          name: 'External links',
          status: 'pass',
          message: `All ${externalLinks.size} external links valid`,
        });
      } else {
        checks.push({
          name: 'External links',
          status: 'warn',
          message: `${brokenExternal.length}/${externalLinks.size} unreachable`,
          details: brokenExternal.slice(0, 20),
        });
      }
    } else if (!lc.checkExternal) {
      checks.push({
        name: 'External links',
        status: 'skip',
        message: 'External link checking disabled',
      });
    } else {
      checks.push({
        name: 'External links',
        status: 'pass',
        message: 'No external links found',
      });
    }

    return { name: 'Links', checks, durationMs: Date.now() - start };
  },
};
