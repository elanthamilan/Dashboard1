import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Optional: set a default port
    open: true, // Optional: automatically open browser on server start
  },
  base: '/',
  build: {
    outDir: 'build', // Consistent with CRA's default and project description
  },
});
