import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "/ai-code-intelligence-frontend/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@assets": path.resolve(__dirname, "./attached_assets"),
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('https://huggingface.co/spaces/YOUR_USERNAME/ai-code-intelligence-backend'),
    'import.meta.env.VITE_WS_URL': JSON.stringify('wss://YOUR_USERNAME-ai-code-intelligence-backend.hf.space'),
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
});