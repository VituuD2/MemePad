import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Crucial for GitHub Pages to load assets correctly from a subfolder
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  publicDir: 'public', // Ensures files in /public are copied to root of /dist
});