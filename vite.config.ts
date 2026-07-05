import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  base: "./",
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
  },
  preview: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    target: "es2020",
    cssCodeSplit: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-router")) return "router";
            if (id.includes("react-dom") || id.includes("/react/") || id.includes("scheduler")) return "react";
            if (id.includes("@radix-ui")) return "radix";
            if (id.includes("lucide-react")) return "icons";
            if (id.includes("@tanstack")) return "tanstack";
            if (id.includes("@supabase")) return "supabase";
            if (id.includes("recharts") || id.includes("d3-")) return "charts";
            if (id.includes("embla-carousel")) return "carousel";
            if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("zod")) return "forms";
            if (id.includes("date-fns") || id.includes("react-day-picker")) return "dates";
            if (id.includes("@fontsource")) return "fonts";
            if (id.includes("sonner") || id.includes("vaul") || id.includes("cmdk") || id.includes("input-otp")) return "ui-extras";
            if (id.includes("react-helmet")) return "helmet";
          }
        },
      },
    },
  },
});