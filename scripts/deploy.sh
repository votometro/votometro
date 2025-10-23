#!/usr/bin/env bash
set -euo pipefail

WORKER_NAME="votometro-frontend-${STAGE:-$USER}"

echo "Building frontend..."
pnpm --filter @votometro/frontend build

echo "Deploying frontend as '${WORKER_NAME}'..."
wrangler deploy --config frontend/wrangler.toml --name "${WORKER_NAME}"

echo "✓ Deployment complete!"
