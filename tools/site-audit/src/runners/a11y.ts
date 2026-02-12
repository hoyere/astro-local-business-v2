import type { AuditRunner, AuditConfig, RunnerResult, CheckResult } from '../types';
import { discoverPages } from '../utils';

export const a11yRunner: AuditRunner = {
  name: 'Accessibility',

  async run(config: AuditConfig, baseUrl: string, _projectRoot: string): Promise<RunnerResult> {
    const start = Date.now();
    const checks: CheckResult[] = [];
    const ac = config.a11y;

    let playwright: typeof import('playwright');
    let AxeBuilder: typeof import('@axe-core/playwright').default;
    try {
      playwright = require('playwright');
      AxeBuilder = require('@axe-core/playwright').default;
    } catch {
      checks.push({
        name: 'Dependencies',
        status: 'skip',
        message: 'playwright or @axe-core/playwright not installed — run npm install',
      });
      return { name: 'Accessibility', checks, durationMs: Date.now() - start };
    }

    const pages = await discoverPages(baseUrl, ac.pages);
    const browser = await playwright.chromium.launch({ headless: true });

    try {
      const context = await browser.newContext();
      const page = await context.newPage();

      for (const pagePath of pages.slice(0, 20)) {
        const url = `${baseUrl}${pagePath}`;
        const pageLabel = pagePath === '/' ? 'Homepage' : pagePath;

        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        } catch {
          checks.push({ name: `A11y: ${pageLabel}`, status: 'skip', message: 'Page load failed' });
          continue;
        }

        try {
          const results = await new AxeBuilder({ page })
            .withTags([ac.standard])
            .analyze();

          const serious = results.violations.filter(
            v => v.impact === 'serious' || v.impact === 'critical'
          );
          const moderate = results.violations.filter(
            v => v.impact === 'moderate' || v.impact === 'minor'
          );

          if (serious.length === 0 && moderate.length === 0) {
            checks.push({
              name: `A11y: ${pageLabel}`,
              status: 'pass',
              message: `${results.passes.length} rules passed, 0 violations`,
            });
          } else if (serious.length === 0) {
            const details = moderate.map(
              v => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} element(s))`
            );
            checks.push({
              name: `A11y: ${pageLabel}`,
              status: 'warn',
              message: `${moderate.length} minor/moderate violation(s)`,
              details: details.slice(0, 10),
            });
          } else {
            const details = [...serious, ...moderate].map(
              v => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} element(s))`
            );
            checks.push({
              name: `A11y: ${pageLabel}`,
              status: 'fail',
              message: `${serious.length} serious/critical, ${moderate.length} other violation(s)`,
              details: details.slice(0, 15),
            });
          }
        } catch (err: any) {
          checks.push({
            name: `A11y: ${pageLabel}`,
            status: 'skip',
            message: `axe-core error: ${err.message}`,
          });
        }
      }
    } finally {
      await browser.close();
    }

    return { name: 'Accessibility', checks, durationMs: Date.now() - start };
  },
};
