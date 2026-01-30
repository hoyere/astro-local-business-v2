import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Services Collection
 * Define your business services here
 */
const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    image: image().optional(),
    features: z.array(z.string()).optional(),
    order: z.number().default(0),
    featured: z.boolean().default(false),
  }),
});

/**
 * Team Collection
 * Define team members here
 */
const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    role: z.string(),
    photo: image().optional(),
    bio: z.string().optional(),
    social: z.object({
      linkedin: z.string().url().optional(),
      twitter: z.string().url().optional(),
      email: z.string().email().optional(),
    }).optional(),
    order: z.number().default(0),
  }),
});

/**
 * Testimonials Collection
 * Customer reviews and testimonials
 */
const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: z.object({
    author: z.string(),
    company: z.string().optional(),
    role: z.string().optional(),
    rating: z.number().min(1).max(5).default(5),
    featured: z.boolean().default(false),
  }),
});

export const collections = { services, team, testimonials };
