import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sanity from "@sanity/astro";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),

  vite: {
    plugins: [tailwindcss()] as any,
    ssr: {
      noExternal: ["@tailwindcss/vite"],
    },
  },

  integrations: [
    react(),
    sanity({
      projectId: "h9gt2zpk",
      dataset: "production",
      useCdn: process.env.NODE_ENV === "production",
    }),
  ],
});
