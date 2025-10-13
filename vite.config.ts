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
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // Redux ecosystem
            if (id.includes('@reduxjs') || id.includes('react-redux')) {
              return 'redux-vendor';
            }
            // UI libraries
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('@tanstack/react-form') || id.includes('zod')) {
              return 'form-vendor';
            }
            // Query libraries
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            // Chart libraries
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            // PDF libraries
            if (id.includes('@react-pdf')) {
              return 'pdf-vendor';
            }
            // Utility libraries
            if (id.includes('lodash') || id.includes('date-fns') || id.includes('axios') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils-vendor';
            }
            // i18n libraries
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-vendor';
            }
            // DnD libraries
            if (id.includes('@dnd-kit')) {
              return 'dnd-vendor';
            }
            // Motion libraries
            if (id.includes('motion') || id.includes('lucide-react')) {
              return 'motion-vendor';
            }
            // Other vendor libraries
            return 'vendor';
          }

          // Split large components into separate chunks
          if (id.includes('src/screens/Erp/forms/IncomingOrderFormContent')) {
            return 'incoming-form';
          }
          if (id.includes('src/screens/Erp/forms/OutgoingOrderFormContent')) {
            return 'outgoing-form';
          }
          if (id.includes('src/screens/Erp/forms/EditIncomingOrderFormContent')) {
            return 'edit-form';
          }
          if (id.includes('src/components/pdf/')) {
            return 'pdf-components';
          }
          if (id.includes('src/components/charts/')) {
            return 'chart-components';
          }
          if (id.includes('src/screens/Erp/')) {
            return 'erp-screens';
          }
          if (id.includes('src/screens/')) {
            return 'screens';
          }
          if (id.includes('src/components/')) {
            return 'components';
          }
        },
        chunkFileNames: () => {
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash].[ext]';
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    // Enable source maps for better debugging
    sourcemap: true,
    // Optimize chunk size - increased limit but with better chunking
    chunkSizeWarningLimit: 1500,
    // Enable minification with esbuild (faster than terser)
    minify: 'esbuild',
    // Target modern browsers for smaller bundles
    target: 'esnext',
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      '@tanstack/react-query',
      'axios',
      'lodash',
      'date-fns'
    ],
  },
})
