/** Bundle Size Optimization with Tree Shaking */
import { defineConfig } from 'vite';
export default defineConfig({
  build: {
    rollupOptions: {
      output: { manualChunks: { vendor: ['react', 'react-dom'], ui: ['@headlessui/react'] } }
    },
    minify: 'terser',
    terserOptions: { compress: { drop_console: true } }
  }
});

