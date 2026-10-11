import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";

// Standard client-only Vite setup — builds to dist/ with index.html as the
// entry point. Ships as an installable PWA (manifest + service worker).
export default defineConfig({
  plugins: [
    // Regenerates src/routeTree.gen.ts from src/routes/** on file changes.
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "MediTrust — QR Drug Counterfeit Verification",
        short_name: "MediTrust",
        description:
          "Verify medicine authenticity by scanning the QR code on the pack.",
        theme_color: "#107a55",
        background_color: "#f3faf6",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // SPA routing: fall back to the app shell for unmatched navigations.
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}"],
      },
      devOptions: {
        // Lets you test the service worker with `npm run dev` too.
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
  },
});
