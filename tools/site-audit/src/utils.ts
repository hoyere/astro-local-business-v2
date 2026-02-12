import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// ANSI color helpers
export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Status icons
export const icons = {
  pass: `${colors.green}\u2713${colors.reset}`,
  fail: `${colors.red}\u2717${colors.reset}`,
  warn: `${colors.yellow}\u26A0${colors.reset}`,
  skip: `${colors.gray}\u2014${colors.reset}`,
};

/**
 * Run a shell command and return { stdout, stderr, exitCode }.
 * Never throws — captures failures in exitCode.
 */
export function exec(
  cmd: string,
  opts: { cwd?: string; timeoutMs?: number } = {}
): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(cmd, {
      cwd: opts.cwd,
      timeout: opts.timeoutMs ?? 120_000,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout: stdout.trim(), stderr: '', exitCode: 0 };
  } catch (err: any) {
    return {
      stdout: (err.stdout ?? '').toString().trim(),
      stderr: (err.stderr ?? '').toString().trim(),
      exitCode: err.status ?? 1,
    };
  }
}

/**
 * Recursively find files matching extensions, excluding certain directories.
 */
export function findFiles(
  dir: string,
  extensions: string[],
  excludeDirs: string[]
): string[] {
  const results: string[] = [];

  function walk(current: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) {
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).slice(1);
        if (extensions.includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return results;
}

/**
 * Grep a file for a regex pattern. Returns matching lines with line numbers.
 */
export function grepFile(
  filePath: string,
  pattern: RegExp
): Array<{ line: number; text: string }> {
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return [];
  }

  const matches: Array<{ line: number; text: string }> = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      matches.push({ line: i + 1, text: lines[i].trim() });
    }
  }

  return matches;
}

/**
 * Format milliseconds as human-readable duration.
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

/**
 * Discover pages from sitemap-index.xml, falling back to default routes.
 */
export async function discoverPages(
  baseUrl: string,
  fallbackPages: string[]
): Promise<string[]> {
  try {
    const sitemapUrl = `${baseUrl}/sitemap-index.xml`;
    const response = await fetch(sitemapUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const xml = await response.text();
    // Extract sitemap locations
    const sitemapLocs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);

    const pages: string[] = [];
    for (const loc of sitemapLocs) {
      const sitemapResponse = await fetch(loc);
      if (!sitemapResponse.ok) continue;
      const sitemapXml = await sitemapResponse.text();
      const urls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
      for (const url of urls) {
        try {
          const parsed = new URL(url);
          pages.push(parsed.pathname);
        } catch {
          // skip malformed URLs
        }
      }
    }

    return pages.length > 0 ? [...new Set(pages)] : fallbackPages;
  } catch {
    return fallbackPages;
  }
}
