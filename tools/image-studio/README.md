# Image Studio

Unified image tool for Astro projects: fetch from Unsplash, generate with AI, manage assets.

## Features

- **Unsplash Fetching** - Batch download stock photos with intelligent selection
- **AI Generation** - Create images with DALL-E 3 / GPT Image-1
- **Reference Generation** - Generate similar images from existing photos using GPT-4 Vision
- **API Server** - REST API for dev toolbar integration
- **Astro Integration** - Dev toolbar with Shift+Right-click image replacement
- **Type-safe** - Full TypeScript with proper types

## Quick Start

```bash
# Install
git clone https://github.com/hoyere/image-studio.git
cd image-studio
npm install

# Configure
cp .env.example .env
# Add your API keys to .env

# Build
npm run build

# Use
node dist/cli.js fetch landscaping      # Fetch from Unsplash
node dist/cli.js generate "prompt"      # Generate with AI
node dist/cli.js reference ./photo.jpg  # Generate from reference
node dist/cli.js server                 # Start API server
```

## Commands

### Fetch (Unsplash)

```bash
image-studio fetch [type] [options]

# Examples
image-studio fetch landscaping
image-studio fetch attorney -v
image-studio fetch all -o ./images
```

**Options:**
| Option | Description |
|--------|-------------|
| `-o, --output <dir>` | Output directory (default: `./src/assets/images/photos`) |
| `-c, --config <file>` | Config file path (default: `./unsplash.config.json`) |
| `-v, --verbose` | Verbose output |

**Business Types:** Defined in config file. Defaults include `common` with hero, about, contact queries.

### Generate (AI)

Aliases: `generate`, `gen`

```bash
image-studio generate "prompt" [options]

# Examples
image-studio generate "modern office interior, natural lighting"
image-studio generate "cozy restaurant patio" --style vivid -q hd
image-studio gen "professional headshot" -m gpt-image-1
```

**Options:**
| Option | Description |
|--------|-------------|
| `-o, --output <dir>` | Output directory |
| `-m, --model <model>` | Model: `dall-e-3` (default), `dall-e-2`, `gpt-image-1` |
| `-s, --size <size>` | Size: `1024x1024` (default), `1792x1024`, `1024x1792` |
| `--style <style>` | Style: `vivid`, `natural` (default) - DALL-E 3 only |
| `-q, --quality <quality>` | Quality: `standard` (default), `hd` - DALL-E 3 only |
| `-v, --verbose` | Verbose output |

**Model Notes:**
- `dall-e-3` - Best quality, supports style/quality options, n=1 only
- `dall-e-2` - Supports 256x256, 512x512, 1024x1024 sizes
- `gpt-image-1` - OpenAI's latest image model

### Reference (Generate from Image)

Aliases: `reference`, `ref`

Uses GPT-4 Vision to analyze a reference image, then generates a similar image with DALL-E.

```bash
image-studio reference <image> [options]

# Examples
image-studio reference ./hero.jpg
image-studio reference ./photo.jpg --modify "make it nighttime"
image-studio ref https://example.com/image.jpg -m "add warm lighting"
```

**Options:**
| Option | Description |
|--------|-------------|
| `-o, --output <dir>` | Output directory |
| `-m, --modify <text>` | Modifications to apply to the generated image |
| `-v, --verbose` | Verbose output |

**Input:** Accepts local file paths or URLs.

### Server (API for UI)

Aliases: `server`, `serve`

Starts a REST API server for the Astro dev toolbar integration.

```bash
image-studio server [options]

# Examples
image-studio server -v
image-studio serve -p 4000 -o ./images
```

**Options:**
| Option | Description |
|--------|-------------|
| `-p, --port <port>` | Port (default: 3847) |
| `-o, --output <dir>` | Output directory |
| `-v, --verbose` | Verbose output |

**Note:** Requires at least one API key (UNSPLASH_ACCESS_KEY or OPENAI_API_KEY).

## API Endpoints

When running `image-studio server`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | Check available features (unsplash, openai) |
| GET | `/api/unsplash/search` | Search Unsplash images |
| POST | `/api/unsplash/download` | Download Unsplash image to local |
| POST | `/api/generate` | Generate image with AI |
| POST | `/api/generate/reference` | Generate from reference image |
| POST | `/api/generate/variation` | Create variation (DALL-E 2 only) |
| GET | `/api/images` | List local images in output directory |
| POST | `/api/images/delete` | Delete an image |

### Search Parameters

`GET /api/unsplash/search?q=office&orientation=landscape`

| Parameter | Description |
|-----------|-------------|
| `q` or `query` | Search query (required) |
| `page` | Page number (default: 1) |
| `perPage` | Results per page (default: 20) |
| `orientation` | `landscape`, `portrait`, `squarish` |
| `color` | `black_and_white`, `black`, `white`, `yellow`, `orange`, `red`, `purple`, `magenta`, `green`, `teal`, `blue` |
| `orderBy` | `relevant` (default), `latest` |

### Request Bodies

**POST /api/unsplash/download**
```json
{ "query": "modern office", "saveAs": "hero" }
```

**POST /api/generate**
```json
{
  "prompt": "professional office interior",
  "model": "dall-e-3",
  "size": "1792x1024",
  "style": "natural",
  "quality": "hd"
}
```

