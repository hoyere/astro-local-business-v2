import {
  GenerateOptions,
  GeneratedImage,
  GeneratorOptions,
  ReferenceGenerateOptions,
  ImageModel,
  ImageSize
} from './types';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as crypto from 'crypto';

interface OpenAIImageResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

export class ImageGenerator {
  private apiKey: string;
  private outputDir: string;
  private verbose: boolean;
  private attributionPath: string;

  constructor(apiKey: string, options: GeneratorOptions) {
    this.apiKey = apiKey;
    this.outputDir = path.resolve(options.outputDir);
    this.verbose = options.verbose || false;
    this.attributionPath = options.attributionPath || path.join(path.dirname(this.outputDir), 'ATTRIBUTION.md');

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate an image from a text prompt using OpenAI
   */
  async generate(options: GenerateOptions): Promise<GeneratedImage> {
    const {
      prompt,
      model = 'dall-e-3',
      size = '1024x1024',
      style = 'natural',
      quality = 'standard',
      n = 1
    } = options;

    if (this.verbose) {
      console.log(`Generating image with ${model}...`);
      console.log(`  Prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);
    }

    // Validate size for model
    const validatedSize = this.validateSize(model, size);

    const requestBody: Record<string, unknown> = {
      model,
      prompt,
      n: model === 'dall-e-3' ? 1 : n, // DALL-E 3 only supports n=1
      size: validatedSize,
      response_format: 'url'
    };

    // Style and quality only for DALL-E 3
    if (model === 'dall-e-3') {
      requestBody.style = style;
      requestBody.quality = quality;
    }

    try {
      const response = await this.callOpenAI('/v1/images/generations', requestBody);
      const imageData = response.data[0];

      if (!imageData.url) {
        throw new Error('No image URL returned from OpenAI');
      }

      // Generate unique filename
      const id = this.generateId();
      const filename = `generated_${id}.png`;
      const localPath = path.join(this.outputDir, filename);

      // Download the image
      await this.downloadImage(imageData.url, localPath);

      const result: GeneratedImage = {
        id,
        prompt,
        revisedPrompt: imageData.revised_prompt,
        localPath: `src/assets/images/photos/${filename}`,
        originalUrl: imageData.url,
        model,
        size: validatedSize,
        style: model === 'dall-e-3' ? style : undefined,
        quality: model === 'dall-e-3' ? quality : undefined,
        generatedAt: new Date().toISOString()
      };

      // Append to attribution file
      this.appendAttribution(filename, result);

      if (this.verbose) {
        console.log(`✓ Generated and saved: ${filename}`);
        if (imageData.revised_prompt) {
          console.log(`  Revised prompt: "${imageData.revised_prompt.substring(0, 80)}..."`);
        }
      }

      return result;
    } catch (error) {
      if (this.verbose) {
        console.error('✗ Generation failed:', error);
      }
      throw error;
    }
  }

  /**
   * Generate an image based on a reference image
   * Uses GPT-4 Vision to analyze the reference, then generates a similar image
   */
  async generateFromReference(options: ReferenceGenerateOptions): Promise<GeneratedImage> {
    const { referenceImagePath, referenceImageUrl, modifications, ...generateOptions } = options;

    let description: string;

    if (referenceImagePath) {
      description = await this.describeImageFromPath(referenceImagePath);
    } else if (referenceImageUrl) {
      description = await this.describeImageFromUrl(referenceImageUrl);
    } else {
      throw new Error('Either referenceImagePath or referenceImageUrl is required');
    }

    // Combine the description with modifications
    let prompt = `Create an image similar to this: ${description}`;
    if (modifications) {
      prompt += `. Modifications: ${modifications}`;
    }

    if (this.verbose) {
      console.log(`Reference description: "${description.substring(0, 100)}..."`);
    }

    return this.generate({
      ...generateOptions,
      prompt
    });
  }

  /**
   * Describe an image using GPT-4 Vision from a local file
   */
  async describeImageFromPath(imagePath: string): Promise<string> {
    const absolutePath = path.resolve(imagePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Image not found: ${absolutePath}`);
    }

    const imageBuffer = fs.readFileSync(absolutePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = this.getMimeType(absolutePath);

    return this.describeImage(`data:${mimeType};base64,${base64Image}`);
  }

  /**
   * Describe an image using GPT-4 Vision from a URL
   */
  async describeImageFromUrl(imageUrl: string): Promise<string> {
    return this.describeImage(imageUrl);
  }

  /**
   * Use GPT-4 Vision to describe an image for regeneration
   */
  private async describeImage(imageSource: string): Promise<string> {
    if (this.verbose) {
      console.log('Analyzing reference image with GPT-4 Vision...');
    }

    const requestBody = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Describe this image in detail for the purpose of recreating a similar image with AI.
Focus on: composition, lighting, colors, mood, subjects, style, and any notable visual elements.
Be specific about spatial relationships and artistic style.
Keep the description under 500 characters for use as an image generation prompt.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageSource,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 300
    };

    const response = await this.callOpenAI('/v1/chat/completions', requestBody);
    return response.choices[0]?.message?.content || 'Professional business image';
  }

  /**
   * Create a variation of an existing image (DALL-E 2 only)
   */
  async createVariation(imagePath: string, options: Partial<GenerateOptions> = {}): Promise<GeneratedImage> {
    const absolutePath = path.resolve(imagePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Image not found: ${absolutePath}`);
    }

    if (this.verbose) {
      console.log(`Creating variation of: ${imagePath}`);
    }

    // Read the image file
    const imageBuffer = fs.readFileSync(absolutePath);
    const base64Image = imageBuffer.toString('base64');

    const size = options.size || '1024x1024';
    const validatedSize = this.validateSize('dall-e-2', size);

    // For variations, we need to use form data
    // This is a simplified version - in production, use proper multipart form
    const boundary = '----FormBoundary' + crypto.randomBytes(16).toString('hex');

    const formData = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="image"; filename="image.png"',
      'Content-Type: image/png',
      '',
      imageBuffer.toString('binary'),
      `--${boundary}`,
      'Content-Disposition: form-data; name="model"',
      '',
      'dall-e-2',
      `--${boundary}`,
      'Content-Disposition: form-data; name="size"',
      '',
      validatedSize,
      `--${boundary}`,
      'Content-Disposition: form-data; name="n"',
      '',
      '1',
      `--${boundary}--`
    ].join('\r\n');

    const response = await this.callOpenAIMultipart('/v1/images/variations', formData, boundary);
    const imageData = response.data[0];

    if (!imageData.url) {
      throw new Error('No image URL returned from OpenAI');
    }

    const id = this.generateId();
    const filename = `variation_${id}.png`;
    const localPath = path.join(this.outputDir, filename);

    await this.downloadImage(imageData.url, localPath);

    const result: GeneratedImage = {
      id,
      prompt: `Variation of ${path.basename(imagePath)}`,
      localPath: `~/assets/images/photos/${filename}`,
      originalUrl: imageData.url,
      model: 'dall-e-2',
      size: validatedSize as ImageSize,
      generatedAt: new Date().toISOString()
    };

    this.appendAttribution(filename, result);

    if (this.verbose) {
      console.log(`✓ Created variation: ${filename}`);
    }

    return result;
  }

  /**
   * Validate and adjust size based on model capabilities
   */
  private validateSize(model: ImageModel, size: ImageSize): ImageSize {
    const validSizes: Record<ImageModel, ImageSize[]> = {
      'gpt-image-1': ['1024x1024', '1792x1024', '1024x1792'],
      'dall-e-3': ['1024x1024', '1792x1024', '1024x1792'],
      'dall-e-2': ['256x256', '512x512', '1024x1024']
    };

    const modelSizes = validSizes[model];
    if (modelSizes.includes(size)) {
      return size;
    }

    // Default to 1024x1024 if size not supported
    if (this.verbose) {
      console.log(`  Size ${size} not supported for ${model}, using 1024x1024`);
    }
    return '1024x1024';
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(endpoint: string, body: Record<string, unknown>): Promise<any> {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(body);

      const options = {
        hostname: 'api.openai.com',
        port: 443,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode !== 200) {
              reject(new Error(parsed.error?.message || `API error: ${res.statusCode}`));
            } else {
              resolve(parsed);
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  /**
   * Call OpenAI API with multipart form data
   */
  private async callOpenAIMultipart(endpoint: string, formData: string, boundary: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.openai.com',
        port: 443,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(formData, 'binary')
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode !== 200) {
              reject(new Error(parsed.error?.message || `API error: ${res.statusCode}`));
            } else {
              resolve(parsed);
            }
          } catch (e) {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(formData, 'binary');
      req.end();
    });
  }

  /**
   * Download image from URL
   */
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
        fs.unlink(filepath, () => {});
        reject(err);
      });
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(filepath: string): string {
    const ext = path.extname(filepath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/png';
  }

  /**
   * Append to attribution file
   */
  private appendAttribution(filename: string, image: GeneratedImage): void {
    const entry = `
### ${filename}
- **Source**: AI Generated (OpenAI ${image.model})
- **Prompt**: ${image.prompt.substring(0, 100)}${image.prompt.length > 100 ? '...' : ''}
- **Generated**: ${new Date().toISOString().split('T')[0]}
`;

    if (!fs.existsSync(this.attributionPath)) {
      const header = `# Image Attribution

All photos are used under their respective licenses.

## AI Generated Images

`;
      fs.writeFileSync(this.attributionPath, header);
    }

    fs.appendFileSync(this.attributionPath, entry);
  }
}
