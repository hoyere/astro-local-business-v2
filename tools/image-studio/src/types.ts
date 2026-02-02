// ============================================
// Unsplash API Response Types
// ============================================

export interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  color: string | null;
  alt_description: string | null;
  description: string | null;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    id: string;
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
}

export interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

// ============================================
// Search Options
// ============================================

export interface SearchOptions {
  page?: number;
  perPage?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  color?: 'black_and_white' | 'black' | 'white' | 'yellow' | 'orange' | 'red' | 'purple' | 'magenta' | 'green' | 'teal' | 'blue';
  orderBy?: 'relevant' | 'latest';
  contentFilter?: 'low' | 'high';
  collections?: string;
}

// ============================================
// Image Metadata (stored locally)
// ============================================

export interface UnsplashImageMetadata {
  id: string;
  query: string;
  localPath: string;
  originalUrl: string;
  width: number;
  height: number;
  color: string;
  luminance: number;
  author: string;
  authorUrl: string;
  downloadDate: string;
  altText: string;
}

// ============================================
// Fetch Results
// ============================================

export interface FetchBatchResult {
  downloaded: number;
  skipped: number;
  failed: number;
}

// ============================================
// Configuration
// ============================================

export interface FetchConfig {
  queries: Record<string, string | string[] | Record<string, string | string[]>>;
  settings?: {
    orientation?: 'landscape' | 'portrait' | 'squarish';
    contentFilter?: 'low' | 'high';
    collections?: string;
    rateLimitDelay?: number;
  };
}

export interface FetcherOptions {
  cacheDir?: string;
  verbose?: boolean;
  attributionPath?: string;
  contentFilter?: 'low' | 'high';
  collections?: string;
}

// ============================================
// OpenAI Image Generation Types
// ============================================

export type ImageModel = 'gpt-image-1' | 'dall-e-3' | 'dall-e-2';
export type ImageSize = '1024x1024' | '1792x1024' | '1024x1792' | '512x512' | '256x256';
export type ImageStyle = 'vivid' | 'natural';
export type ImageQuality = 'standard' | 'hd';

export interface GenerateOptions {
  prompt: string;
  model?: ImageModel;
  size?: ImageSize;
  style?: ImageStyle;
  quality?: ImageQuality;
  n?: number;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  revisedPrompt?: string;
  localPath: string;
  originalUrl?: string;
  model: ImageModel;
  size: ImageSize;
  style?: ImageStyle;
  quality?: ImageQuality;
  generatedAt: string;
}

export interface GeneratorOptions {
  outputDir: string;
  verbose?: boolean;
  attributionPath?: string;
}

export interface ReferenceGenerateOptions extends GenerateOptions {
  referenceImagePath?: string;
  referenceImageUrl?: string;
  modifications?: string;
}

// ============================================
// Unified Image Source
// ============================================

export type ImageSource = 'unsplash' | 'openai' | 'local';

export interface ImageAsset {
  id: string;
  source: ImageSource;
  localPath: string;
  originalUrl?: string;
  width?: number;
  height?: number;
  altText: string;
  metadata: UnsplashImageMetadata | GeneratedImage | LocalImageMetadata;
}

export interface LocalImageMetadata {
  id: string;
  localPath: string;
  filename: string;
  importedAt: string;
  altText: string;
}
