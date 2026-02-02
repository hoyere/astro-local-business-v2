// Main exports for the package

// Fetchers & Generators
export { UnsplashFetcher } from './fetcher';
export { ImageGenerator } from './generator';

// Server
export { ImageStudioServer, startServer } from './server/api';

// Utilities
export { calculateLuminance, estimateDominantColor, calculateImageScore, isDarkColor } from './analyzer';

// Types
export type {
  // Unsplash Types
  UnsplashImageMetadata,
  UnsplashPhoto,
  UnsplashSearchResponse,
  SearchOptions,
  FetchBatchResult,
  FetchConfig,
  FetcherOptions,

  // Generation Types
  GenerateOptions,
  GeneratedImage,
  GeneratorOptions,
  ReferenceGenerateOptions,
  ImageModel,
  ImageSize,
  ImageStyle,
  ImageQuality,

  // Unified Types
  ImageSource,
  ImageAsset,
  LocalImageMetadata
} from './types';
