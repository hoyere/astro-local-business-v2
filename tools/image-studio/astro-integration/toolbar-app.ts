/**
 * Image Studio - Astro Dev Toolbar App
 *
 * This is the main toolbar app that provides the UI for:
 * - Searching Unsplash images
 * - Generating AI images
 * - Replacing images in the page
 */

import type { DevToolbarApp } from 'astro';

const API_BASE = 'http://localhost:3847';

interface ImageInfo {
  src: string;
  alt: string;
  element?: HTMLElement;
  rect?: { top: number; left: number; width: number; height: number };
}

interface UnsplashResult {
  id: string;
  urls: { small: string; regular: string };
  description: string;
  author: { name: string; url: string };
}

interface ApiStatus {
  unsplash: boolean;
  openai: boolean;
  outputDir: string;
}

export default {
  id: 'image-studio',
  name: 'Image Studio',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,

  init(canvas, app, server) {
    let currentImage: ImageInfo | null = null;
    let apiStatus: ApiStatus | null = null;

    // Create the UI
    const container = document.createElement('div');
    container.innerHTML = getUITemplate();
    canvas.appendChild(container);

    // Get UI elements
    const panel = container.querySelector('.image-studio-panel') as HTMLElement;
    const tabBtns = container.querySelectorAll('.tab-btn');
    const tabPanels = container.querySelectorAll('.tab-panel');
    const searchInput = container.querySelector('#unsplash-search') as HTMLInputElement;
    const searchBtn = container.querySelector('#search-btn') as HTMLButtonElement;
    const searchResults = container.querySelector('#search-results') as HTMLElement;
    const generateInput = container.querySelector('#generate-prompt') as HTMLTextAreaElement;
    const generateBtn = container.querySelector('#generate-btn') as HTMLButtonElement;
    const generateResult = container.querySelector('#generate-result') as HTMLElement;
    const statusEl = container.querySelector('#api-status') as HTMLElement;
    const currentImgEl = container.querySelector('#current-image') as HTMLImageElement;
    const currentAltEl = container.querySelector('#current-alt') as HTMLElement;

    // Check API status on load
    checkApiStatus();

    // Tab switching
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        container.querySelector(`#${tab}-panel`)?.classList.add('active');
      });
    });

    // Unsplash search
    searchBtn.addEventListener('click', () => searchUnsplash());
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchUnsplash();
    });

    // AI Generate
    generateBtn.addEventListener('click', () => generateImage());

    // Listen for image-studio:open events from the page
    window.addEventListener('image-studio:open', ((e: CustomEvent<ImageInfo>) => {
      currentImage = e.detail;
      showPanel();
      updateCurrentImage();
    }) as EventListener);

    // Listen for app toggle
    app.onToggled(({ state }) => {
      if (state) {
        panel.classList.add('visible');
      } else {
        panel.classList.remove('visible');
      }
    });

    async function checkApiStatus() {
      try {
        const res = await fetch(`${API_BASE}/api/status`);
        const data = await res.json();
        if (data.success) {
          apiStatus = data.data;
          updateStatusUI();
        }
      } catch (err) {
        statusEl.innerHTML = `<span class="status-error">API server not running. Start with: image-studio server</span>`;
      }
    }

    function updateStatusUI() {
      if (!apiStatus) return;
      const parts = [];
      if (apiStatus.unsplash) parts.push('Unsplash ✓');
      if (apiStatus.openai) parts.push('OpenAI ✓');
      statusEl.innerHTML = `<span class="status-ok">${parts.join(' | ')}</span>`;

      // Disable tabs if not available
      if (!apiStatus.unsplash) {
        container.querySelector('[data-tab="unsplash"]')?.classList.add('disabled');
      }
      if (!apiStatus.openai) {
        container.querySelector('[data-tab="generate"]')?.classList.add('disabled');
      }
    }

    function showPanel() {
      panel.classList.add('visible');
      app.toggleNotification({ state: true });
    }

    function updateCurrentImage() {
      if (!currentImage) return;
      currentImgEl.src = currentImage.src;
      currentAltEl.textContent = currentImage.alt || 'No alt text';

      // Pre-fill search with alt text
      if (currentImage.alt) {
        searchInput.value = currentImage.alt;
      }
    }

    async function searchUnsplash() {
      const query = searchInput.value.trim();
      if (!query) return;

      searchBtn.disabled = true;
      searchBtn.textContent = 'Searching...';
      searchResults.innerHTML = '<div class="loading">Searching Unsplash...</div>';

      try {
        const res = await fetch(`${API_BASE}/api/unsplash/search?q=${encodeURIComponent(query)}&perPage=12`);
        const data = await res.json();

        if (data.success && data.data.results.length > 0) {
          renderSearchResults(data.data.results);
        } else {
          searchResults.innerHTML = '<div class="no-results">No results found</div>';
        }
      } catch (err) {
        searchResults.innerHTML = '<div class="error">Search failed. Is the API server running?</div>';
      } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
      }
    }

    function renderSearchResults(results: UnsplashResult[]) {
      searchResults.innerHTML = results.map(img => `
        <div class="result-item" data-regular="${img.urls.regular}" data-id="${img.id}">
          <img src="${img.urls.small}" alt="${img.description || ''}" loading="lazy" />
          <div class="result-overlay">
            <span class="author">by ${img.author.name}</span>
            <button class="use-btn">Use This</button>
          </div>
        </div>
      `).join('');

      // Add click handlers
      searchResults.querySelectorAll('.use-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const item = (e.target as HTMLElement).closest('.result-item') as HTMLElement;
          const url = item.dataset.regular;
          if (url) useImage(url);
        });
      });
    }

    async function generateImage() {
      const prompt = generateInput.value.trim();
      if (!prompt) return;

      generateBtn.disabled = true;
      generateBtn.textContent = 'Generating...';
      generateResult.innerHTML = '<div class="loading">Generating image with AI...</div>';

      try {
        const res = await fetch(`${API_BASE}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, style: 'natural', quality: 'standard' })
        });
        const data = await res.json();

        if (data.success) {
          const img = data.data;
          generateResult.innerHTML = `
            <div class="generated-item">
              <img src="${img.originalUrl}" alt="${img.prompt}" />
              <div class="generated-info">
                <p class="revised-prompt">${img.revisedPrompt || img.prompt}</p>
                <button class="use-btn" data-url="${img.originalUrl}">Use This</button>
              </div>
            </div>
          `;

          generateResult.querySelector('.use-btn')?.addEventListener('click', (e) => {
            const url = (e.target as HTMLElement).dataset.url;
            if (url) useImage(url);
          });
        } else {
          generateResult.innerHTML = `<div class="error">${data.error}</div>`;
        }
      } catch (err) {
        generateResult.innerHTML = '<div class="error">Generation failed. Is the API server running?</div>';
      } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate';
      }
    }

    function useImage(url: string) {
      if (currentImage?.element) {
        // Replace the image in the page
        window.dispatchEvent(new CustomEvent('image-studio:replace', {
          detail: {
            originalSrc: currentImage.src,
            newSrc: url,
            element: currentImage.element
          }
        }));

        // Show success message
        const toast = document.createElement('div');
        toast.className = 'image-studio-toast';
        toast.textContent = 'Image replaced! (Note: This is temporary - download to keep)';
        canvas.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
      }
    }

    function getUITemplate() {
      return `
        <style>
          .image-studio-panel {
            position: fixed;
            bottom: 60px;
            right: 20px;
            width: 400px;
            max-height: 600px;
            background: #1e1e2e;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            font-family: system-ui, -apple-system, sans-serif;
            color: #cdd6f4;
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 999999;
          }
          .image-studio-panel.visible {
            display: flex;
          }
          .panel-header {
            padding: 16px;
            background: #313244;
            border-bottom: 1px solid #45475a;
          }
          .panel-header h2 {
            margin: 0 0 8px;
            font-size: 16px;
            font-weight: 600;
            color: #cba6f7;
          }
          #api-status {
            font-size: 12px;
          }
          .status-ok { color: #a6e3a1; }
          .status-error { color: #f38ba8; }

          .current-image-section {
            padding: 12px 16px;
            background: #262637;
            border-bottom: 1px solid #45475a;
            display: flex;
            gap: 12px;
            align-items: center;
          }
          #current-image {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 6px;
            background: #313244;
          }
          #current-alt {
            font-size: 12px;
            color: #a6adc8;
            flex: 1;
          }

          .tabs {
            display: flex;
            border-bottom: 1px solid #45475a;
          }
          .tab-btn {
            flex: 1;
            padding: 10px;
            background: none;
            border: none;
            color: #a6adc8;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s;
          }
          .tab-btn:hover { background: #313244; }
          .tab-btn.active {
            color: #cba6f7;
            border-bottom: 2px solid #cba6f7;
          }
          .tab-btn.disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }

          .tab-panel {
            display: none;
            padding: 16px;
            flex-direction: column;
            gap: 12px;
            max-height: 400px;
            overflow-y: auto;
          }
          .tab-panel.active { display: flex; }

          .search-row {
            display: flex;
            gap: 8px;
          }
          input, textarea {
            flex: 1;
            padding: 10px 12px;
            background: #313244;
            border: 1px solid #45475a;
            border-radius: 6px;
            color: #cdd6f4;
            font-size: 14px;
          }
          input:focus, textarea:focus {
            outline: none;
            border-color: #cba6f7;
          }
          textarea {
            min-height: 80px;
            resize: vertical;
          }

          button {
            padding: 10px 16px;
            background: #cba6f7;
            border: none;
            border-radius: 6px;
            color: #1e1e2e;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          button:hover { background: #b4befe; }
          button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          #search-results, #generate-result {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
          .result-item {
            position: relative;
            aspect-ratio: 1;
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;
          }
          .result-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .result-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.2s;
          }
          .result-item:hover .result-overlay { opacity: 1; }
          .author {
            font-size: 10px;
            color: #a6adc8;
            margin-bottom: 8px;
          }
          .use-btn {
            padding: 6px 12px;
            font-size: 12px;
          }

          .generated-item {
            grid-column: 1 / -1;
          }
          .generated-item img {
            width: 100%;
            border-radius: 6px;
          }
          .generated-info {
            margin-top: 12px;
          }
          .revised-prompt {
            font-size: 12px;
            color: #a6adc8;
            margin: 0 0 12px;
          }

          .loading, .no-results, .error {
            grid-column: 1 / -1;
            text-align: center;
            padding: 20px;
            color: #a6adc8;
          }
          .error { color: #f38ba8; }

          .image-studio-toast {
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: #a6e3a1;
            color: #1e1e2e;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            animation: slideUp 0.3s ease;
          }
          @keyframes slideUp {
            from { transform: translateX(-50%) translateY(20px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
          }
        </style>

        <div class="image-studio-panel">
          <div class="panel-header">
            <h2>Image Studio</h2>
            <div id="api-status">Checking API...</div>
          </div>

          <div class="current-image-section">
            <img id="current-image" src="" alt="" />
            <div id="current-alt">Shift+Right-click an image to select it</div>
          </div>

          <div class="tabs">
            <button class="tab-btn active" data-tab="unsplash">Unsplash</button>
            <button class="tab-btn" data-tab="generate">AI Generate</button>
          </div>

          <div id="unsplash-panel" class="tab-panel active">
            <div class="search-row">
              <input type="text" id="unsplash-search" placeholder="Search Unsplash..." />
              <button id="search-btn">Search</button>
            </div>
            <div id="search-results"></div>
          </div>

          <div id="generate-panel" class="tab-panel">
            <textarea id="generate-prompt" placeholder="Describe the image you want to generate..."></textarea>
            <button id="generate-btn">Generate</button>
            <div id="generate-result"></div>
          </div>
        </div>
      `;
    }
  }
} satisfies DevToolbarApp;
