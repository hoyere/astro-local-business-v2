import * as http from 'http';
import * as url from 'url';
import * as fs from 'fs';
import * as path from 'path';
import { UnsplashFetcher } from '../fetcher';
import { ImageGenerator } from '../generator';
import { SearchOptions, GenerateOptions, ReferenceGenerateOptions } from '../types';

interface ServerConfig {
  port?: number;
  unsplashKey?: string;
  openaiKey?: string;
  outputDir: string;
  verbose?: boolean;
}

interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export class ImageStudioServer {
  private server: http.Server | null = null;
  private unsplashFetcher: UnsplashFetcher | null = null;
  private imageGenerator: ImageGenerator | null = null;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = {
      port: 3847, // Default port for Image Studio
      ...config
    };

    // Initialize Unsplash fetcher if key provided
    if (config.unsplashKey) {
      this.unsplashFetcher = new UnsplashFetcher(config.unsplashKey, config.outputDir, {
        verbose: config.verbose
      });
    }

    // Initialize OpenAI generator if key provided
    if (config.openaiKey) {
      this.imageGenerator = new ImageGenerator(config.openaiKey, {
        outputDir: config.outputDir,
        verbose: config.verbose
      });
    }
  }

  /**
   * Start the API server
   */
  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.listen(this.config.port, () => {
        console.log(`🖼️  Image Studio server running at http://localhost:${this.config.port}`);
        resolve();
      });
    });
  }

  /**
   * Stop the API server
   */
  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Image Studio server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Handle incoming HTTP requests
   */
  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    // CORS headers for dev toolbar access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const parsedUrl = url.parse(req.url || '', true);
    const pathname = parsedUrl.pathname || '/';

    try {
      let response: ApiResponse;

      switch (pathname) {
        case '/api/status':
          response = this.handleStatus();
          break;

        case '/api/unsplash/search':
          response = await this.handleUnsplashSearch(parsedUrl.query as Record<string, string>);
          break;

        case '/api/unsplash/download':
          response = await this.handleUnsplashDownload(req);
          break;

        case '/api/generate':
          response = await this.handleGenerate(req);
          break;

        case '/api/generate/reference':
          response = await this.handleGenerateFromReference(req);
          break;

        case '/api/generate/variation':
          response = await this.handleVariation(req);
          break;

        case '/api/images':
          response = await this.handleListImages();
          break;

        case '/api/images/delete':
          response = await this.handleDeleteImage(req);
          break;

        default:
          response = { success: false, error: 'Not found' };
          res.writeHead(404);
      }

      if (!res.headersSent) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
      }
      res.end(JSON.stringify(response));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: errorMessage }));
    }
  }

  /**
   * GET /api/status - Check server status and available features
   */
  private handleStatus(): ApiResponse {
    return {
      success: true,
      data: {
        unsplash: !!this.unsplashFetcher,
        openai: !!this.imageGenerator,
        outputDir: this.config.outputDir
      }
    };
  }

  /**
   * GET /api/unsplash/search - Search Unsplash images
   */
  private async handleUnsplashSearch(query: Record<string, string>): Promise<ApiResponse> {
    if (!this.unsplashFetcher) {
      return { success: false, error: 'Unsplash not configured' };
    }

    const searchQuery = query.q || query.query;
    if (!searchQuery) {
      return { success: false, error: 'Query parameter "q" is required' };
    }

    const options: SearchOptions = {
      perPage: parseInt(query.perPage || '20'),
      page: parseInt(query.page || '1'),
      orientation: query.orientation as SearchOptions['orientation'],
      color: query.color as SearchOptions['color'],
      orderBy: query.orderBy as SearchOptions['orderBy']
    };

    const results = await this.unsplashFetcher.searchImages(searchQuery, options);

    return {
      success: true,
      data: {
        total: results.total,
        totalPages: results.total_pages,
        results: results.results.map(photo => ({
          id: photo.id,
          width: photo.width,
          height: photo.height,
          color: photo.color,
          description: photo.alt_description || photo.description,
          urls: photo.urls,
          author: {
            name: photo.user.name,
            username: photo.user.username,
            url: photo.user.links.html
          }
        }))
      }
    };
  }

  /**
   * POST /api/unsplash/download - Download an Unsplash image
   */
  private async handleUnsplashDownload(req: http.IncomingMessage): Promise<ApiResponse> {
    if (!this.unsplashFetcher) {
      return { success: false, error: 'Unsplash not configured' };
    }

    const body = await this.parseJsonBody(req);
    const query = body.query as string | undefined;
    const saveAs = body.saveAs as string | undefined;

    if (!query || !saveAs) {
      return { success: false, error: 'Both "query" and "saveAs" are required' };
    }

    const result = await this.unsplashFetcher.fetchImage(query, saveAs);

    if (result) {
      return { success: true, data: result };
    } else {
      return { success: false, error: 'Image already exists or not found' };
    }
  }

  /**
   * POST /api/generate - Generate an image with AI
   */
  private async handleGenerate(req: http.IncomingMessage): Promise<ApiResponse> {
    if (!this.imageGenerator) {
      return { success: false, error: 'OpenAI not configured' };
    }

    const body = await this.parseJsonBody(req);
    const options: GenerateOptions = {
      prompt: body.prompt as string,
      model: body.model as GenerateOptions['model'],
      size: body.size as GenerateOptions['size'],
      style: body.style as GenerateOptions['style'],
      quality: body.quality as GenerateOptions['quality']
    };

    if (!options.prompt) {
      return { success: false, error: 'Prompt is required' };
    }

    const result = await this.imageGenerator.generate(options);
    return { success: true, data: result };
  }

  /**
   * POST /api/generate/reference - Generate from reference image
   */
  private async handleGenerateFromReference(req: http.IncomingMessage): Promise<ApiResponse> {
    if (!this.imageGenerator) {
      return { success: false, error: 'OpenAI not configured' };
    }

    const body = await this.parseJsonBody(req);
    const options: ReferenceGenerateOptions = {
      prompt: (body.prompt as string) || '',
      referenceImagePath: body.referenceImagePath as string | undefined,
      referenceImageUrl: body.referenceImageUrl as string | undefined,
      modifications: body.modifications as string | undefined,
      model: body.model as ReferenceGenerateOptions['model'],
      size: body.size as ReferenceGenerateOptions['size'],
      style: body.style as ReferenceGenerateOptions['style']
    };

    if (!options.referenceImagePath && !options.referenceImageUrl) {
      return { success: false, error: 'Either referenceImagePath or referenceImageUrl is required' };
    }

    const result = await this.imageGenerator.generateFromReference(options);
    return { success: true, data: result };
  }

  /**
   * POST /api/generate/variation - Create variation of existing image
   */
  private async handleVariation(req: http.IncomingMessage): Promise<ApiResponse> {
    if (!this.imageGenerator) {
      return { success: false, error: 'OpenAI not configured' };
    }

    const body = await this.parseJsonBody(req);
    const imagePath = body.imagePath as string | undefined;
    const size = body.size as string | undefined;

    if (!imagePath) {
      return { success: false, error: 'imagePath is required' };
    }

    const result = await this.imageGenerator.createVariation(imagePath, { size: size as GenerateOptions['size'] });
    return { success: true, data: result };
  }

  /**
   * GET /api/images - List all images in output directory
   */
  private async handleListImages(): Promise<ApiResponse> {
    const images: Array<{
      filename: string;
      path: string;
      size: number;
      modified: Date;
    }> = [];

    if (fs.existsSync(this.config.outputDir)) {
      const files = fs.readdirSync(this.config.outputDir);

      for (const file of files) {
        const filepath = path.join(this.config.outputDir, file);
        const stat = fs.statSync(filepath);

        if (stat.isFile() && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file)) {
          images.push({
            filename: file,
            path: `src/assets/images/photos/${file}`,
            size: stat.size,
            modified: stat.mtime
          });
        }
      }
    }

    return {
      success: true,
      data: {
        count: images.length,
        images: images.sort((a, b) => b.modified.getTime() - a.modified.getTime())
      }
    };
  }

  /**
   * POST /api/images/delete - Delete an image
   */
  private async handleDeleteImage(req: http.IncomingMessage): Promise<ApiResponse> {
    const body = await this.parseJsonBody(req);
    const filename = body.filename as string | undefined;

    if (!filename) {
      return { success: false, error: 'filename is required' };
    }

    const filepath = path.join(this.config.outputDir, filename);

    if (!fs.existsSync(filepath)) {
      return { success: false, error: 'Image not found' };
    }

    fs.unlinkSync(filepath);
    return { success: true, data: { deleted: filename } };
  }

  /**
   * Parse JSON request body
   */
  private parseJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (e) {
          reject(new Error('Invalid JSON body'));
        }
      });
      req.on('error', reject);
    });
  }
}

/**
 * Start server from CLI
 */
export async function startServer(config: ServerConfig): Promise<ImageStudioServer> {
  const server = new ImageStudioServer(config);
  await server.start();
  return server;
}
