import type { ImageMetadata } from 'astro';

/**
 * Import all images from src/assets/images
 * Using eager loading for build-time resolution
 */
const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/**/*.{jpeg,jpg,png,gif,webp,svg}',
  { eager: true }
);

/**
 * Get a specific image by path relative to src/assets/images/
 * @example getImage('photos/hero.jpg')
 */
export function getImage(relativePath: string): ImageMetadata | undefined {
  const fullPath = `/src/assets/images/${relativePath}`;
  return imageModules[fullPath]?.default;
}

/**
 * Get all images from a specific folder
 * @example getImages('photos') // Returns all images in photos/
 */
export function getImages(folder: string): ImageMetadata[] {
  const prefix = `/src/assets/images/${folder}/`;
  return Object.entries(imageModules)
    .filter(([path]) => path.startsWith(prefix))
    .map(([, module]) => module.default);
}

/**
 * Get image or throw error if not found
 * Use when image is required
 */
export function getImageRequired(relativePath: string): ImageMetadata {
  const image = getImage(relativePath);
  if (!image) {
    throw new Error(`Required image not found: ${relativePath}`);
  }
  return image;
}

/**
 * Check if an image exists
 */
export function imageExists(relativePath: string): boolean {
  const fullPath = `/src/assets/images/${relativePath}`;
  return fullPath in imageModules;
}
