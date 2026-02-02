import {
  UnsplashImageMetadata,
  UnsplashPhoto,
  UnsplashSearchResponse,
  SearchOptions,
  FetchBatchResult,
  FetcherOptions
} from './types';
import { calculateLuminance, estimateDominantColor } from './analyzer';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

export class UnsplashFetcher {
  private accessKey: string;
  private outputDir: string;
  private attributionPath: string;
  private verbose: boolean;
  private contentFilter: 'low' | 'high';
  private collections?: string;

  constructor(accessKey: string, outputDir: string, options: FetcherOptions = {}) {
    this.accessKey = accessKey;
    this.outputDir = path.resolve(outputDir);
    this.verbose = options.verbose || false;
    this.contentFilter = options.contentFilter || 'low';
    this.collections = options.collections;
    // Attribution file defaults to ATTRIBUTION.md in the images directory
    this.attributionPath = options.attributionPath || path.join(path.dirname(this.outputDir), 'ATTRIBUTION.md');
  }

  async searchImages(query: string, options: SearchOptions = {}): Promise<UnsplashSearchResponse> {
    const {
      page = 1,
      perPage = 10,
      orientation = 'landscape',
      color,
      orderBy = 'relevant',
      contentFilter = this.contentFilter,
      collections = this.collections
    } = options;

    const params = new URLSearchParams({
      query,
      page: page.toString(),
      per_page: perPage.toString(),
      orientation,
      order_by: orderBy,
      content_filter: contentFilter,
      client_id: this.accessKey
    });

    if (color) params.append('color', color);
    if (collections) params.append('collections', collections);

    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?${params}`);

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json() as UnsplashSearchResponse;
      return data;
    } catch (error) {
      if (this.verbose) console.error('Error searching Unsplash:', error);
      return { results: [], total: 0, total_pages: 0 };
    }
  }

  async fetchImage(query: string, saveAs: string): Promise<UnsplashImageMetadata | null> {
    if (this.verbose) console.log(`Fetching image for query: "${query}"...`);

    // Check if file already exists
    const sanitizedName = saveAs.replace(/[^a-z0-9-_]/gi, '-');
    const localFileName = `${sanitizedName}.jpg`;
    const fullPath = path.join(this.outputDir, localFileName);

    if (fs.existsSync(fullPath)) {
      if (this.verbose) console.log(`⏭️  Image "${saveAs}" already exists`);
      return null;
    }

    const searchResult = await this.searchImages(query, {
      perPage: 30,
      orientation: 'landscape'
    });

    if (!searchResult.results || searchResult.results.length === 0) {
      if (this.verbose) console.error(`✗ No images found for query: "${query}"`);
      return null;
    }

    // Pick the best image based on scoring
    const bestImage = this.selectBestImage(searchResult.results);

    if (!bestImage) {
      if (this.verbose) console.error(`✗ No suitable image found for query: "${query}"`);
      return null;
    }

    // Download the image
    await this.downloadImage(bestImage.urls.regular, fullPath);

    // Create metadata
    const metadata: UnsplashImageMetadata = {
      id: bestImage.id,
      query: query,
      localPath: `src/assets/images/photos/${localFileName}`,
      originalUrl: bestImage.urls.regular,
      width: bestImage.width,
      height: bestImage.height,
      color: bestImage.color || '#000000',
      luminance: calculateLuminance(bestImage.color || '#000000'),
      author: bestImage.user.name,
      authorUrl: bestImage.user.links.html,
      downloadDate: new Date().toISOString(),
      altText: bestImage.alt_description || query
    };

    // Append to attribution file
    this.appendAttribution(localFileName, metadata);

    if (this.verbose) console.log(`✓ Saved image "${saveAs}" from Unsplash`);
    return metadata;
  }

  async fetchBatch(queries: Record<string, string | string[]>): Promise<FetchBatchResult> {
    if (this.verbose) console.log('Starting batch fetch...');

    const result: FetchBatchResult = { downloaded: 0, skipped: 0, failed: 0 };

    for (const [category, queryData] of Object.entries(queries)) {
      if (Array.isArray(queryData)) {
        // Handle array of queries
        for (let i = 0; i < queryData.length; i++) {
          const query = queryData[i];
          const saveAs = `${category}_${i + 1}`;
          const fetchResult = await this.fetchImage(query, saveAs);

          if (fetchResult) {
            result.downloaded++;
          } else if (fs.existsSync(path.join(this.outputDir, `${saveAs.replace(/[^a-z0-9-_]/gi, '-')}.jpg`))) {
            result.skipped++;
          } else {
            result.failed++;
          }

          // Rate limiting
          await this.delay(500);
        }
      } else {
        // Handle single query
        const fetchResult = await this.fetchImage(queryData, category);

        if (fetchResult) {
          result.downloaded++;
        } else if (fs.existsSync(path.join(this.outputDir, `${category.replace(/[^a-z0-9-_]/gi, '-')}.jpg`))) {
          result.skipped++;
        } else {
          result.failed++;
        }

        await this.delay(500);
      }
    }

    if (this.verbose) console.log(`Batch fetch complete. Downloaded: ${result.downloaded}, Skipped: ${result.skipped}, Failed: ${result.failed}`);
    return result;
  }

  private selectBestImage(images: UnsplashPhoto[]): UnsplashPhoto | null {
    if (images.length === 0) return null;

    // Score and sort images
    const scoredImages = images.map(image => {
      const luminance = calculateLuminance(image.color || '#888888');
      const colorInfo = estimateDominantColor(image.color || '#888888');
      const score = (1 - luminance) * 0.5 + colorInfo.suitability * 0.5;

      return { image, score };
    });

    scoredImages.sort((a, b) => b.score - a.score);

    // Return the best scoring image
    return scoredImages[0]?.image || null;
  }

  private async downloadImage(url: string, filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const file = fs.createWriteStream(filepath);

      https.get(url, (response) => {
        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file on error
        reject(err);
      });
    });
  }

  private appendAttribution(filename: string, metadata: UnsplashImageMetadata): void {
    const entry = `
### ${filename}
- **Photographer**: [${metadata.author}](${metadata.authorUrl})
- **Source**: [Unsplash](https://unsplash.com/photos/${metadata.id})
- **Description**: ${metadata.altText}
- **Downloaded**: ${new Date().toISOString().split('T')[0]}
`;

    // Check if attribution file exists, create if not
    if (!fs.existsSync(this.attributionPath)) {
      const header = `# Image Attribution

All photos are used under the [Unsplash License](https://unsplash.com/license).

## Photos
`;
      fs.writeFileSync(this.attributionPath, header);
    }

    // Append the new entry
    fs.appendFileSync(this.attributionPath, entry);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
