import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // Do NOT isolate @react-pdf in its own chunk: it breaks in production
            // ("re is not a function" – React.createElement ref). PDF code is only
            // loaded via dynamic import() when generating PDFs.
            // Split main vendor into smaller chunks to stay under 500 kB and avoid the warning
            {
              name: 'react-vendor',
              test: /node_modules[\\/]react(-dom)?[\\/]/,
              priority: 40,
            },
            {
              name: 'tanstack',
              test: /node_modules[\\/]@tanstack[\\/]/,
              priority: 35,
            },
            {
              name: 'recharts',
              test: /node_modules[\\/]recharts[\\/]/,
              priority: 35,
            },
            {
              name: 'radix',
              test: /node_modules[\\/]@radix-ui[\\/]/,
              priority: 35,
            },
            {
              name: 'vendor',
              test: /node_modules/,
              priority: 10,
              maxSize: 450_000, // target ~450KB so no chunk triggers the 500 kB warning
            },
          ],
        },
      },
    },
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
     tailwindcss(),
  ],
   resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
