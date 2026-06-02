import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The admin console is served at /admin on the same Netlify site as the
// customer app, so its assets must be built under the /admin/ base path.
// It deliberately does NOT register a service worker — the customer PWA already
// owns the service worker for this origin, and a second one scoped to /admin
// would conflict. The admin is a normal SPA.
export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  server: { port: 5174 },
});
