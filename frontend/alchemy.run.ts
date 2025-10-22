import "dotenv/config";
import alchemy from "alchemy";
import { CloudflareStateStore } from "alchemy/state";
import { Astro } from "alchemy/cloudflare";

const app = await alchemy("votometro", {
  stateStore: (scope) => new CloudflareStateStore(scope),
});

export const worker = await Astro("votometro-frontend");

console.log({
  url: worker.url,
});

await app.finalize();
