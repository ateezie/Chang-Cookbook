# Unsplash Image Setup for Chang Cookbook

This guide will help you automatically download high-quality images for all your recipes using the Unsplash API.

## Quick Start

1. **Get a free Unsplash API key:**
   - Visit [Unsplash Developers](https://unsplash.com/developers)
   - Create a free account (if you don't have one)
   - Create a "New Application"
   - Fill in the application details (name: "Chang Cookbook", description: "Personal recipe website")
   - Copy your **Access Key**

2. **Set up the environment variable:**
   ```bash
   # Windows Command Prompt
   set UNSPLASH_ACCESS_KEY=5XdiQ0Ln-U95snBKQ9DpYx7jiy0RLxJKcO8hfWZCplM
   
   # Windows PowerShells
   $env:UNSPLASH_ACCESS_KEY="5XdiQ0Ln-U95snBKQ9DpYx7jiy0RLxJKcO8hfWZCplM"
   
   # Or create a .env file (not recommended for production)
   echo UNSPLASH_ACCESS_KEY=your_access_key_here > .env
   ```

3. **Test the connection:**
   ```bash
   node download-unsplash-images.js check-api
   ```

4. **Preview what will be downloaded:**
   ```bash
   node download-unsplash-images.js preview
   ```

5. **Download all images:**
   ```bash
   node download-unsplash-images.js download-all
   ```

## What This Does

- **Searches Unsplash** for high-quality images matching each recipe title
- **Downloads optimized images** (800x600, cropped and optimized)
- **Updates your recipes.json** with the new image paths
- **Adds photo credits** to comply with Unsplash guidelines
- **Creates backups** before making any changes
- **Respects rate limits** (1 request per second)

## File Structure After Download

```
chang-cookbook/
├── public/images/recipes/
│   ├── korean-bulgogi-recipe.jpg
│   ├── brown-sugar-dijon-chicken-thighs.jpg
│   ├── crispy-orange-chicken.jpg
│   └── ... (all your recipes)
├── src/data/
│   ├── recipes.json (updated with new image paths)
│   └── recipes-backup-[timestamp].json (automatic backup)
└── download-unsplash-images.js
```

## API Usage & Limits

- **Free tier:** 50 requests per hour
- **Demo app limit:** 50 requests per hour
- **Production app:** 5,000 requests per hour (after approval)

For 21 recipes, you'll use 21 API requests, well within the free limit.

## Image Credits

The script automatically adds photo credits to your recipe data:
```json
{
  "image": "/images/recipes/korean-bulgogi-recipe.jpg",
  "imageCredit": "Photo by John Doe on Unsplash",
  "unsplashId": "abc123"
}
```

## Troubleshooting

**API Key Issues:**
```bash
# Check if environment variable is set
echo %UNSPLASH_ACCESS_KEY%  # Windows CMD
echo $env:UNSPLASH_ACCESS_KEY  # PowerShell
```

**Connection Issues:**
- Make sure you're connected to the internet
- Check if your API key is valid
- Ensure you haven't exceeded rate limits

**Download Failures:**
- The script will continue processing other recipes if one fails
- Check the console output for specific error messages
- Failed downloads will keep the original placeholder images

## Commands Reference

| Command | Description |
|---------|-------------|
| `check-api` | Test your API connection and key |
| `preview` | Show which recipes need new images |
| `download-all` | Download all missing images |

## Example Output

```
🍳 Chang Cookbook - Unsplash Image Downloader

📋 Found 21 recipes to process

[1/21] Processing: Korean Bulgogi Recipe
🔍 Searching for: "Korean Bulgogi Recipe food recipe dish cooking"
⬇️  Downloading from Unsplash...
✅ Downloaded: korean-bulgogi-recipe.jpg
📸 Photo by: Jane Smith

[2/21] Processing: Brown Sugar Dijon Chicken Thighs
✅ Already has custom image: /images/recipes/chicken-thighs.jpg

...

🎉 Download complete!
✅ All recipe images have been processed
📁 Images saved to: ./public/images/recipes/
💾 Recipe data updated with new image paths
```

## Legal Compliance

This tool follows Unsplash's API guidelines:
- ✅ Tracks downloads (required by Unsplash)
- ✅ Provides proper attribution
- ✅ Respects rate limits
- ✅ Uses official API endpoints

## Need Help?

- **Unsplash API Documentation:** https://unsplash.com/documentation
- **Free Account Setup:** https://unsplash.com/join
- **Developer Dashboard:** https://unsplash.com/oauth/applications