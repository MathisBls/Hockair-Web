import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()], // Ajoute le support React
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
    include: ['@mui/icons-material'],
  },
});
