# DigitalOcean Deployment

## App Details
- **App ID:** `8c47bc74-68cf-4a7f-a07c-8184e915f310`
- **App Name:** `nullroute`
- **Region:** `nyc1`
- **Instance Size:** `apps-s-1vcpu-0.5gb` ($5/month)
- **Auto-deploy:** Enabled (deploys on git push to main branch)

## Update Commands (like `vercel --prod`)

### Option 1: Auto-deploy (Recommended)
```powershell
git add .
git commit -m "your commit message"
git push origin main
```
DigitalOcean will automatically deploy when you push to the `main` branch.

### Option 2: Manual Deploy
```powershell
doctl apps create-deployment 8c47bc74-68cf-4a7f-a07c-8184e915f310
```

## Check Status
```powershell
# Get app info
doctl apps get 8c47bc74-68cf-4a7f-a07c-8184e915f310

# List deployments
doctl apps list-deployments 8c47bc74-68cf-4a7f-a07c-8184e915f310

# View logs
doctl apps logs 8c47bc74-68cf-4a7f-a07c-8184e915f310
```

## Configuration
- **Build Command:** `pnpm install && pnpm build`
- **Run Command:** `pnpm start`
- **Port:** `3000`
- **Branch:** `main`
- **Repository:** `AxsolTools/nullroute`

