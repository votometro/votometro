# Votómetro

Voting assistance application inspired by the German Wahl-O-Mat. Helps voters understand political party positions through thesis-based questionnaires.

## Tech Stack

**Frontend:** Astro, React, Tailwind CSS
**CMS:** Sanity Studio
**Hosting:** Cloudflare Pages (SSR)
**Email:** Resend
**Monorepo:** pnpm workspaces

## Project Structure

```
votometro/
├── frontend/              # Astro app (public site + API routes)
│   ├── src/
│   │   ├── pages/         # Routes and API endpoints
│   │   ├── components/    # React components
│   │   ├── server/        # Server utilities (Sanity client, email)
│   │   └── lib/           # Client utilities
│   └── public/            # Static assets
├── sanity/                # Sanity Studio (content management)
│   ├── schemaTypes/       # Content models
│   ├── documentActions/   # Custom Studio actions
│   └── components/        # Custom Studio components
└── scripts/               # Deployment scripts
```

## Prerequisites

- **Node.js:** v18+ (v22 recommended)
- **pnpm:** v10+
- **Accounts:**
  - [Sanity.io](https://www.sanity.io/) (free tier)
  - [Resend](https://resend.com/) (free tier: 100 emails/day)
  - [Cloudflare Pages](https://pages.cloudflare.com/) (free tier)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```bash
# Generate secrets
openssl rand -hex 32     # For SANITY_WEBHOOK_SECRET

# Get Resend API key from https://resend.com/api-keys
# Set your site URL (local or production)
```

**Important:** Create `/sanity/.env` with:

```bash
SANITY_STUDIO_API_URL=http://localhost:4321
SANITY_STUDIO_WEBHOOK_SECRET=<same-as-root-webhook-secret>
```

### 3. Start Development Servers

**Terminal 1 - Frontend:**
```bash
cd frontend
pnpm dev
```
Frontend runs at http://localhost:4321

**Terminal 2 - Sanity Studio:**
```bash
cd sanity
pnpm dev
```
Studio runs at http://localhost:3333

## Environment Variables

See `.env.example` for complete documentation. Key variables:

| Variable | Description | Where Used |
|----------|-------------|------------|
| `SITE_URL` | Public site URL for magic links | Frontend |
| `RESEND_API_KEY` | Resend API key | Frontend API |
| `RESEND_FROM_EMAIL` | Verified sender email | Frontend API |
| `SANITY_WEBHOOK_SECRET` | Sign Studio → API requests | Frontend + Sanity |
| `SANITY_STUDIO_API_URL` | Frontend API URL | Sanity |

## Core Features

### 1. Quiz Interface (`/`)
- Users answer theses (For/Neutral/Against)
- Real-time matching algorithm
- Results show party alignment

### 2. Party Submission Portal (`/partido/[token]`)
- Magic link authentication (token-based)
- Parties submit answers + justifications
- Auto-save, progress tracking
- Status workflow: draft → in_progress → submitted → approved

### 3. Editorial Workflow (Sanity Studio)
- Manage elections, parties, theses
- Invite parties via email
- Review submissions, request revisions
- Answer-level review status (pending/approved/needs_revision)
- Document actions: "Send Invitation", "Request Revisions"

## Development Workflow

### Running Tests

```bash
cd frontend
pnpm test
```

### Type Checking

```bash
cd frontend
pnpm typecheck
```

### Building

```bash
cd frontend
pnpm build
```

## Deployment

### Frontend (Cloudflare Pages)

```bash
pnpm deploy  # Runs scripts/deploy.sh
```

Or deploy via Cloudflare Pages dashboard:
- **Build command:** `cd frontend && pnpm build`
- **Build output:** `frontend/dist`
- **Root directory:** `/`

**Environment Variables:** Add all `.env` variables as secrets in Cloudflare Pages settings.

### Sanity Studio

```bash
cd sanity
pnpm deploy
```

Creates hosted studio at `https://<your-project>.sanity.studio`

**Important:** Update `SANITY_STUDIO_API_URL` to production URL after deploying frontend.

## Architecture Notes

### Data Model

- **Election:** Container for theses and party participations
- **Thesis:** Individual position statement (embedded in Election)
- **Party:** Political party (separate document, reusable)
- **PartyParticipation:** Party's answers for specific election (separate document)

### Party Submission Security

- Magic link tokens (`/partido/[token]`)
- Token validation on every API request
- Status-based authorization (can't edit after submission)
- Optional token expiration
- Deadline enforcement

### Editorial Email Workflow

1. **Invitation Email:**
   - Sent via Sanity Studio document action
   - Contains magic link + deadline
   - Updates status to 'invited'

2. **Revision Request Email:**
   - Sent after editorial review
   - Lists thesis feedback with notes
   - Updates status to 'revision_requested'

**Security:** Sanity Studio → Frontend API requests authenticated with HMAC SHA-256 webhook signatures.

## Common Tasks

### Get Party Access URL

```bash
cd sanity
npx tsx scripts/get-access-token.ts <participationId>
```

### Manage Cloudflare Secrets

Use Cloudflare Pages dashboard or wrangler CLI to manage environment variables and secrets.

### Reset Development Data

```bash
# Use Sanity Studio to delete documents
# Or use Sanity Vision (GROQ queries)
```

## Troubleshooting

### "Send Invitation" button not appearing
- Restart Sanity Studio after code changes
- Check `/sanity/.env` exists with correct variables
- Verify `documentActions` registered in `sanity/sanity.config.ts`

### Email not sending
- Verify `RESEND_API_KEY` is correct
- Check domain is verified in Resend dashboard
- Inspect Cloudflare Pages logs for errors

### Token validation fails
- Ensure `accessToken` is generated on PartyParticipation
- Check token hasn't expired (`tokenExpiresAt`)
- Verify status allows editing

## Resources

- **Docs:** See `PROBLEMS.md` for architecture decisions
- **Sanity Docs:** https://www.sanity.io/docs
- **Astro Docs:** https://docs.astro.build
- **Resend Docs:** https://resend.com/docs

## License

See LICENSE file.
