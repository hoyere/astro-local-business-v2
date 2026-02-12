import type { AuditRunner, AuditConfig, RunnerResult, CheckResult } from '../types';

export const lighthouseRunner: AuditRunner = {
  name: 'Lighthouse',

  async run(config: AuditConfig, baseUrl: string, _projectRoot: string): Promise<RunnerResult> {
    const start = Date.now();
    const checks: CheckResult[] = [];
    const lc = config.lighthouse;

    let lighthouse: any;
    let chromeLauncher: any;
    try {
      lighthouse = require('lighthouse');
      chromeLauncher = require('chrome-launcher');
    } catch {
      checks.push({
        name: 'Dependencies',
        status: 'skip',
        message: 'lighthouse or chrome-launcher not installed — run npm install',
      });
      return { name: 'Lighthouse', checks, durationMs: Date.now() - start };
    }

    let chrome: any;
    try {
      chrome = await chromeLauncher.launch({
        chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
      });
    } catch (err: any) {
      checks.push({
        name: 'Chrome launch',
        status: 'skip',
        message: `Could not launch Chrome: ${err.message}`,
      });
      return { name: 'Lighthouse', checks, durationMs: Date.now() - start };
    }

    try {
      for (const pagePath of lc.pages) {
        const url = `${baseUrl}${pagePath}`;
        const pageLabel = pagePath === '/' ? 'Homepage' : pagePath;

        let result: any;
        try {
          result = await lighthouse(url, {
            port: chrome.port,
            output: 'json',
            logLevel: 'error',
            onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
          });
        } catch (err: any) {
          checks.push({
            name: `Lighthouse: ${pageLabel}`,
            status: 'skip',
            message: `Audit failed: ${err.message}`,
          });
          continue;
        }

        const { categories, audits } = result.lhr;

        // Category scores
        for (const [key, threshold] of Object.entries(lc.scores)) {
          const category = categories[key];
          if (!category) continue;

          const score = Math.round((category.score ?? 0) * 100);
          const target = threshold as number;

          if (score >= target) {
            checks.push({
              name: `${pageLabel}: ${category.title}`,
              status: 'pass',
              message: `${score}/100 (target: ${target})`,
            });
          } else {
            checks.push({
              name: `${pageLabel}: ${category.title}`,
              status: 'fail',
              message: `${score}/100 (target: ${target})`,
            });
          }
        }

        // Core Web Vitals
        const lcpAudit = audits['largest-contentful-paint'];
        if (lcpAudit) {
          const lcpMs = lcpAudit.numericValue ?? 0;
          checks.push({
            name: `${pageLabel}: LCP`,
            status: lcpMs <= lc.cwv.lcp ? 'pass' : 'fail',
            message: `${Math.round(lcpMs)}ms (target: <${lc.cwv.lcp}ms)`,
          });
        }

        const clsAudit = audits['cumulative-layout-shift'];
        if (clsAudit) {
          const clsValue = clsAudit.numericValue ?? 0;
          checks.push({
            name: `${pageLabel}: CLS`,
            status: clsValue <= lc.cwv.cls ? 'pass' : 'fail',
            message: `${clsValue.toFixed(3)} (target: <${lc.cwv.cls})`,
          });
        }

        // INP is field-only in Lighthouse, check TBT as proxy
        const tbtAudit = audits['total-blocking-time'];
        if (tbtAudit) {
          const tbtMs = tbtAudit.numericValue ?? 0;
          checks.push({
            name: `${pageLabel}: TBT (INP proxy)`,
            status: tbtMs <= lc.cwv.inp ? 'pass' : 'warn',
            message: `${Math.round(tbtMs)}ms (target: <${lc.cwv.inp}ms)`,
          });
        }
      }
    } finally {
      await chrome.kill();
    }

    return { name: 'Lighthouse', checks, durationMs: Date.now() - start };
  },
};
