import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    watch: { usePolling: true },
    // Requests to /api/* are forwarded to FastAPI, so the browser never
    // makes a cross-origin call and CORS doesn't come into play.
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET || "http://backend:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
