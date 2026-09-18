import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Memory optimization: limit chunk size and pre-bundle only what's needed
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'jspdf',
      'jspdf-autotable',
      'xlsx',
      'react',
      'react-dom',
      'react-router-dom'
    ],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1000,
  },
  // Vitest ko batao ke frontend/React tests kis environment mein aur kis setup ke saath run karne hain.
  test: {
    // React browser mein chalta hai. Test ke waqt actual browser open nahi karna chahte.
    // jsdom ek fake browser environment provide karta hai.
    environment: "jsdom",
    globals: true,
    //"Vitest, test run karne se pehle ye setup.js file chala dena."
    setupFiles: "./src/test/setup.js",
  },
})