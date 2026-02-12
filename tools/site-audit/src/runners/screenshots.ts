import * as path from 'path';
import * as fs from 'fs';
import type { AuditRunner, AuditConfig, RunnerResult, CheckResult } from '../types';

export const screenshotsRunner: AuditRunner = {
  name: 'Screenshots',

  async run(config: AuditConfig, baseUrl: string, projectRoot: string): Promise<RunnerResult> {
    const start = Date.now();
    const checks: CheckResult[] = [];
    const sc = config.screenshots;

    let playwright: typeof import('playwright');
    try {
      playwright = require('playwright');
    } catch {
      checks.push({
        name: 'Playwright',
        status: 'skip',
        message: 'playwright not installed — run npm install',
      });
      return { name: 'Screenshots', checks, durationMs: Date.now() - start };
    }

    const outputDir = path.resolve(projectRoot, 'tools', 'site-audit', sc.outputDir);
    fs.mkdirSync(outputDir, { recursive: true });

    const browserTypes: Record<string, any> = {
      chromium: playwright.chromium,
      firefox: playwright.firefox,
      webkit: playwright.webkit,
    };

    for (const browserName of sc.browsers) {
      const browserType = browserTypes[browserName];
      if (!browserType) {
        checks.push({
          name: `Browser: ${browserName}`,
          status: 'skip',
          message: 'Unknown browser type',
        });
        continue;
      }

      let browser: any;
      try {
        browser = await browserType.launch({ headless: true });
      } catch (err: any) {
        checks.push({
          name: `Browser: ${browserName}`,
          status: 'skip',
          message: `Could not launch: ${err.message}`,
        });
        continue;
      }

      try {
        for (const viewport of sc.viewports) {
          const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
          });
          const page = await context.newPage();

          for (const pagePath of sc.pages) {
            const url = `${baseUrl}${pagePath}`;
            const pageName = pagePath === '/' ? 'home' : pagePath.replace(/\//g, '-').replace(/^-/, '');
            const filename = `${browserName}-${viewport.name}-${pageName}.png`;
            const filepath = path.join(outputDir, filename);

            try {
              await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
              await page.screenshot({ path: filepath, fullPage: sc.fullPage });
              checks.push({
                name: `Screenshot: ${browserName}/${viewport.name}/${pageName}`,
                status: 'pass',
                message: filename,
              });
            } catch (err: any) {
              checks.push({
                name: `Screenshot: ${browserName}/${viewport.name}/${pageName}`,
                status: 'fail',
                message: `Failed: ${err.message}`,
              });
            }
          }

          await context.close();
        }
      } finally {
        await browser.close();
      }
    }

    const savedCount = checks.filter(c => c.status === 'pass').length;
    if (savedCount > 0) {
      checks.push({
        name: 'Screenshot output',
        status: 'pass',
        message: `${savedCount} screenshots saved to ${sc.outputDir}/`,
      });
    }

    return { name: 'Screenshots', checks, durationMs: Date.now() - start };
  },
};
