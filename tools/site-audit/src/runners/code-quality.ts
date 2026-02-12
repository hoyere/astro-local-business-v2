import * as path from 'path';
import type { AuditRunner, AuditConfig, RunnerResult, CheckResult } from '../types';
import { exec, findFiles, grepFile } from '../utils';

export const codeQualityRunner: AuditRunner = {
  name: 'Code Quality',

  async run(config: AuditConfig, _baseUrl: string, projectRoot: string): Promise<RunnerResult> {
    const start = Date.now();
    const checks: CheckResult[] = [];
    const cq = config.codeQuality;

    // 1. TypeScript compilation check
    const tscResult = exec('npx tsc --noEmit', { cwd: projectRoot, timeoutMs: 60_000 });
    if (tscResult.exitCode === 0) {
      checks.push({ name: 'TypeScript compilation', status: 'pass', message: 'No type errors' });
    } else {
      const errorLines = tscResult.stdout.split('\n').filter(l => l.includes('error TS'));
      checks.push({
        name: 'TypeScript compilation',
        status: 'fail',
        message: `${errorLines.length} type error(s)`,
        details: errorLines.slice(0, 10),
      });
    }

    // 2. Astro check
    const astroCheckResult = exec('npx astro check', { cwd: projectRoot, timeoutMs: 60_000 });
    if (astroCheckResult.exitCode === 0) {
      checks.push({ name: 'Astro check', status: 'pass', message: 'No issues found' });
    } else {
      const issues = astroCheckResult.stdout.split('\n').filter(l => l.trim().length > 0);
      checks.push({
        name: 'Astro check',
        status: 'fail',
        message: 'Issues found',
        details: issues.slice(0, 10),
      });
    }

    // 3. Build check
    const buildResult = exec('npm run build', { cwd: projectRoot, timeoutMs: 120_000 });
    if (buildResult.exitCode === 0) {
      checks.push({ name: 'Production build', status: 'pass', message: 'Build succeeded' });
    } else {
      checks.push({
        name: 'Production build',
        status: 'fail',
        message: 'Build failed',
        details: [buildResult.stderr.slice(0, 500)],
      });
    }

    // 4. npm audit
    const auditResult = exec('npm audit --json', { cwd: projectRoot, timeoutMs: 30_000 });
    try {
      const auditData = JSON.parse(auditResult.stdout);
      const vulns = auditData.metadata?.vulnerabilities ?? {};
      const critical = vulns.critical ?? 0;
      const high = vulns.high ?? 0;

      if (critical === 0 && high === 0) {
        checks.push({
          name: 'npm audit',
          status: 'pass',
          message: 'No critical/high vulnerabilities',
        });
      } else {
        checks.push({
          name: 'npm audit',
          status: 'fail',
          message: `${critical} critical, ${high} high vulnerabilities`,
        });
      }
    } catch {
      // npm audit may fail or have non-JSON output
      if (auditResult.exitCode === 0) {
        checks.push({ name: 'npm audit', status: 'pass', message: 'No vulnerabilities' });
      } else {
        checks.push({
          name: 'npm audit',
          status: 'warn',
          message: 'Could not parse audit results',
          details: [auditResult.stderr.slice(0, 200)],
        });
      }
    }

    // 5. Forbidden pattern grep
    const srcDir = path.join(projectRoot, 'src');
    const files = findFiles(srcDir, cq.fileExtensions, cq.excludeDirs);

    for (const patternDef of cq.forbiddenPatterns) {
      const regex = new RegExp(patternDef.pattern, 'i');
      const allMatches: string[] = [];

      for (const file of files) {
        const matches = grepFile(file, regex);
        for (const match of matches) {
          const relPath = path.relative(projectRoot, file);
          allMatches.push(`${relPath}:${match.line}: ${match.text}`);
        }
      }

      if (allMatches.length === 0) {
        checks.push({
          name: `Pattern: ${patternDef.description}`,
          status: 'pass',
          message: 'Not found',
        });
      } else {
        checks.push({
          name: `Pattern: ${patternDef.description}`,
          status: patternDef.severity,
          message: `${allMatches.length} occurrence(s)`,
          details: allMatches.slice(0, 15),
        });
      }
    }

    return { name: 'Code Quality', checks, durationMs: Date.now() - start };
  },
};
