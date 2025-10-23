#!/usr/bin/env bash
set -euo pipefail

WORKER_NAME="votometro-frontend-${STAGE:-$USER}"

echo "Deleting worker'${WORKER_NAME}' from Cloudflare..."
wrangler delete --name "${WORKER_NAME}"

echo "✓ Worker deleted successfully!"
