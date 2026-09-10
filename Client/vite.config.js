import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
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