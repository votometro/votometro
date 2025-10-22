import alchemy from "alchemy";
import { Astro } from "alchemy/cloudflare";

if (!process.env.CI) {
  process.loadEnvFile();
}

const app = await alchemy("votometro");

export const worker = await Astro("frontend", {
  cwd: "frontend",
});

await app.finalize();
