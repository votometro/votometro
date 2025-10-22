# Deployment

This project uses [Alchemy](https://alchemy.run) for continuous deployment to Cloudflare Workers.

## First Time Setup

Before deploying, you need to set up your environment:

1. **Generate state token**
   ```bash
   openssl rand -base64 32
   ```

2. **Add to `.env` file** (`frontend/.env`)
   ```
   ALCHEMY_PASSWORD=<your-secure-password>
   ALCHEMY_STATE_TOKEN=<token-from-step-1>
   ```

   Note: The `ALCHEMY_STATE_TOKEN` must be the same across all deployments on your Cloudflare account.

## Manual Deployment

### First Time Setup

*Configure Alchemy profile** (one-time)
  ```bash
  pnpm alchemy configure
  ```

OAuth authentication is easiest.

### Deploy

**Authenticate with Cloudflare** (only if logged out)

```bash
pnpm alchemy login
```


```bash
pnpm run deploy
```

### Destroy Resources

```bash
pnpm run destroy
```

## Continuous Deployment (GitHub Actions)

Pushes to the `main` branch automatically deploy to production via GitHub Actions.

### Required GitHub Secrets

Configure these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

1. **`ALCHEMY_PASSWORD`**
   Encryption password for secrets. Use the same value as in your local `.env` file.

2. **`ALCHEMY_STATE_TOKEN`**
   State management token. Generate using:
   ```bash
   cd frontend
   pnpm exec alchemy token create
   ```
   Or follow the Alchemy CLI instructions to create a token matching your Alchemy profile.

3. **`CLOUDFLARE_API_TOKEN`**
   Cloudflare API token with permissions for Workers deployment.
   - Go to [Cloudflare Dashboard → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Create a token with "Edit Cloudflare Workers" permissions

4. **`CLOUDFLARE_EMAIL`**
   Your Cloudflare account email address.

### Workflow

- **Production**: Pushes to `main` trigger automatic deployment to production
- **Preview Environments**: Not yet configured (can be added later for PR previews)

## Future Enhancements

To enable PR preview environments:
1. Update `frontend/alchemy.run.ts` to add `GitHubComment` integration
2. Modify `.github/workflows/deploy.yml` to include PR triggers and cleanup jobs
3. Add `id-token: write` and `pull-requests: write` permissions to the workflow
