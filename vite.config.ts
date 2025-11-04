import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      {
        name: "custom-message",
        configureServer(server) {
          console.log("\x1b[36m%s\x1b[0m", "🚀 Aether Mail V1 starting...");
          console.log(
            "\x1b[32m%s\x1b[0m",
            "🌟 Modern Dark UI Ready - Production Build",
          );
        },
        buildStart() {
          console.log(
            "\x1b[33m%s\x1b[0m",
            "📦 Building Aether Mail V1 Production...",
          );
        },
      },
    ],
    server: {
      port: 4000,
      watch: {
        usePolling: true,
      },
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"],
            ui: ["@heroicons/react"],
            utils: ["zustand", "axios", "clsx", "tailwind-merge"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
    },
  };
});
