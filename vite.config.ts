import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// Plugin to remove preload links for react-pdf chunk
const removeReactPdfPreload = () => {
  return {
    name: 'remove-react-pdf-preload',
    transformIndexHtml(html: string) {
      // Remove modulepreload links for react-pdf chunk
      return html.replace(
        /<link[^>]*rel="modulepreload"[^>]*react-pdf[^>]*>/gi,
        ''
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), removeReactPdfPreload()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create a separate chunk for react-pdf so it's only loaded when needed
          // This prevents it from being included in the main bundle
          if (id.includes('@react-pdf/renderer') || id.includes('react-pdf')) {
            return 'react-pdf';
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
