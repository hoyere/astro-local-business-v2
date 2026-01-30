// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com', // Update for each project

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap(),
  ],

  image: {
    // Allow remote images from these domains if needed
    domains: ['images.unsplash.com'],
  },
});
