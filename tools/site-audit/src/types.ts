/** Result status for a single check */
export type CheckStatus = 'pass' | 'fail' | 'warn' | 'skip';

/** A single audit check result */
export interface CheckResult {
  name: string;
  status: CheckStatus;
  message: string;
  details?: string[];
}

/** Aggregated result from an audit runner */
export interface RunnerResult {
  name: string;
  checks: CheckResult[];
  durationMs: number;
}

/** Uniform interface every runner implements */
export interface AuditRunner {
  name: string;
  run(config: AuditConfig, baseUrl: string, projectRoot: string): Promise<RunnerResult>;
}

/** Lighthouse thresholds */
export interface LighthouseConfig {
  scores: Record<string, number>;
  cwv: {
    lcp: number;
    cls: number;
    inp: number;
  };
  pages: string[];
}

/** Code quality config */
export interface CodeQualityConfig {
  forbiddenPatterns: Array<{
    pattern: string;
    severity: 'fail' | 'warn';
    description: string;
  }>;
  fileExtensions: string[];
  excludeDirs: string[];
}

/** Content audit config */
export interface ContentConfig {
  placeholderPatterns: string[];
  maxImageSizeKb: number;
  requiredAltText: boolean;
  imageExtensions: string[];
}

/** Link checking config */
export interface LinksConfig {
  timeoutMs: number;
  checkExternal: boolean;
  ignorePatterns: string[];
  acceptableStatusCodes: number[];
}

/** SEO audit config */
export interface SeoConfig {
  requiredMeta: string[];
  requiredOg: string[];
  requiredFiles: string[];
  requiredSchema: string[];
  maxTitleLength: number;
  maxDescriptionLength: number;
  minDescriptionLength: number;
}

/** Screenshot config */
export interface ScreenshotConfig {
  viewports: Array<{
    name: string;
    width: number;
    height: number;
  }>;
  browsers: string[];
  outputDir: string;
  fullPage: boolean;
  pages: string[];
}

/** Accessibility config */
export interface A11yConfig {
  standard: string;
  pages: string[];
  impactThreshold: string;
}

/** Top-level audit config combining all runner configs */
export interface AuditConfig {
  lighthouse: LighthouseConfig;
  codeQuality: CodeQualityConfig;
  content: ContentConfig;
  links: LinksConfig;
  seo: SeoConfig;
  screenshots: ScreenshotConfig;
  a11y: A11yConfig;
}

/** CLI parsed options */
export interface CliOptions {
  command: string;
  baseUrl: string;
  projectRoot: string;
  configPath?: string;
  noServer: boolean;
  verbose: boolean;
}
