import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [react(), cesium()],
  define: { global: 'globalThis' },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'globe': ['globe.gl', 'three'],
          'charts': ['recharts'],
          'query': ['@tanstack/react-query'],
          'zustand': ['zustand'],
          'satellite': ['satellite.js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    target: 'esnext',
    minify: 'esbuild',
  },
  optimizeDeps: {
    include: ['globe.gl', 'three', 'react', 'react-dom', 'zustand', '@tanstack/react-query'],
    exclude: ['satellite.js'],
  },
  server: { hmr: { overlay: false } },
});

