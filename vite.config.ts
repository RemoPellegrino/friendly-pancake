import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['icon.svg'],
    manifest: {
      name: 'Gamify Music Theory', short_name: 'Music Theory',
      description: 'Playful offline practice for musical notes and rests.',
      theme_color: '#6251c8', background_color: '#f0f4ff', display: 'standalone',
      start_url: '/', icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
    },
    workbox: { globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'], cleanupOutdatedCaches: true, navigateFallback: '/index.html' },
  })],
});
