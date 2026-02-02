#!/usr/bin/env node

import * as path from 'path';
import * as fs from 'fs';
import { UnsplashFetcher } from './fetcher';
import { ImageGenerator } from './generator';
import { startServer } from './server/api';
import type { FetchConfig, GenerateOptions } from './types';

// ============================================
// Environment Loading
// ============================================

function loadEnvFile(envPath: string): boolean {
  try {
    if (!fs.existsSync(envPath)) return false;

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value.trim();
          }
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}

function findAndLoadEnv(verbose: boolean = false): void {
  const currentDir = process.cwd();
  const searchPaths = [
    path.join(currentDir, '.env'),
    path.join(currentDir, '..', '.env'),
    path.join(currentDir, '..', '..', '.env'),
    path.join(currentDir, '..', '..', '..', '.env'),
  ];

  for (const envPath of searchPaths) {
    if (loadEnvFile(envPath)) {
      if (verbose) console.log(`📁 Loaded .env from: ${envPath}`);
      return;
    }
  }

  if (verbose) console.log('⚠️  No .env file found');
}

// ============================================
// CLI Commands
// ============================================

async function commandFetch(args: string[]): Promise<void> {
  const options = {
    businessType: 'all',
    outputDir: './src/assets/images/photos',
    configPath: './unsplash.config.json',
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-v': case '--verbose': options.verbose = true; break;
      case '-o': case '--output': options.outputDir = args[++i]; break;
      case '-c': case '--config': options.configPath = args[++i]; break;
      default:
        if (!arg.startsWith('-')) options.businessType = arg;
    }
  }

  findAndLoadEnv(options.verbose);

  const apiKey = process.env.PUBLIC_UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY;
  if (!apiKey) {
    console.error('❌ UNSPLASH_ACCESS_KEY required');
    process.exit(1);
  }

  console.log(`🚀 Fetching Unsplash images: ${options.businessType}`);
  fs.mkdirSync(options.outputDir, { recursive: true });

  const config: FetchConfig = loadConfig(options.configPath);
  const fetcher = new UnsplashFetcher(apiKey, options.outputDir, { verbose: options.verbose });

  const queriesToFetch = options.businessType === 'all'
    ? flattenQueries(config.queries)
    : buildQueries(config.queries, options.businessType);

  const result = await fetcher.fetchBatch(queriesToFetch);
  console.log(`✅ Done! Downloaded: ${result.downloaded}, Skipped: ${result.skipped}`);
}

async function commandGenerate(args: string[]): Promise<void> {
  const options: GenerateOptions & { verbose: boolean; outputDir: string; saveAs?: string } = {
    prompt: '',
    model: 'dall-e-3',
    size: '1024x1024',
    style: 'natural',
    quality: 'standard',
    verbose: false,
    outputDir: './src/assets/images/photos'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-v': case '--verbose': options.verbose = true; break;
      case '-o': case '--output': options.outputDir = args[++i]; break;
      case '-m': case '--model': options.model = args[++i] as GenerateOptions['model']; break;
      case '-s': case '--size': options.size = args[++i] as GenerateOptions['size']; break;
      case '--style': options.style = args[++i] as GenerateOptions['style']; break;
      case '-q': case '--quality': options.quality = args[++i] as GenerateOptions['quality']; break;
      case '--save-as': options.saveAs = args[++i]; break;
      default:
        if (!arg.startsWith('-')) {
          options.prompt = options.prompt ? `${options.prompt} ${arg}` : arg;
        }
    }
  }

  if (!options.prompt) {
    console.error('❌ Prompt is required. Usage: image-studio generate "your prompt here"');
    process.exit(1);
  }

  findAndLoadEnv(options.verbose);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY required');
    process.exit(1);
  }

  console.log(`🎨 Generating image with ${options.model}...`);
  fs.mkdirSync(options.outputDir, { recursive: true });

  const generator = new ImageGenerator(apiKey, {
    outputDir: options.outputDir,
    verbose: options.verbose
  });

  const result = await generator.generate(options);
  console.log(`✅ Generated: ${result.localPath}`);
  if (result.revisedPrompt) {
    console.log(`📝 Revised prompt: ${result.revisedPrompt.substring(0, 100)}...`);
  }
}

async function commandReference(args: string[]): Promise<void> {
  let imagePath = '';
  let modifications = '';
  let verbose = false;
  let outputDir = './src/assets/images/photos';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-v': case '--verbose': verbose = true; break;
      case '-o': case '--output': outputDir = args[++i]; break;
      case '-m': case '--modify': modifications = args[++i]; break;
      default:
        if (!arg.startsWith('-') && !imagePath) imagePath = arg;
    }
  }

  if (!imagePath) {
    console.error('❌ Image path required. Usage: image-studio reference ./path/to/image.jpg');
    process.exit(1);
  }

  findAndLoadEnv(verbose);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY required');
    process.exit(1);
  }

  console.log(`🔍 Analyzing reference image...`);
  fs.mkdirSync(outputDir, { recursive: true });

  const generator = new ImageGenerator(apiKey, { outputDir, verbose });

  const isUrl = imagePath.startsWith('http');
  const result = await generator.generateFromReference({
    prompt: '', // Will be generated from reference
    referenceImagePath: isUrl ? undefined : imagePath,
    referenceImageUrl: isUrl ? imagePath : undefined,
    modifications
  });

  console.log(`✅ Generated from reference: ${result.localPath}`);
}

