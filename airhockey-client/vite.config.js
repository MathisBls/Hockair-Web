import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    watch: {
      usePolling: true,
    },
    hmr: {
      overlay: true,
    },
  },
  assetsInclude: ['**/*.gltf', '**/*.glb'],
  optimizeDeps: {
    include: ['@mui/icons-material']
  }
});
