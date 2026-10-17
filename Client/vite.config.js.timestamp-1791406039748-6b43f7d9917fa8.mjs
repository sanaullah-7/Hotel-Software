// vite.config.js
import { defineConfig } from "file:///C:/Users/Admin/Desktop/Saylani-Bootcamp/HotelManagement/Client/node_modules/vite/dist/node/index.js";
import tailwindcss from "file:///C:/Users/Admin/Desktop/Saylani-Bootcamp/HotelManagement/Client/node_modules/@tailwindcss/vite/dist/index.mjs";
import react from "file:///C:/Users/Admin/Desktop/Saylani-Bootcamp/HotelManagement/Client/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  // Memory optimization: limit chunk size and pre-bundle only what's needed
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@mui/material",
      "@mui/icons-material",
      "@emotion/react",
      "@emotion/styled",
      "jspdf",
      "jspdf-autotable",
      "xlsx",
      "react",
      "react-dom",
      "react-router-dom"
    ],
    esbuildOptions: {
      target: "es2020"
    }
  },
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 1e3
  },
  // Vitest ko batao ke frontend/React tests kis environment mein aur kis setup ke saath run karne hain.
  test: {
    // React browser mein chalta hai. Test ke waqt actual browser open nahi karna chahte.
    // jsdom ek fake browser environment provide karta hai.
    environment: "jsdom",
    globals: true,
    //"Vitest, test run karne se pehle ye setup.js file chala dena."
    setupFiles: "./src/test/setup.js"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pblxcXFxEZXNrdG9wXFxcXFNheWxhbmktQm9vdGNhbXBcXFxcSG90ZWxNYW5hZ2VtZW50XFxcXENsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcQWRtaW5cXFxcRGVza3RvcFxcXFxTYXlsYW5pLUJvb3RjYW1wXFxcXEhvdGVsTWFuYWdlbWVudFxcXFxDbGllbnRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0FkbWluL0Rlc2t0b3AvU2F5bGFuaS1Cb290Y2FtcC9Ib3RlbE1hbmFnZW1lbnQvQ2xpZW50L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJ1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICB0YWlsd2luZGNzcygpLFxyXG4gIF0sXHJcbiAgLy8gTWVtb3J5IG9wdGltaXphdGlvbjogbGltaXQgY2h1bmsgc2l6ZSBhbmQgcHJlLWJ1bmRsZSBvbmx5IHdoYXQncyBuZWVkZWRcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGluY2x1ZGU6IFtcclxuICAgICAgJ3JlYWN0JyxcclxuICAgICAgJ3JlYWN0LWRvbScsXHJcbiAgICAgICdyZWFjdC1yb3V0ZXItZG9tJyxcclxuICAgICAgJ0BtdWkvbWF0ZXJpYWwnLFxyXG4gICAgICAnQG11aS9pY29ucy1tYXRlcmlhbCcsXHJcbiAgICAgICdAZW1vdGlvbi9yZWFjdCcsXHJcbiAgICAgICdAZW1vdGlvbi9zdHlsZWQnLFxyXG4gICAgICAnanNwZGYnLFxyXG4gICAgICAnanNwZGYtYXV0b3RhYmxlJyxcclxuICAgICAgJ3hsc3gnLFxyXG4gICAgICAncmVhY3QnLFxyXG4gICAgICAncmVhY3QtZG9tJyxcclxuICAgICAgJ3JlYWN0LXJvdXRlci1kb20nXHJcbiAgICBdLFxyXG4gICAgZXNidWlsZE9wdGlvbnM6IHtcclxuICAgICAgdGFyZ2V0OiAnZXMyMDIwJyxcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgdGFyZ2V0OiAnZXMyMDIwJyxcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcclxuICB9LFxyXG4gIC8vIFZpdGVzdCBrbyBiYXRhbyBrZSBmcm9udGVuZC9SZWFjdCB0ZXN0cyBraXMgZW52aXJvbm1lbnQgbWVpbiBhdXIga2lzIHNldHVwIGtlIHNhYXRoIHJ1biBrYXJuZSBoYWluLlxyXG4gIHRlc3Q6IHtcclxuICAgIC8vIFJlYWN0IGJyb3dzZXIgbWVpbiBjaGFsdGEgaGFpLiBUZXN0IGtlIHdhcXQgYWN0dWFsIGJyb3dzZXIgb3BlbiBuYWhpIGthcm5hIGNoYWh0ZS5cclxuICAgIC8vIGpzZG9tIGVrIGZha2UgYnJvd3NlciBlbnZpcm9ubWVudCBwcm92aWRlIGthcnRhIGhhaS5cclxuICAgIGVudmlyb25tZW50OiBcImpzZG9tXCIsXHJcbiAgICBnbG9iYWxzOiB0cnVlLFxyXG4gICAgLy9cIlZpdGVzdCwgdGVzdCBydW4ga2FybmUgc2UgcGVobGUgeWUgc2V0dXAuanMgZmlsZSBjaGFsYSBkZW5hLlwiXHJcbiAgICBzZXR1cEZpbGVzOiBcIi4vc3JjL3Rlc3Qvc2V0dXAuanNcIixcclxuICB9LFxyXG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFBMFgsU0FBUyxvQkFBb0I7QUFDdlosT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxXQUFXO0FBRWxCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxFQUNkO0FBQUE7QUFBQSxFQUVBLGNBQWM7QUFBQSxJQUNaLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLElBQ0EsZ0JBQWdCO0FBQUEsTUFDZCxRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLHVCQUF1QjtBQUFBLEVBQ3pCO0FBQUE7QUFBQSxFQUVBLE1BQU07QUFBQTtBQUFBO0FBQUEsSUFHSixhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUE7QUFBQSxJQUVULFlBQVk7QUFBQSxFQUNkO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
