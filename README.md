# Astro Local Business Template v2

A production-ready Astro template for local business websites. Built with modern best practices, optimized for performance, SEO, and easy customization.

## Features

- **Astro 5.x** with static site generation
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- **TypeScript** in strict mode with path aliases
- **Content Collections** for services, team, and testimonials
- **Dark Mode** with system preference detection and localStorage persistence
- **View Transitions** for smooth page navigation
- **SEO Ready** with meta tags, Open Graph, social cards, and LocalBusiness schema
- **Responsive Design** with mobile-first approach
- **Accessible** with semantic HTML and ARIA attributes

---

## Quick Start (New Client Project)

```bash
# 1. Clone the template
git clone https://github.com/hoyere/astro-local-business-v2.git client-name-site
cd client-name-site

# 2. Remove template git history and start fresh
rm -rf .git
git init

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev
```

Open http://localhost:4321 to see your site.

## What's Included

| Folder | Purpose | For End Users? |
|--------|---------|----------------|
| `src/` | Template source code | Yes - edit this |
| `docs/` | Documentation & audit guides | Optional reference |
| `tools/image-studio/` | CLI for fetching/generating images | Optional tool |

> **Note:** The `docs/` and `tools/` folders are for development reference. You can delete them from client projects if not needed.

---

## Step-by-Step: New Client Setup

### 1. Clone & Initialize
```bash
git clone https://github.com/hoyere/astro-local-business-v2.git acme-plumbing
cd acme-plumbing && rm -rf .git && git init
npm install && npm run dev
```

### 2. Configure Business Info
Edit `src/site.config.ts` with client details (name, phone, email, address).

### 3. Apply Brand Colors
Edit `src/styles/global.css` - update the `@theme` block with client's brand colors.
See [docs/THEME_APPLICATION_GUIDE.md](./docs/THEME_APPLICATION_GUIDE.md) for OKLCH color conversion.

### 4. Add Images
```bash
cd tools/image-studio && npm install && npm run build
cp .env.example .env  # Add UNSPLASH_ACCESS_KEY
node dist/cli.js fetch plumbing -o ../../src/assets/images/photos
```

### 5. Update Content
- Edit markdown files in `src/content/services/`
- Edit markdown files in `src/content/team/`
- Edit markdown files in `src/content/testimonials/`

### 6. Pre-Ship Audit
Run through [docs/AUDIT_V2_TEMPLATE_QUICK.md](./docs/AUDIT_V2_TEMPLATE_QUICK.md) checklist.

### 7. Deploy
```bash
npm run build
npx vercel --prod  # or: npx netlify deploy --prod --dir=dist
```

---

## Project Structure

```
.
├── src/                     # Template source (what you'll edit)
│   ├── assets/images/       # Local images (processed by Astro)
│   ├── components/          # UI components
│   ├── content/             # Markdown content collections
│   ├── layouts/             # Page layouts
│   ├── lib/                 # Utilities
│   ├── pages/               # Route pages
│   ├── styles/              # Global CSS with theme tokens
│   ├── content.config.ts    # Collection schemas
│   └── site.config.ts       # Site configuration
├── docs/                    # Template documentation & audit guides
└── tools/
    └── image-studio/        # CLI for fetching/generating images
```

### Source Structure Details

```
src/
├── assets/images/
│   ├── photos/          # Stock photos
│   ├── brand/           # Logo files
│   └── icons/           # SVG icons
├── components/
│   ├── common/          # Button, ThemeToggle, etc.
│   ├── layout/          # Header, Footer
│   ├── sections/        # Hero, Services, CTA, etc.
│   └── seo/             # LocalBusinessSchema
└── content/
    ├── services/
    ├── team/
    └── testimonials/
```

## Customization Guide

### 1. Update Site Configuration

Edit `src/site.config.ts` to set your business information:

```typescript
export const siteConfig = {
  name: "Your Business Name",
  tagline: "Your tagline",
  description: "SEO description",
  url: "https://yourdomain.com",
  contact: {
    phone: "(555) 123-4567",
    email: "info@yourdomain.com",
    address: { ... }
  },
  // ...
};
```

### 2. Customize Colors

Edit `src/styles/global.css` to change the color scheme:

```css
@theme {
  --color-primary: oklch(0.55 0.2 250);      /* Main brand color */
  --color-primary-light: oklch(0.65 0.18 250);
  --color-primary-dark: oklch(0.45 0.22 250);
  /* ... */
}
```

### 3. Add Content

Create markdown files in the content directories:

**Services** (`src/content/services/my-service.md`):
```yaml
---
title: My Service
description: Service description
features:
  - Feature 1
  - Feature 2
order: 1
featured: true
---

Service content here...
```

**Team** (`src/content/team/john-doe.md`):
```yaml
---
name: John Doe
role: Position Title
bio: Short biography
order: 1
---
```

