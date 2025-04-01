import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";

import sanity from "@sanity/astro";

export default defineConfig({
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),

  integrations: [
    react(),
    sanity({
      projectId: "h9gt2zpk",
      dataset: "production",
      useCdn: false, // for static builds
    }),
  ],
});
