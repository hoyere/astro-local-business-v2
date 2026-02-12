import { colors, icons, formatDuration } from '../utils';
import type { CheckResult, RunnerResult, CheckStatus } from '../types';

/**
 * Print a single check result line.
 */
function printCheck(check: CheckResult, verbose: boolean): void {
  const icon = icons[check.status];
  const label = check.status.toUpperCase().padEnd(4);
  console.log(`  ${icon} ${label}  ${check.name}: ${check.message}`);

  if (verbose && check.details && check.details.length > 0) {
    for (const detail of check.details) {
      console.log(`${colors.dim}           ${detail}${colors.reset}`);
    }
  }
}

/**
 * Print a full runner's results.
 */
export function printRunnerResult(result: RunnerResult, verbose: boolean): void {
  const passed = result.checks.filter(c => c.status === 'pass').length;
  const failed = result.checks.filter(c => c.status === 'fail').length;
  const warned = result.checks.filter(c => c.status === 'warn').length;
  const skipped = result.checks.filter(c => c.status === 'skip').length;

  console.log('');
  console.log(
    `${colors.bold}${colors.cyan}── ${result.name} ──${colors.reset} ` +
    `${colors.dim}(${formatDuration(result.durationMs)})${colors.reset}`
  );

  for (const check of result.checks) {
    // In non-verbose mode, only show failures, warnings, and skips
    if (!verbose && check.status === 'pass') continue;
    printCheck(check, verbose);
  }

  // Always show summary counts
  const parts: string[] = [];
  if (passed > 0) parts.push(`${colors.green}${passed} passed${colors.reset}`);
  if (failed > 0) parts.push(`${colors.red}${failed} failed${colors.reset}`);
  if (warned > 0) parts.push(`${colors.yellow}${warned} warned${colors.reset}`);
  if (skipped > 0) parts.push(`${colors.gray}${skipped} skipped${colors.reset}`);
  console.log(`  ${colors.dim}Summary:${colors.reset} ${parts.join(', ')}`);
}

/**
 * Print the final overall summary across all runners.
 */
export function printSummary(results: RunnerResult[]): void {
  const totals: Record<CheckStatus, number> = { pass: 0, fail: 0, warn: 0, skip: 0 };

  for (const result of results) {
    for (const check of result.checks) {
      totals[check.status]++;
    }
  }

  const totalChecks = totals.pass + totals.fail + totals.warn + totals.skip;
  const totalDuration = results.reduce((sum, r) => sum + r.durationMs, 0);
  const allPassed = totals.fail === 0;

  console.log('');
  console.log(`${colors.bold}${'═'.repeat(50)}${colors.reset}`);

  if (allPassed) {
    console.log(
      `${colors.bold}${colors.green}  ALL CHECKS PASSED${colors.reset}`
    );
  } else {
    console.log(
      `${colors.bold}${colors.red}  ${totals.fail} CHECK(S) FAILED${colors.reset}`
    );
  }

  console.log(
    `  ${totalChecks} total: ` +
    `${colors.green}${totals.pass} passed${colors.reset}, ` +
    `${colors.red}${totals.fail} failed${colors.reset}, ` +
    `${colors.yellow}${totals.warn} warnings${colors.reset}, ` +
    `${colors.gray}${totals.skip} skipped${colors.reset}`
  );
  console.log(`  ${colors.dim}Total time: ${formatDuration(totalDuration)}${colors.reset}`);
  console.log(`${colors.bold}${'═'.repeat(50)}${colors.reset}`);
  console.log('');
}