async function commandServer(args: string[]): Promise<void> {
  let port = 3847;
  let verbose = false;
  let outputDir = './src/assets/images/photos';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '-v': case '--verbose': verbose = true; break;
      case '-p': case '--port': port = parseInt(args[++i]); break;
      case '-o': case '--output': outputDir = args[++i]; break;
    }
  }

  findAndLoadEnv(verbose);

  const unsplashKey = process.env.PUBLIC_UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!unsplashKey && !openaiKey) {
    console.error('❌ At least one API key required (UNSPLASH_ACCESS_KEY or OPENAI_API_KEY)');
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  await startServer({
    port,
    unsplashKey,
    openaiKey,
    outputDir,
    verbose
  });

  console.log('\nEndpoints:');
  console.log(`  GET  /api/status              - Check available features`);
  console.log(`  GET  /api/unsplash/search?q=  - Search Unsplash`);
  console.log(`  POST /api/unsplash/download   - Download Unsplash image`);
  console.log(`  POST /api/generate            - Generate with AI`);
  console.log(`  POST /api/generate/reference  - Generate from reference`);
  console.log(`  GET  /api/images              - List local images`);
  console.log(`\nPress Ctrl+C to stop`);
}

// ============================================
// Help
// ============================================

function showHelp(): void {
  console.log(`
Image Studio - Unified Image Fetcher & Generator

Commands:
  fetch [type]              Fetch images from Unsplash
  generate "prompt"         Generate image with AI (DALL-E 3)
  reference <image>         Generate similar image from reference
  server                    Start API server for UI

Fetch Options:
  -o, --output <dir>        Output directory
  -c, --config <file>       Config file path
  -v, --verbose             Verbose output

Generate Options:
  -o, --output <dir>        Output directory
  -m, --model <model>       Model: dall-e-3, dall-e-2, gpt-image-1
  -s, --size <size>         Size: 1024x1024, 1792x1024, 1024x1792
  --style <style>           Style: vivid, natural
  -q, --quality <quality>   Quality: standard, hd
  -v, --verbose             Verbose output

Reference Options:
  -o, --output <dir>        Output directory
  -m, --modify <text>       Modifications to apply
  -v, --verbose             Verbose output

Server Options:
  -p, --port <port>         Port (default: 3847)
  -o, --output <dir>        Output directory
  -v, --verbose             Verbose output

Examples:
  image-studio fetch landscaping
  image-studio generate "modern office interior, natural lighting"
  image-studio reference ./hero.jpg --modify "make it nighttime"
  image-studio server -v

Environment Variables:
  UNSPLASH_ACCESS_KEY       Unsplash API key
  OPENAI_API_KEY            OpenAI API key
`);
}

// ============================================
// Config Helpers
// ============================================

function loadConfig(configPath: string): FetchConfig {
  const defaultQueriesPath = path.join(__dirname, '..', 'config', 'default-queries.json');

  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    if (fs.existsSync(defaultQueriesPath)) {
      return {
        queries: JSON.parse(fs.readFileSync(defaultQueriesPath, 'utf-8')),
        settings: { orientation: 'landscape', contentFilter: 'low', rateLimitDelay: 500 }
      };
    }
  } catch { /* use fallback */ }

  return {
    queries: {
      common: { hero: "professional business", about: "team meeting", contact: "customer service" }
    },
    settings: { orientation: 'landscape', contentFilter: 'low', rateLimitDelay: 500 }
  };
}

function flattenQueries(queries: Record<string, unknown>): Record<string, string> {
  const flattened: Record<string, string> = {};

  for (const [type, value] of Object.entries(queries)) {
    if (typeof value === 'string') {
      flattened[type] = value;
    } else if (typeof value === 'object' && value !== null) {
      for (const [key, subValue] of Object.entries(value as Record<string, unknown>)) {
        if (Array.isArray(subValue)) {
          subValue.forEach((q, i) => {
            flattened[`${type}_${key}_${i + 1}`] = q as string;
          });
        } else {
          flattened[`${type}_${key}`] = subValue as string;
        }
      }
    }
  }

  return flattened;
}

function buildQueries(queries: Record<string, unknown>, businessType: string): Record<string, string> {
  const result: Record<string, string> = {};
  const typeQueries = queries[businessType];

  if (!typeQueries) {
    console.error(`❌ Unknown type: ${businessType}`);
    console.error(`Available: ${Object.keys(queries).join(', ')}`);
    process.exit(1);
  }

  if (typeof typeQueries === 'object' && typeQueries !== null) {
    for (const [key, value] of Object.entries(typeQueries as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        value.forEach((q, i) => {
          result[`${businessType}_${key}_${i + 1}`] = q as string;
        });
      } else {
        result[`${businessType}_${key}`] = value as string;
      }
    }
  }

  // Include common queries
  if (queries.common && typeof queries.common === 'object') {
    for (const [key, value] of Object.entries(queries.common as Record<string, string>)) {
      result[`common_${key}`] = value;
    }
  }

  return result;
}

// ============================================
// Main
// ============================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '-h' || command === '--help' || command === 'help') {
    showHelp();
    return;
  }

  const subArgs = args.slice(1);

  switch (command) {
    case 'fetch':
      await commandFetch(subArgs);
      break;
    case 'generate':
    case 'gen':
      await commandGenerate(subArgs);
      break;
    case 'reference':
    case 'ref':
      await commandReference(subArgs);
      break;
    case 'server':
    case 'serve':
      await commandServer(subArgs);
      break;
    default:
      // Legacy mode: treat as business type for fetch
      await commandFetch(args);
  }
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
