import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

// Plugin to copy index.html to sub-paths so Tauri can load /setup and /settings
function tauriSpaFallback() {
  return {
    name: 'tauri-spa-fallback',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const indexHtml = resolve(distDir, 'index.html');
      // Read the built index.html
      const { readFileSync } = require('fs');
      const html = readFileSync(indexHtml, 'utf-8');
      // Create copies for each Tauri window route
      for (const route of ['setup', 'settings']) {
        const dir = resolve(distDir, route);
        mkdirSync(dir, { recursive: true });
        writeFileSync(resolve(dir, 'index.html'), html);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), tauriSpaFallback()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    target: process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
}));