**POST /api/generate/reference**
```json
{
  "referenceImagePath": "./src/assets/images/hero.jpg",
  "modifications": "make it sunset lighting"
}
```

**POST /api/generate/variation**
```json
{ "imagePath": "./src/assets/images/photo.png", "size": "1024x1024" }
```

**POST /api/images/delete**
```json
{ "filename": "generated_abc123.png" }
```

## Configuration

### Environment Variables

```env
# Unsplash API Key (for fetching stock photos)
UNSPLASH_ACCESS_KEY=your_key_here
# or
PUBLIC_UNSPLASH_ACCESS_KEY=your_key_here

# OpenAI API Key (for AI generation)
OPENAI_API_KEY=your_key_here
```

The CLI automatically searches for `.env` files in:
- Current directory
- Up to 3 parent directories

### Config File

Create `unsplash.config.json` for custom fetch queries:

```json
{
  "queries": {
    "mybusiness": {
      "hero": "my business professional modern",
      "about": "team collaboration office",
      "services": ["service photo 1", "service photo 2"]
    },
    "common": {
      "contact": "customer service representative"
    }
  },
  "settings": {
    "orientation": "landscape",
    "contentFilter": "low",
    "collections": "123456,789012",
    "rateLimitDelay": 500
  }
}
```

**Settings:**
| Setting | Description |
|---------|-------------|
| `orientation` | `landscape`, `portrait`, `squarish` |
| `contentFilter` | `low` (default), `high` - filter adult content |
| `collections` | Comma-separated Unsplash collection IDs |
| `rateLimitDelay` | Delay between requests in ms (default: 500) |

## Output

Images are saved to `src/assets/images/photos/` with auto-generated `ATTRIBUTION.md`:

```
src/assets/images/
├── photos/
│   ├── landscaping_hero.jpg       # Unsplash fetch
│   ├── generated_a1b2c3d4.png     # AI generated
│   ├── variation_e5f6g7h8.png     # DALL-E 2 variation
│   └── ...
└── ATTRIBUTION.md                  # Auto-updated credits
```

**File Naming:**
- Unsplash: `{type}_{name}.jpg` (e.g., `landscaping_hero.jpg`)
- Generated: `generated_{id}.png`
- Variations: `variation_{id}.png`

## Programmatic Usage

```typescript
import { UnsplashFetcher, ImageGenerator } from 'image-studio';

// Fetch from Unsplash
const fetcher = new UnsplashFetcher(apiKey, outputDir, { verbose: true });
await fetcher.fetchImage('modern office', 'hero');

// Search Unsplash
const results = await fetcher.searchImages('office', {
  orientation: 'landscape',
  perPage: 10
});

// Batch fetch
await fetcher.fetchBatch({
  hero: 'modern office interior',
  team: 'business team meeting'
});

// Generate with AI
const generator = new ImageGenerator(openaiKey, { outputDir, verbose: true });
const result = await generator.generate({
  prompt: 'professional office interior',
  model: 'dall-e-3',
  size: '1792x1024',
  style: 'natural',
  quality: 'hd'
});
console.log(result.localPath);       // ~/assets/images/photos/generated_xxx.png
console.log(result.revisedPrompt);   // DALL-E 3's enhanced prompt

// Generate from reference (uses GPT-4 Vision)
const refResult = await generator.generateFromReference({
  prompt: '',
  referenceImagePath: './reference.jpg',
  modifications: 'make it brighter, add sunset lighting'
});

// Create variation (DALL-E 2 only)
const variation = await generator.createVariation('./image.png');
```

## Astro Dev Toolbar Integration

Image Studio includes an Astro integration that adds a toolbar app for visual image management.

### Installation

```bash
# From astro-integration directory
cd astro-integration
npm install
npm run build
```

### Setup

Add to your `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config';
import imageStudio from '../unsplash-image-fetcher/astro-integration';

export default defineConfig({
  integrations: [
    imageStudio({
      port: 3847,           // API server port (optional)
      outputDir: 'src/assets/images/photos',  // Where to save images (optional)
      verbose: true         // Enable logging (optional)
    })
  ]
});
```

### Usage

1. **Start the API server** in a separate terminal:
   ```bash
   image-studio server -v
   ```

2. **Run Astro dev server**:
   ```bash
   npm run dev
   ```

3. **Use the toolbar**:
   - Click the Image Studio icon in the Astro dev toolbar (bottom of page)
   - Or **Shift+Right-click** on any image to select it and open the panel

4. **Replace images**:
   - Search Unsplash or generate with AI
   - Click "Use This" to preview the replacement
   - Note: Changes are temporary for preview - download to keep

### Features

- **Unsplash Tab**: Search and browse stock photos
- **AI Generate Tab**: Create images with DALL-E 3
- **Current Image**: Shows selected image and pre-fills search
- **API Status**: Shows which services are available

## CLI Help

```bash
image-studio --help
image-studio help
image-studio -h
```

## Development

```bash
# Build everything
npm run build:all

# Build main package only
npm run build

# Build Astro integration only
npm run build:astro

# Watch mode
npm run dev
```

## Requirements

- Node.js 18+
- npm 8+
- API keys: Unsplash and/or OpenAI (depending on features used)

## License

MIT
