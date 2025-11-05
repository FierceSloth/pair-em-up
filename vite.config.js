import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    minify: false,
    cssMinify: false,
    sourcemap: true,
  },
  css: {
    devSourcemap: true,
  },
  server: {
    port: 7777,
  },
});
