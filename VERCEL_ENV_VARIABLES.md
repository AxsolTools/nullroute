# Complete Vercel Environment Variables List

## REQUIRED - Database (Critical for Wallet Registration)
```
DATABASE_URL=mysql://user:password@host:port/database
```
**This is the root cause of wallet registration failure if missing or incorrect.**

## REQUIRED - Manus Platform Variables (Auto-configured if using Manus, otherwise set manually)
```
VITE_APP_ID=your-manus-app-id
JWT_SECRET=your-jwt-secret-key
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=your-owner-open-id
OWNER_NAME=Your Name
VITE_APP_TITLE=NULLROUTE
VITE_APP_LOGO=https://your-logo-url.com/logo.png
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

## REQUIRED - Solana Configuration
```
SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
VITE_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
```

## OPTIONAL - ChangeNow API (Required for private transfers)
```
CHANGENOW_API_KEY=your-changenow-api-key
```
**Note: If missing, private transfers will fail but wallet registration should still work.**

## OPTIONAL - Light Protocol (For production private transactions)
```
LIGHT_PROTOCOL_RELAYER_URL=https://your-relayer-url.com
LIGHT_PROTOCOL_PROGRAM_ID=your-program-id
```

## System Variables (Auto-set by Vercel)
```
NODE_ENV=production
PORT=3000
```

---

## Root Cause Analysis

The wallet registration failure is caused by one of these:

1. **DATABASE_URL is missing or incorrect** - This will cause `getDb()` to return `null`, which triggers "Database not available" error
2. **Database tables don't exist** - If migrations haven't been run, the insert will fail
3. **Database connection string format is wrong** - Must be MySQL connection string format

## How to Verify

1. Check Vercel logs for: `[Database] DATABASE_URL environment variable is not set`
2. Check Vercel logs for: `[Database] Failed to connect:`
3. Check Vercel logs for: `[Database] Error in upsertWallet:`

The exact error message in the logs will tell you the root cause.

