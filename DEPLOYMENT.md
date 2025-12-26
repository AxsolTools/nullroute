# Luminos Deployment Guide

This document provides comprehensive instructions for deploying Luminos, a Solana private transactions application powered by Light Protocol.

## Prerequisites

- Node.js 18+ and pnpm installed
- MySQL/TiDB database (provided by Manus platform)
- Solana RPC endpoint (Helius, QuickNode, or custom node)
- Light Protocol validator (for production use)

## Environment Variables

### Required System Variables (Auto-configured by Manus)

These variables are automatically injected by the Manus platform:

- `DATABASE_URL` - MySQL/TiDB connection string
- `JWT_SECRET` - Session cookie signing secret
- `VITE_APP_ID` - Manus OAuth application ID
- `OAUTH_SERVER_URL` - Manus OAuth backend base URL
- `VITE_OAUTH_PORTAL_URL` - Manus login portal URL
- `OWNER_OPEN_ID` - Owner's OpenID
- `OWNER_NAME` - Owner's name
- `VITE_APP_TITLE` - Application title
- `VITE_APP_LOGO` - Favicon logo URL
- `BUILT_IN_FORGE_API_URL` - Manus built-in APIs URL
- `BUILT_IN_FORGE_API_KEY` - Bearer token for Manus APIs (server-side)
- `VITE_FRONTEND_FORGE_API_KEY` - Bearer token for frontend access
- `VITE_FRONTEND_FORGE_API_URL` - Manus built-in APIs URL for frontend

### Additional Required Variables

You need to configure these environment variables for Solana and Light Protocol integration:

```bash
# Solana Network Configuration
SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com  # or mainnet-beta
SOLANA_NETWORK=devnet  # or mainnet-beta

# Light Protocol Configuration (for production)
LIGHT_PROTOCOL_RELAYER_URL=<your-relayer-url>
LIGHT_PROTOCOL_PROGRAM_ID=<program-id>
```

## Vercel Deployment

Luminos is optimized for Vercel deployment with serverless functions.

### Step 1: Prepare Your Repository

1. Ensure all code is committed to your Git repository
2. Push to GitHub, GitLab, or Bitbucket

### Step 2: Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect the framework settings

### Step 3: Configure Environment Variables

In Vercel Project Settings → Environment Variables, add:

```
SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
```

**Important:** All Manus system variables are automatically configured. Do NOT manually add them.

### Step 4: Deploy

1. Click "Deploy"
2. Vercel will build and deploy your application
3. Your application will be available at `https://your-project.vercel.app`

### Deployment Configuration

The project includes a `vercel.json` configuration (if needed):

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

## Manus Platform Deployment

### Using the Publish Button

1. **Create a Checkpoint**
   - Ensure all features are implemented and tested
   - The system will prompt you to create a checkpoint before publishing

2. **Click Publish**
   - Navigate to the Management UI
   - Click the "Publish" button in the header
   - Your application will be deployed to `https://your-project.manus.space`

3. **Custom Domain (Optional)**
   - Go to Settings → Domains
   - Add your custom domain
   - Follow the DNS configuration instructions

### Environment Variables on Manus

All system variables are pre-configured. To add custom variables:

1. Go to Settings → Secrets in the Management UI
2. Add your Solana configuration:
   - `SOLANA_RPC_ENDPOINT`
   - `SOLANA_NETWORK`

## Light Protocol Configuration

### Development/Testing

For development and testing, the application uses placeholder implementations that return appropriate error messages. This allows you to:

- Test the UI and user flows
- Validate wallet connections
- Test transaction history tracking
- Ensure proper error handling

### Production Setup

To enable actual private transactions in production, you need to:

