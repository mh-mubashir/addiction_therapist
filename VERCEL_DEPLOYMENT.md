# Vercel Deployment Guide

## Prerequisites
1. Vercel account and CLI installed
2. Node.js 18+ (for local testing)

## Environment Variables Setup

**IMPORTANT**: You must set these environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:

```
CLAUDE_API_KEY=your_actual_claude_api_key
SUPABASE_URL=your_actual_supabase_url
SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

**Note**: Do NOT use `VITE_` prefix for these variables. The `VITE_` variables are only available in the frontend build, not in serverless functions.

## Deployment Steps

1. **Install dependencies locally**:
   ```bash
   npm install
   ```

2. **Test build locally**:
   ```bash
   npm run vercel-build
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

## Troubleshooting

### 404 Errors on API Routes
- Check that environment variables are set correctly
- Verify the API routes exist in the `api/` directory
- Check Vercel function logs for errors

### Environment Variable Issues
- Ensure variables are set without `VITE_` prefix
- Redeploy after setting environment variables
- Check Vercel function logs for undefined variables

### Build Failures
- Run `npm run vercel-build` locally to test
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility

## Testing API Routes

After deployment, test these endpoints:

- `GET /api/health` - Health check
- `GET /api/test` - Test endpoint
- `POST /api/session/create` - Create session
- `POST /api/chat` - Chat endpoint
- `POST /api/analyze-triggers` - Trigger analysis

## Local Development

For local API testing:
```bash
npm run dev:api
```

This runs the Express server locally on port 3001.

## File Structure

```
api/
├── test.js                    # Test endpoint
├── health.js                  # Health check
├── chat.js                    # Chat functionality
├── analyze-triggers.js        # Trigger analysis
└── session/
    ├── create.js              # Session creation
    └── [sessionId]/
        └── status.js          # Session status
```

## Common Issues

1. **API routes returning 404**: Check Vercel configuration and environment variables
2. **CORS errors**: API routes include CORS headers
3. **Build failures**: Ensure all dependencies are properly listed
4. **Environment variables undefined**: Use correct variable names without `VITE_` prefix 