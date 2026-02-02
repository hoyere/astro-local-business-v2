/**
 * Image Studio - Astro Integration
 *
 * Adds an Image Studio toolbar app to the Astro dev toolbar.
 * Enables Shift+Right-click on images to open the image picker.
 */

import type { AstroIntegration } from 'astro';
import { fileURLToPath } from 'url';
import path from 'path';

interface ImageStudioOptions {
  /** Port for the Image Studio API server (default: 3847) */
  port?: number;
  /** Output directory for images (default: src/assets/images/photos) */
  outputDir?: string;
  /** Enable verbose logging */
  verbose?: boolean;
}

export default function imageStudioIntegration(options: ImageStudioOptions = {}): AstroIntegration {
  const {
    port = 3847,
    outputDir = 'src/assets/images/photos',
    verbose = false
  } = options;

  return {
    name: 'image-studio',
    hooks: {
      'astro:config:setup': ({ addDevToolbarApp, config, logger }) => {
        // Add the dev toolbar app
        addDevToolbarApp({
          id: 'image-studio',
          name: 'Image Studio',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
          entrypoint: fileURLToPath(new URL('./toolbar-app.js', import.meta.url))
        });

        if (verbose) {
          logger.info('Image Studio toolbar app registered');
        }
      },

      'astro:server:setup': async ({ server, logger }) => {
        // Inject the image interceptor script into every page
        server.middlewares.use((req, res, next) => {
          const originalEnd = res.end.bind(res) as Function;
          let body = '';
          let isHtml = false;

          // Check content type header when set
          const originalSetHeader = res.setHeader.bind(res);
          res.setHeader = function(name: string, value: string | number | readonly string[]) {
            if (name.toLowerCase() === 'content-type' && String(value).includes('text/html')) {
              isHtml = true;
            }
            return originalSetHeader(name, value);
          };

          const originalWrite = res.write.bind(res) as Function;
          (res as any).write = function(chunk: any, encoding?: any, callback?: any) {
            const contentType = res.getHeader('content-type');
            if (contentType && String(contentType).includes('text/html')) {
              isHtml = true;
            }
            if (isHtml && chunk) {
              body += chunk.toString();
              return true;
            }
            return originalWrite(chunk, encoding, callback);
          };

          (res as any).end = function(chunk?: any, encoding?: any, callback?: any) {
            if (isHtml) {
              if (chunk) {
                body += chunk.toString();
              }

              // Inject the interceptor script before </body>
              const interceptorScript = `
<script>
(function() {
  const IMAGE_STUDIO_PORT = ${port};

  // Listen for Shift+Right-click on images
  document.addEventListener('contextmenu', function(e) {
    if (!e.shiftKey) return;

    const target = e.target;
    if (target.tagName !== 'IMG' && !target.style.backgroundImage) return;

    e.preventDefault();

    // Get image info
    const imgSrc = target.tagName === 'IMG'
      ? target.src
      : target.style.backgroundImage.replace(/url\\(['"]?([^'"\\)]+)['"]?\\)/, '$1');

    const imgAlt = target.alt || '';
    const rect = target.getBoundingClientRect();

    // Dispatch custom event for the toolbar app
    window.dispatchEvent(new CustomEvent('image-studio:open', {
      detail: {
        src: imgSrc,
        alt: imgAlt,
        element: target,
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
      }
    }));
  });

  // Listen for image replacement from toolbar
  window.addEventListener('image-studio:replace', function(e) {
    const { originalSrc, newSrc, element } = e.detail;
    if (element && element.tagName === 'IMG') {
      element.src = newSrc;
    }
  });
})();
</script>`;

              body = body.replace('</body>', interceptorScript + '</body>');
              res.setHeader('content-length', Buffer.byteLength(body));
              return originalEnd(body);
            }
            return originalEnd(chunk, encoding, callback);
          };

          next();
        });

        if (verbose) {
          logger.info('Image Studio interceptor middleware registered');
        }
      }
    }
  };
}

export { imageStudioIntegration };
