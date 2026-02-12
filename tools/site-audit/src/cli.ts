#!/usr/bin/env node

import * as path from 'path';
import * as fs from 'fs';
import type { AuditRunner, AuditConfig, CliOptions, RunnerResult } from './types';
import { colors } from './utils';
import { ensureServer, stopServer } from './server-manager';
import { printRunnerResult, printSummary } from './reporters/console';

// Runners
import { codeQualityRunner } from './runners/code-quality';
import { contentRunner } from './runners/content';
import { seoRunner } from './runners/seo';
import { linksRunner } from './runners/links';
import { a11yRunner } from './runners/a11y';
import { lighthouseRunner } from './runners/lighthouse';
import { screenshotsRunner } from './runners/screenshots';

const RUNNER_MAP: Record<string, AuditRunner> = {
  'code-quality': codeQualityRunner,
  'content': contentRunner,
  'seo': seoRunner,
  'links': linksRunner,
  'a11y': a11yRunner,
  'lighthouse': lighthouseRunner,
  'screenshots': screenshotsRunner,
};

const ALL_RUNNER_ORDER = [
  'code-quality',
  'content',
  'seo',
  'links',
  'a11y',
  'lighthouse',
  'screenshots',
];

function loadConfig(configPath?: string): AuditConfig {
  const defaultPath = path.join(__dirname, '..', 'config', 'default-thresholds.json');
  const defaultConfig = JSON.parse(fs.readFileSync(defaultPath, 'utf-8'));

  if (configPath) {
    const customConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    // Shallow merge per section
    return {
      lighthouse: { ...defaultConfig.lighthouse, ...customConfig.lighthouse },
      codeQuality: { ...defaultConfig.codeQuality, ...customConfig.codeQuality },
      content: { ...defaultConfig.content, ...customConfig.content },
      links: { ...defaultConfig.links, ...customConfig.links },
      seo: { ...defaultConfig.seo, ...customConfig.seo },
      screenshots: { ...defaultConfig.screenshots, ...customConfig.screenshots },
      a11y: { ...defaultConfig.a11y, ...customConfig.a11y },
    };
  }

  return defaultConfig;
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    command: 'all',
    baseUrl: 'http://localhost:4321',
    projectRoot: path.resolve(__dirname, '..', '..', '..'),
    noServer: false,
    verbose: false,
  };

  let i = 0;

  // First non-flag arg is the command
  if (args.length > 0 && !args[0].startsWith('-')) {
    options.command = args[0];
    i = 1;
  }

  for (; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-u':
      case '--url':
        options.baseUrl = args[++i];
        break;
      case '-p':
      case '--project-root':
        options.projectRoot = path.resolve(args[++i]);
        break;
      case '-c':
      case '--config':
        options.configPath = args[++i];
        break;
      case '--no-server':
        options.noServer = true;
        break;
      case '-v':
      case '--verbose':
        options.verbose = true;
        break;
      case '-h':
      case '--help':
        printHelp();
        process.exit(0);
      default:
        console.error(`Unknown option: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
${colors.bold}site-audit${colors.reset} — Automated site audit toolkit

${colors.bold}Usage:${colors.reset}
  site-audit [command] [options]

${colors.bold}Commands:${colors.reset}
  all              Run all checks (default)
  lighthouse       Performance, a11y, best practices, SEO scores + CWV
  code-quality     tsc, astro check, build, npm audit, forbidden patterns
  a11y             axe-core WCAG 2.1 AA across all pages
  links            Crawl internal links, HEAD-check external links
  seo              Meta tags, OG, structured data, sitemap, robots.txt
  content          Placeholder detection, headings, alt text, image sizes
  screenshots      Cross-browser full-page screenshots

${colors.bold}Options:${colors.reset}
  -u, --url <url>           Base URL (default: http://localhost:4321)
  -p, --project-root <dir>  Astro project root (default: ../../)
  -c, --config <file>       Custom thresholds config
  --no-server               Don't auto-start preview server
  -v, --verbose             Show details for all checks
  -h, --help                Show this help

${colors.bold}Examples:${colors.reset}
  site-audit                      # Run all checks
  site-audit lighthouse -v        # Lighthouse with verbose output
  site-audit seo --no-server      # SEO checks, assume server is running
  site-audit a11y -u http://localhost:3000

${colors.dim}Exit code 0 = all pass, 1 = any fail.${colors.reset}
`);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const config = loadConfig(options.configPath);

  console.log(`\n${colors.bold}${colors.cyan}Site Audit Toolkit${colors.reset}`);
  console.log(`${colors.dim}URL: ${options.baseUrl}${colors.reset}`);
  console.log(`${colors.dim}Project: ${options.projectRoot}${colors.reset}`);

  // Determine which runners to execute
  let runnerKeys: string[];
  if (options.command === 'all') {
    runnerKeys = ALL_RUNNER_ORDER;
  } else if (RUNNER_MAP[options.command]) {
    runnerKeys = [options.command];
  } else {
    console.error(`\n${colors.red}Unknown command: ${options.command}${colors.reset}`);
    printHelp();
    process.exit(1);
  }

  // Filesystem-only runners don't need a server
  const filesystemOnly = ['code-quality', 'content'];
  const needsServer = runnerKeys.some(k => !filesystemOnly.includes(k));

  let serverStarted = false;
  if (needsServer && !options.noServer) {
    try {
      serverStarted = await ensureServer(options.baseUrl, options.projectRoot);
    } catch (err: any) {
      console.error(`\n${colors.red}Server error: ${err.message}${colors.reset}`);
      console.error(`${colors.dim}Try --no-server if your server is already running.${colors.reset}`);
      process.exit(1);
    }
  }

  const results: RunnerResult[] = [];

  try {
    // Run sequentially to avoid browser resource conflicts
    for (const key of runnerKeys) {
      const runner = RUNNER_MAP[key];
      console.log(`\n${colors.dim}Running ${runner.name}...${colors.reset}`);

      try {
        const result = await runner.run(config, options.baseUrl, options.projectRoot);
        results.push(result);
        printRunnerResult(result, options.verbose);
      } catch (err: any) {
        results.push({
          name: runner.name,
          checks: [{ name: runner.name, status: 'fail', message: `Runner crashed: ${err.message}` }],
          durationMs: 0,
        });
      }
    }

    printSummary(results);
  } finally {
    if (serverStarted) {
      stopServer();
    }
  }

  // Exit code based on failures
  const hasFailures = results.some(r => r.checks.some(c => c.status === 'fail'));
  process.exit(hasFailures ? 1 : 0);
}

main().catch((err) => {
  console.error(`\n${colors.red}Fatal error: ${err.message}${colors.reset}`);
  stopServer();
  process.exit(1);
});