1. **Set up a Light Protocol Relayer**
   - Follow the [Light Protocol documentation](https://docs.lightprotocol.com)
   - Deploy a relayer instance
   - Configure the relayer URL in environment variables

2. **Configure Solana RPC**
   - Use a reliable RPC provider (Helius, QuickNode, or your own node)
   - Ensure the RPC endpoint supports Light Protocol programs

3. **Update Implementation**
   - Replace placeholder implementations in `server/solana.ts`
   - Implement actual Light Protocol SDK calls
   - Add proper wallet key management (use AWS KMS or HashiCorp Vault)

4. **Security Considerations**
   - Never store private keys in environment variables
   - Use secure key management systems
   - Implement rate limiting for API endpoints
   - Add transaction monitoring and alerts

## Database Migrations

The database schema is automatically migrated on deployment. The schema includes:

- `users` - User authentication and profiles
- `wallets` - Connected Solana wallets
- `transactions` - Transaction history (shield, transfer, unshield)

To manually run migrations:

```bash
pnpm db:push
```

## Post-Deployment Checklist

- [ ] Verify database connection
- [ ] Test user authentication flow
- [ ] Confirm wallet connection works
- [ ] Validate error messages display correctly
- [ ] Check transaction history tracking
- [ ] Test responsive design on mobile devices
- [ ] Verify Community and GitHub links work
- [ ] Update favicon if needed (Settings → General in Management UI)

## Monitoring and Maintenance

### Health Checks

Monitor these endpoints:

- `/api/trpc/auth.me` - Authentication status
- `/api/trpc/wallet.list` - Wallet connectivity
- `/api/trpc/transaction.history` - Transaction tracking

### Analytics

The application includes built-in analytics:

- UV/PV tracking (available in Dashboard panel)
- User authentication metrics
- Transaction attempt tracking

### Logs

Check logs for:

- Failed wallet connections
- Light Protocol errors
- Database connection issues
- Authentication failures

## Troubleshooting

### Common Issues

**Issue: "Invalid Solana public key"**
- Ensure the wallet address is a valid base58-encoded Solana public key
- Check that the address is 32-44 characters long

**Issue: "Light Protocol operation requires a running validator"**
- This is expected in development mode
- Configure Light Protocol relayer for production use

**Issue: "No wallet connected"**
- User must connect a wallet before performing operations
- Check that wallet connection is persisted in database

**Issue: Database connection errors**
- Verify `DATABASE_URL` is correctly configured
- Ensure database is accessible from deployment environment

### Support

For issues related to:

- **Manus Platform**: Visit [https://help.manus.im](https://help.manus.im)
- **Light Protocol**: Check [Light Protocol Documentation](https://docs.lightprotocol.com)
- **Solana**: Refer to [Solana Documentation](https://docs.solana.com)

## Security Best Practices

1. **API Security**
   - All sensitive operations are server-side only
   - tRPC procedures use `protectedProcedure` for authentication
   - No private keys are exposed to the frontend

2. **Environment Variables**
   - Never commit `.env` files to version control
   - Use Vercel/Manus secret management
   - Rotate secrets regularly

3. **Rate Limiting**
   - Implement rate limiting for transaction endpoints
   - Monitor for suspicious activity
   - Add CAPTCHA for high-value operations

4. **Data Privacy**
   - Transaction details are stored securely
   - User data is encrypted at rest
   - Follow GDPR/privacy regulations

## Performance Optimization

1. **Database**
   - Indexes are automatically created on frequently queried fields
   - Use connection pooling (already configured)

2. **Frontend**
   - Static assets are cached with content hashing
   - Images are optimized
   - Code splitting is enabled

3. **API**
   - tRPC provides automatic request batching
   - Responses are compressed
   - Serverless functions are optimized for cold starts

## Scaling Considerations

As your application grows:

1. **Database**: Upgrade to a larger database instance
2. **RPC**: Use dedicated Solana RPC nodes
3. **Caching**: Implement Redis for session storage
4. **CDN**: Use Vercel Edge Network for global distribution

## License

This project is built with open-source technologies:

- Light Protocol: [MIT License](https://github.com/Lightprotocol/light-protocol)
- Solana Web3.js: [MIT License](https://github.com/solana-labs/solana-web3.js)