**Testimonials** (`src/content/testimonials/review-1.md`):
```yaml
---
author: Jane Smith
company: Company Name
rating: 5
featured: true
---

Testimonial content...
```

### 4. Add Images

Use the included **image-studio** CLI tool (in `tools/image-studio/`):

```bash
# Setup (one-time)
cd tools/image-studio
npm install
npm run build
cp .env.example .env  # Add your Unsplash API key

# Fetch stock photos
node dist/cli.js fetch landscaping -o ../../src/assets/images/photos

# Or generate with AI (requires OpenAI key in .env)
node dist/cli.js generate "modern office interior" -o ../../src/assets/images/photos
```

Then reference in components:

```astro
---
import { Image } from 'astro:assets';
import heroImage from '@assets/images/photos/landscaping_hero.jpg';
---

<Image src={heroImage} alt="Description" width={1200} />
```

See [tools/image-studio/README.md](./tools/image-studio/README.md) for full documentation including AI generation and Astro dev toolbar integration.

### 5. Customize Components

All section components accept props for customization:

```astro
<Hero
  title="Welcome"
  subtitle="Tagline"
  description="Description text"
  variant="overlay"  <!-- simple | centered | split | overlay -->
  image={heroImage}
  primaryCta={{ text: "Contact", href: "/contact" }}
/>
```

## Available Components

### Sections
- `Hero` - Hero section (4 variants: simple, centered, split, overlay)
- `Services` - Service cards grid
- `About` - About section with features
- `Team` - Team member cards
- `Testimonials` - Customer reviews
- `CTA` - Call-to-action section
- `Contact` - Contact form and info
- `FAQ` - Accordion FAQ
- `Gallery` - Image gallery grid

### Common
- `Button` - Button/link component
- `Container` - Content container
- `ThemeToggle` - Dark mode toggle
- `OptimizedImage` - Image with fallback

### SEO
- `LocalBusinessSchema` - JSON-LD structured data
- `BreadcrumbSchema` - Breadcrumb structured data

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Performance

This template is optimized for high Lighthouse scores:
- Images are automatically optimized to WebP
- CSS is minimal and scoped
- JavaScript is minimal (view transitions only)
- Fonts use system stack (no external fonts)

## Deployment

Pre-configured for one-click deployment:

### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hoyere/astro-local-business-v2)

Or use the CLI:
```bash
npm run build
npx vercel --prod
```

### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/hoyere/astro-local-business-v2)

Or use the CLI:
```bash
npm run build
npx netlify deploy --prod --dir=dist
```

Configuration files included: `vercel.json`, `netlify.toml`

---

## Documentation

Comprehensive documentation is included in the `docs/` folder:

### Workflow Guides
| Document | Purpose |
|----------|---------|
| [TEMPLATE_CUSTOMIZATION.md](./docs/TEMPLATE_CUSTOMIZATION.md) | Step-by-step client setup |
| [IMAGE_WORKFLOW.md](./docs/IMAGE_WORKFLOW.md) | Two-phase image workflow |
| [COMMON_EDITS.md](./docs/COMMON_EDITS.md) | Quick reference for frequent changes |
| [THEME_APPLICATION_GUIDE.md](./docs/THEME_APPLICATION_GUIDE.md) | Theming guide with OKLCH colors |

### Quality & Standards
| Document | Purpose |
|----------|---------|
| [AUDIT_V2_TEMPLATE_QUICK.md](./docs/AUDIT_V2_TEMPLATE_QUICK.md) | Pre-ship audit checklist |
| [CODE_STYLE_GUIDE.md](./docs/CODE_STYLE_GUIDE.md) | Code conventions |
| [POST_DEV_CLEANUP.md](./docs/POST_DEV_CLEANUP.md) | Cleanup checklist |
| [ACCESSIBILITY_CHECKLIST.md](./docs/ACCESSIBILITY_CHECKLIST.md) | A11y requirements |

### Audit System (v2)
| Document | Purpose |
|----------|---------|
| [AUDIT_v2_INDEX.md](./docs/AUDIT_v2_INDEX.md) | Audit system overview |
| [AUDIT_v2_1_CODE.md](./docs/AUDIT_v2_1_CODE.md) | Code quality standards |
| [AUDIT_v2_2_STRUCTURE.md](./docs/AUDIT_v2_2_STRUCTURE.md) | Directory structure |
| [AUDIT_v2_3_CONTENT.md](./docs/AUDIT_v2_3_CONTENT.md) | Content quality |
| [AUDIT_v2_4_THEME_PREP.md](./docs/AUDIT_v2_4_THEME_PREP.md) | Theme preparation |
| [AUDIT_v2_5_THEME_APPLY.md](./docs/AUDIT_v2_5_THEME_APPLY.md) | Theme application |

## License

MIT License - feel free to use for personal or commercial projects.

## Credits

Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com).
