import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Explicitly exclude @react-pdf/renderer from manual chunking
          // This ensures it's only loaded via dynamic imports, not preloaded
          if (id.includes('@react-pdf/renderer') || id.includes('react-pdf')) {
            return undefined; // Let dynamic imports handle it, don't create manual chunk
          }
          
          // Only chunk other vendor libraries
          if (id.includes('node_modules')) {
            // React and core libraries
            if (id.includes('react') && (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router-dom/'))) {
              return 'react-vendor';
            }
            
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }
            
            // UI libraries
            if (id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            
            // Redux
            if (id.includes('react-redux') || id.includes('@reduxjs/toolkit')) {
              return 'redux-vendor';
            }
          }
          
          // Return undefined for everything else
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB to reduce warnings for acceptable chunks
  },
})
