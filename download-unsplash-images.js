#!/usr/bin/env node

/**
 * Unsplash Image Downloader for Chang Cookbook
 * Automatically downloads high-quality images for all recipes using Unsplash API
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com';

// Image settings
const IMAGE_WIDTH = 800;
const IMAGE_HEIGHT = 600;
const IMAGE_QUALITY = 80;

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.headers['content-type']?.includes('application/json') ? JSON.parse(data) : data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (err) {
          reject(err);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', reject);
  });
}

// Search Unsplash for recipe image
async function searchUnsplashImage(query, recipeId) {
  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error('UNSPLASH_ACCESS_KEY environment variable not set');
  }

  const searchQuery = `${query} food recipe dish cooking`;
  const searchUrl = `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=3&orientation=landscape&content_filter=high`;
  
  console.log(`🔍 Searching for: "${searchQuery}"`);
  
  try {
    const response = await makeRequest(searchUrl, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1'
      }
    });
    
    if (response.results && response.results.length > 0) {
      // Get the first high-quality result
      const photo = response.results[0];
      const imageUrl = `${photo.urls.raw}&w=${IMAGE_WIDTH}&h=${IMAGE_HEIGHT}&fit=crop&crop=center&q=${IMAGE_QUALITY}`;
      
      return {
        url: imageUrl,
        description: photo.description || photo.alt_description,
        photographer: photo.user.name,
        downloadUrl: photo.links.download,
        unsplashId: photo.id
      };
    } else {
      throw new Error('No suitable images found');
    }
  } catch (error) {
    console.error(`❌ Failed to search Unsplash: ${error.message}`);
    throw error;
  }
}

// Trigger download tracking (required by Unsplash API)
async function trackDownload(downloadUrl) {
  if (!downloadUrl) return;
  
  try {
    await makeRequest(`${downloadUrl}?client_id=${UNSPLASH_ACCESS_KEY}`);
  } catch (error) {
    console.warn(`⚠️  Failed to track download: ${error.message}`);
  }
}

// Load recipes from JSON
function loadRecipes() {
  const recipesPath = './src/data/recipes.json';
  if (!fs.existsSync(recipesPath)) {
    throw new Error('recipes.json not found!');
  }
  
  const data = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
  return data;
}

// Save updated recipes
function saveRecipes(data) {
  const recipesPath = './src/data/recipes.json';
  const backupPath = `./src/data/recipes-backup-${Date.now()}.json`;
  
  // Create backup
  fs.copyFileSync(recipesPath, backupPath);
  console.log(`📦 Backup created: ${backupPath}`);
  
  // Save updated data
  fs.writeFileSync(recipesPath, JSON.stringify(data, null, 2));
}

// Ensure directories exist
function ensureDirectories() {
  const imageDir = './public/images/recipes';
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
    console.log(`📁 Created directory: ${imageDir}`);
  }
}

// Process a single recipe
async function processRecipe(recipe, index, total) {
  const prefix = `[${index + 1}/${total}]`;
  console.log(`\n${prefix} Processing: ${recipe.title}`);
  
  // Skip if recipe already has a custom image
  if (recipe.image && !recipe.image.includes('placeholder') && !recipe.image.includes('via.placeholder')) {
    console.log(`   ✅ Already has custom image: ${recipe.image}`);
    return recipe;
  }
  
  try {
    // Search for image
    const imageData = await searchUnsplashImage(recipe.title, recipe.id);
    
    // Download image
    const filename = `${recipe.id}.jpg`;
    const filepath = `./public/images/recipes/${filename}`;
    
    console.log(`   ⬇️  Downloading from Unsplash...`);
    await downloadImage(imageData.url, filepath);
    
    // Track download (Unsplash API requirement)
    await trackDownload(imageData.downloadUrl);
    
    // Update recipe data
    const updatedRecipe = {
      ...recipe,
      image: `/images/recipes/${filename}`,
      imageCredit: `Photo by ${imageData.photographer} on Unsplash`,
      unsplashId: imageData.unsplashId
    };
    
    console.log(`   ✅ Downloaded: ${filename}`);
    console.log(`   📸 Photo by: ${imageData.photographer}`);
    
    return updatedRecipe;
    
  } catch (error) {
    console.error(`   ❌ Failed to process: ${error.message}`);
    return recipe; // Return original recipe if download fails
  }
}

// Add delay between requests
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'check-api') {
    // Test API connection
    if (!UNSPLASH_ACCESS_KEY) {
      console.error('❌ UNSPLASH_ACCESS_KEY environment variable not set');
      console.log('\n💡 To get an API key:');
      console.log('1. Create a free account at https://unsplash.com/developers');
      console.log('2. Create a new application');
      console.log('3. Copy your Access Key');
      console.log('4. Set it as environment variable: set UNSPLASH_ACCESS_KEY=your_key_here');
      process.exit(1);
    }
    
    try {
      // Test API with a simple search request instead of /me endpoint
      const testUrl = `${UNSPLASH_API_URL}/search/photos?query=food&per_page=1`;
      const response = await makeRequest(testUrl, {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      });
      console.log('✅ API connection successful!');
      console.log(`📊 Found ${response.total || 0} food-related images available`);
    } catch (error) {
      console.error(`❌ API test failed: ${error.message}`);
      process.exit(1);
    }
    return;
  }
  
  if (command === 'download-all') {
    console.log('🍳 Chang Cookbook - Unsplash Image Downloader\n');
    
    if (!UNSPLASH_ACCESS_KEY) {
      console.error('❌ UNSPLASH_ACCESS_KEY environment variable not set');
      console.log('💡 Run: node download-unsplash-images.js check-api for setup instructions');
      process.exit(1);
    }
    
    try {
      ensureDirectories();
      
      const data = loadRecipes();
      console.log(`📋 Found ${data.recipes.length} recipes to process\n`);
      
      const updatedRecipes = [];
      
      for (let i = 0; i < data.recipes.length; i++) {
        const recipe = data.recipes[i];
        const updatedRecipe = await processRecipe(recipe, i, data.recipes.length);
        updatedRecipes.push(updatedRecipe);
        
        // Add delay to respect API rate limits (1 request per second)
        if (i < data.recipes.length - 1) {
          console.log('   ⏳ Waiting 1 second...');
          await delay(1000);
        }
      }
      
      // Save updated data
      const updatedData = { ...data, recipes: updatedRecipes };
      saveRecipes(updatedData);
      
      console.log('\n🎉 Download complete!');
      console.log('✅ All recipe images have been processed');
      console.log('📁 Images saved to: ./public/images/recipes/');
      console.log('💾 Recipe data updated with new image paths');
      
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
    return;
  }
  
  if (command === 'preview') {
    // Show what would be downloaded without actually downloading
    const data = loadRecipes();
    console.log('🔍 Preview Mode - Images that would be downloaded:\n');
    
    let needsDownload = 0;
    data.recipes.forEach((recipe, index) => {
      const hasCustomImage = recipe.image && !recipe.image.includes('placeholder') && !recipe.image.includes('via.placeholder');
      const status = hasCustomImage ? '✅ Has custom image' : '📥 Needs download';
      
      console.log(`${index + 1}. ${recipe.title}`);
      console.log(`   Status: ${status}`);
      console.log(`   Current: ${recipe.image}`);
      console.log('');
      
      if (!hasCustomImage) needsDownload++;
    });
    
    console.log(`📊 Summary: ${needsDownload} recipes need new images`);
    return;
  }
  
  // Default help message
  console.log('🍳 Chang Cookbook - Unsplash Image Downloader\n');
  console.log('Commands:');
  console.log('  check-api     - Test Unsplash API connection');
  console.log('  preview       - Show what images would be downloaded');
  console.log('  download-all  - Download images for all recipes');
  console.log('');
  console.log('Setup:');
  console.log('1. Get free API key from https://unsplash.com/developers');
  console.log('2. Set environment variable: set UNSPLASH_ACCESS_KEY=your_key_here');
  console.log('3. Run: node download-unsplash-images.js download-all');
  console.log('');
  console.log('Examples:');
  console.log('  node download-unsplash-images.js check-api');
  console.log('  node download-unsplash-images.js preview');
  console.log('  node download-unsplash-images.js download-all');
}

main().catch(console.error);