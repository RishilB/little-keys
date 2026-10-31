import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the same build works at a domain root and under
  // a sub-path such as GitHub Pages' https://<user>.github.io/little-keys/.
  base: './',
  server: { port: 5173 },
});
