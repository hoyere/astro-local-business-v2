import * as path from 'path';
import * as fs from 'fs';
import type { AuditRunner, AuditConfig, RunnerResult, CheckResult } from '../types';
import { findFiles, grepFile } from '../utils';

export const contentRunner: AuditRunner = {
  name: 'Content',

  async run(config: AuditConfig, _baseUrl: string, projectRoot: string): Promise<RunnerResult> {
    const start = Date.now();
    const checks: CheckResult[] = [];
    const cc = config.content;

    const srcDir = path.join(projectRoot, 'src');
    if (!fs.existsSync(srcDir)) {
      checks.push({ name: 'Source directory', status: 'skip', message: 'src/ not found' });
      return { name: 'Content', checks, durationMs: Date.now() - start };
    }

    // 1. Placeholder text detection
    const contentFiles = findFiles(srcDir, ['astro', 'md', 'mdx', 'ts', 'tsx', 'html'], ['node_modules', 'dist', '.astro']);

    for (const patternStr of cc.placeholderPatterns) {
      const regex = new RegExp(patternStr, 'gi');
      const allMatches: string[] = [];

      for (const file of contentFiles) {
        const matches = grepFile(file, regex);
        for (const match of matches) {
          const relPath = path.relative(projectRoot, file);
          allMatches.push(`${relPath}:${match.line}: ${match.text}`);
        }
      }

      if (allMatches.length === 0) {
        checks.push({
          name: `Placeholder: "${patternStr}"`,
          status: 'pass',
          message: 'Not found',
        });
      } else {
        checks.push({
          name: `Placeholder: "${patternStr}"`,
          status: 'warn',
          message: `${allMatches.length} occurrence(s)`,
          details: allMatches.slice(0, 10),
        });
      }
    }

    // 2. Check for images missing alt text in .astro files
    const astroFiles = findFiles(srcDir, ['astro'], ['node_modules', 'dist', '.astro']);
    const imgNoAltRegex = /<(?:img|Image)\s+(?![^>]*\balt\b)[^>]*>/gi;
    const altMissing: string[] = [];

    for (const file of astroFiles) {
      const matches = grepFile(file, imgNoAltRegex);
      for (const match of matches) {
        const relPath = path.relative(projectRoot, file);
        altMissing.push(`${relPath}:${match.line}`);
      }
    }

    if (altMissing.length === 0) {
      checks.push({ name: 'Image alt attributes', status: 'pass', message: 'All images have alt text' });
    } else {
      checks.push({
        name: 'Image alt attributes',
        status: 'fail',
        message: `${altMissing.length} image(s) missing alt text`,
        details: altMissing.slice(0, 10),
      });
    }

    // 3. Heading hierarchy — check for h1 usage (should be exactly 1 per page layout)
    const h1Regex = /<h1[\s>]/gi;
    const layoutFiles = findFiles(path.join(srcDir, 'layouts'), ['astro'], ['node_modules']);
    const pageFiles = findFiles(path.join(srcDir, 'pages'), ['astro'], ['node_modules']);
    const h1Files: string[] = [];

    for (const file of [...layoutFiles, ...pageFiles]) {
      const matches = grepFile(file, h1Regex);
      if (matches.length > 0) {
        const relPath = path.relative(projectRoot, file);
        h1Files.push(`${relPath}: ${matches.length} h1 tag(s)`);
      }
    }

    if (h1Files.length > 0) {
      checks.push({
        name: 'H1 heading usage',
        status: 'pass',
        message: `Found h1 in ${h1Files.length} file(s)`,
        details: h1Files,
      });
    } else {
      checks.push({
        name: 'H1 heading usage',
        status: 'warn',
        message: 'No h1 tags found in layouts or pages',
      });
    }

    // 4. Check oversized images in public/ and src/assets/
    const publicDir = path.join(projectRoot, 'public');
    const assetsDir = path.join(projectRoot, 'src', 'assets');
    const imageFiles: string[] = [
      ...findFiles(publicDir, cc.imageExtensions, []),
      ...findFiles(assetsDir, cc.imageExtensions, []),
    ];

    const oversized: string[] = [];
    for (const file of imageFiles) {
      try {
        const stats = fs.statSync(file);
        const sizeKb = stats.size / 1024;
        if (sizeKb > cc.maxImageSizeKb) {
          const relPath = path.relative(projectRoot, file);
          oversized.push(`${relPath} (${Math.round(sizeKb)}KB)`);
        }
      } catch {
        // skip unreadable files
      }
    }

    if (oversized.length === 0) {
      checks.push({
        name: `Image file sizes (<${cc.maxImageSizeKb}KB)`,
        status: 'pass',
        message: `All ${imageFiles.length} images within limit`,
      });
    } else {
      checks.push({
        name: `Image file sizes (<${cc.maxImageSizeKb}KB)`,
        status: 'warn',
        message: `${oversized.length} oversized image(s)`,
        details: oversized.slice(0, 15),
      });
    }

    return { name: 'Content', checks, durationMs: Date.now() - start };
  },
};
