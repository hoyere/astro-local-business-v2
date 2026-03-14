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

## Quick Start

```bash
# Clone the template
git clone https://github.com/hoyere/astro-local-business-v2.git my-business-site
cd my-business-site

# Remove template git history and start fresh
rm -rf .git
git init

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:4321 to see your site.

---

## Project Structure

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
├── content/
│   ├── services/        # Service markdown files
│   ├── team/            # Team member files
│   └── testimonials/    # Testimonial files
├── layouts/             # Page layouts (Base.astro)
├── pages/               # Route pages
├── styles/              # Global CSS with @theme tokens
├── content.config.ts    # Collection schemas (Astro 5.x)
└── site.config.ts       # Centralized business config
```

## Customization

### 1. Business Info
Edit `src/site.config.ts` with your business details (name, phone, email, address, hours, social links).

### 2. Brand Colors
Edit `src/styles/global.css` — update the `@theme` block with your brand colors in OKLCH format:

```css
@theme {
  --color-primary: oklch(0.55 0.2 250);
  --color-accent: oklch(0.70 0.18 50);
  /* ... */
}
```

### 3. Content
Edit markdown files in `src/content/services/`, `src/content/team/`, and `src/content/testimonials/`.

### 4. Images
Place photos in `src/assets/images/photos/` and reference them with static imports:

```astro
---
import { Image } from 'astro:assets';
import heroPhoto from '@assets/images/photos/hero.jpg';
---
<Image src={heroPhoto} alt="Description" />
```

## Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Deployment

Pre-configured for Vercel and Netlify:

```bash
npm run build
npx vercel --prod       # Vercel
npx netlify deploy --prod --dir=dist  # Netlify
```

Configuration files included: `vercel.json`, `netlify.toml`

## License

MIT License - feel free to use for personal or commercial projects.
