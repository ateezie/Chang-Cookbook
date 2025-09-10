# Cloudinary Deployment Setup

## Production Environment Variables

You need to add these environment variables to your production server:

### Digital Ocean Droplet Setup

SSH into your production server and add these to your Docker environment:

```bash
# SSH into your server
ssh root@157.230.61.255

# Navigate to your deployment directory
cd /opt/chang-cookbook

# Create or update .env.local file
cat >> .env.local << 'EOF'

# Cloudinary Configuration
CLOUDINARY_URL=cloudinary://346318372912643:H71-xGVI2yqPtxj1v9pXDdOLcJI@dorwqo2lp
CLOUDINARY_CLOUD_NAME=dorwqo2lp
CLOUDINARY_API_KEY=346318372912643
CLOUDINARY_API_SECRET=H71-xGVI2yqPtxj1v9pXDdOLcJI
EOF

# Restart the container to pick up new environment variables
# Try docker compose first (newer version)
docker compose down && docker compose up -d

# If that doesn't work, try docker-compose (older version)
# docker-compose down && docker-compose up -d
```

### GitHub Secrets (for CI/CD)

Add these secrets to your GitHub repository at `Settings > Secrets and variables > Actions`:

- `CLOUDINARY_CLOUD_NAME`: `dorwqo2lp`
- `CLOUDINARY_API_KEY`: `346318372912643`
- `CLOUDINARY_API_SECRET`: `H71-xGVI2yqPtxj1v9pXDdOLcJI`

## What This Enables

✅ **Persistent Images**: Images survive container restarts and deployments
✅ **Automatic Optimization**: WebP conversion, quality optimization
✅ **Smart Resizing**: 800x600 for recipes, 400x400 for chef avatars  
✅ **Global CDN**: Fast image delivery worldwide
✅ **25GB Free**: Storage and bandwidth included

## Testing After Deployment

1. Go to https://cook.alexthip.com/admin/dashboard
2. Edit any recipe
3. Upload a new image
4. Verify the image appears and persists after page refresh
5. Check that images load quickly and are optimized

## Cloudinary Dashboard

View your uploaded images at: https://cloudinary.com/console

Your images will be organized in folders:
- `chang-cookbook/recipes/` - Recipe images  
- `chang-cookbook/chefs/` - Chef avatars

## Troubleshooting

If uploads fail after deployment:
1. Check server logs: `docker logs chang-cookbook-chang-cookbook-1`
2. Verify environment variables are set in the container
3. Confirm Cloudinary credentials are correct
4. Test the API endpoint directly