import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // The API port comes from the repo-root .env, the same file the server reads.
  const env = loadEnv(mode, fileURLToPath(new URL("..", import.meta.url)), "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      // Must match CLIENT_ORIGIN in .env (the API only allows that origin for CORS).
      port: 5173,
      strictPort: true,
      // The browser calls /api/... on the Vite server, which forwards to the Express API.
      proxy: { "/api": `http://localhost:${env.PORT ?? 4000}` },
    },
  };
});
