import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      // The admin console is served at /admin on the same domain. Without this,
      // the customer app's service worker would serve index.html for /admin
      // navigations (SPA fallback) and the admin would never load.
      workbox: {
        navigateFallbackDenylist: [/^\/admin/],
      },
      manifest: {
        name: 'TellaTrust',
        short_name: 'TellaTrust',
        description: 'Save, invest and grow your money.',
        theme_color: '#0F2A18',
        background_color: '#0B0F0C',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  server: { port: 5173 },
});
