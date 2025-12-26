# DigitalOcean App Platform Deployment

## Quick Setup

1. **Install DigitalOcean CLI (doctl):**
   ```bash
   # Windows (PowerShell)
   # Download from: https://docs.digitalocean.com/reference/doctl/how-to/install/
   # Or use Chocolatey: choco install doctl
   # Or use Scoop: scoop install doctl
   ```

2. **Login to DigitalOcean:**
   ```bash
   doctl auth init
   ```
   You'll need your DigitalOcean API token (get it from https://cloud.digitalocean.com/account/api/tokens)

3. **Option A: Deploy via CLI with app.yaml**
   ```bash
   # First, update .do/app.yaml with your GitHub repo details
   # Then create the app:
   doctl apps create --spec .do/app.yaml
   ```

4. **Option B: Deploy via Dashboard (Recommended)**
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Connect your GitHub repository
   - Select the branch (main/master)
   - DigitalOcean will auto-detect Node.js
   - **Build Command:** `pnpm install && pnpm build`
   - **Run Command:** `pnpm start`
   - **HTTP Port:** `3000` (or leave blank, DO will set PORT env var)
   - Add environment variables (see below)
   - Review and deploy!

## Environment Variables

Add these in the DigitalOcean dashboard under your app's Settings → Environment Variables:

### Required:
- `NODE_ENV=production`
- `DATABASE_URL` (your PostgreSQL connection string)
- `JWT_SECRET` (for cookie signing)

### Optional (add as needed):
- `SOLANA_RPC_ENDPOINT`
- `SOLANA_NETWORK`
- `CHANGENOW_API_KEY`
- `VITE_APP_ID`
- `OAUTH_SERVER_URL`
- `OWNER_OPEN_ID`
- `BUILT_IN_FORGE_API_URL`
- `BUILT_IN_FORGE_API_KEY`
- Any other environment variables your app needs

## How It Works

The app uses a single Express server that:
1. Serves the tRPC API at `/api/trpc/*`
2. Serves static frontend files from `dist/public`
3. Runs on the port specified by DigitalOcean (via `PORT` env var, default 3000)

## Build Process

1. `pnpm install` - Installs dependencies
2. `pnpm build` - Builds:
   - Frontend (Vite) → `dist/public/`
   - Backend server → `dist/index.js`
3. `pnpm start` - Runs `node dist/index.js`

## Notes

- DigitalOcean App Platform automatically handles:
  - Process management
  - HTTPS/SSL certificates
  - Logging
  - Health checks
  - Auto-scaling (if configured)
  - Environment variable injection

- No serverless function complexity - just a standard Node.js Express app!
- The server automatically binds to the PORT environment variable that DigitalOcean provides.
