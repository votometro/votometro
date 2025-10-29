#!/usr/bin/env bash
set -euo pipefail

WORKER_NAME="votomatic-frontend-${STAGE:-$USER}"

echo "Building frontend..."
pnpm --filter @votomatic/frontend build

echo "Deploying frontend as '${WORKER_NAME}'..."
wrangler deploy --config frontend/wrangler.toml --name "${WORKER_NAME}"

echo "Building Sanity studio..."
pnpm --filter @votomatic/content build

echo "Deploying Sanity studio..."
pnpm --filter @votomatic/content run deploy

echo "✓ Deployment complete!"
