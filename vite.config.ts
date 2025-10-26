import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      {
        name: "custom-message", // Nom du plugin
        configureServer(server) {
          console.log("\x1b[36m%s\x1b[0m", "🚀 Vite server is starting..."); // Message personnalisé en cyan
          console.log(
            "\x1b[32m%s\x1b[0m",
            "🌟 Aether Mail Frontend is ready to go!",
          );
        },
        buildStart() {
          console.log(
            "\x1b[33m%s\x1b[0m",
            "📦 Building Aether Mail Frontend...",
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
      chunkSizeWarningLimit: 1000, // Augmente la limite à 1 Mo
    },
  };
});
