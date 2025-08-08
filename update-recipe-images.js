#!/usr/bin/env node

/**
 * Recipe Image Updater for Chang Cookbook
 * Helps manage and update recipe images efficiently
 */

const fs = require('fs');
const path = require('path');

// Read current recipes
function loadRecipes() {
  const recipesPath = './src/data/recipes.json';
  if (!fs.existsSync(recipesPath)) {
    console.error('❌ recipes.json not found!');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
  return data;
}

// Save updated recipes
function saveRecipes(data) {
  const recipesPath = './src/data/recipes.json';
  const backupPath = './src/data/recipes-backup.json';
  
  // Backup first
  fs.copyFileSync(recipesPath, backupPath);
  
  // Save updated data
  fs.writeFileSync(recipesPath, JSON.stringify(data, null, 2));
}

// List all recipes with current image status
function listRecipes() {
  const data = loadRecipes();
  
  console.log('🍳 Chang Cookbook - Recipe Image Status\n');
  
  data.recipes.forEach((recipe, index) => {
    const isPlaceholder = recipe.image.includes('placeholder') || recipe.image.includes('via.placeholder');
    const status = isPlaceholder ? '❌ Placeholder' : '✅ Custom Image';
    
    console.log(`${index + 1}. ${recipe.title}`);
    console.log(`   ID: ${recipe.id}`);
    console.log(`   Status: ${status}`);
    console.log(`   Current: ${recipe.image}`);
    console.log('');
  });
}

// Update a specific recipe's image
function updateRecipeImage(recipeId, imagePath) {
  const data = loadRecipes();
  
  const recipeIndex = data.recipes.findIndex(r => r.id === recipeId);
  if (recipeIndex === -1) {
    console.error(`❌ Recipe "${recipeId}" not found!`);
    return;
  }
  
  const oldImage = data.recipes[recipeIndex].image;
  data.recipes[recipeIndex].image = imagePath;
  
  saveRecipes(data);
  
  console.log(`✅ Updated "${data.recipes[recipeIndex].title}"`);
  console.log(`   Old: ${oldImage}`);
  console.log(`   New: ${imagePath}`);
}

// Batch update images from a directory
function batchUpdateFromDirectory(imageDir) {
  const data = loadRecipes();
  
  if (!fs.existsSync(imageDir)) {
    console.error(`❌ Directory "${imageDir}" not found!`);
    return;
  }
  
  const imageFiles = fs.readdirSync(imageDir)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
  
  console.log(`📁 Found ${imageFiles.length} images in ${imageDir}\n`);
  
  let updatedCount = 0;
  
  data.recipes.forEach(recipe => {
    // Try to find matching image by recipe ID
    const matchingImage = imageFiles.find(file => {
      const basename = path.basename(file, path.extname(file)).toLowerCase();
      return basename === recipe.id || basename.replace(/[-_]/g, '') === recipe.id.replace(/[-_]/g, '');
    });
    
    if (matchingImage) {
      const oldImage = recipe.image;
      recipe.image = `/images/recipes/${matchingImage}`;
      updatedCount++;
      
      console.log(`✅ Updated: ${recipe.title}`);
      console.log(`   Image: ${matchingImage}`);
    }
  });
  
  if (updatedCount > 0) {
    saveRecipes(data);
    console.log(`\n🎉 Updated ${updatedCount} recipe images!`);
  } else {
    console.log('ℹ️ No matching images found. Make sure image filenames match recipe IDs.');
  }
}

// Generate image search URLs for each recipe
function generateSearchUrls() {
  const data = loadRecipes();
  
  console.log('🔍 Image Search URLs for Your Recipes\n');
  console.log('Copy these URLs to find images for each recipe:\n');
  
  data.recipes.forEach((recipe, index) => {
    const searchTerm = encodeURIComponent(recipe.title + ' food recipe');
    const unsplashUrl = `https://unsplash.com/s/photos/${searchTerm}`;
    const pexelsUrl = `https://www.pexels.com/search/${searchTerm}`;
    
    console.log(`${index + 1}. **${recipe.title}**`);
    console.log(`   Unsplash: ${unsplashUrl}`);
    console.log(`   Pexels: ${pexelsUrl}`);
    console.log('');
  });
}

// Generate wget/curl commands for image download
function generateDownloadCommands() {
  const data = loadRecipes();
  
  console.log('📥 Image Download Template Commands\n');
  console.log('Replace IMAGE_URL with actual image URLs:\n');
  
  data.recipes.forEach((recipe, index) => {
    console.log(`# ${recipe.title}`);
    console.log(`curl -L "IMAGE_URL" -o "public/images/recipes/${recipe.id}.jpg"`);
    console.log('');
  });
}

// Main CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'list':
      listRecipes();
      break;
      
    case 'update':
      const recipeId = args[1];
      const imagePath = args[2];
      if (!recipeId || !imagePath) {
        console.log('Usage: node update-recipe-images.js update <recipe-id> <image-path>');
        console.log('Example: node update-recipe-images.js update brown-sugar-dijon-chicken-thighs /images/recipes/chicken.jpg');
        break;
      }
      updateRecipeImage(recipeId, imagePath);
      break;
      
    case 'batch':
      const imageDir = args[1] || './public/images/recipes';
      batchUpdateFromDirectory(imageDir);
      break;
      
    case 'search-urls':
      generateSearchUrls();
      break;
      
    case 'download-commands':
      generateDownloadCommands();
      break;
      
    default:
      console.log('🍳 Chang Cookbook - Recipe Image Updater\n');
      console.log('Commands:');
      console.log('  list              - Show all recipes and their image status');
      console.log('  update <id> <url> - Update specific recipe image');
      console.log('  batch [dir]       - Update images from directory (default: ./public/images/recipes)');
      console.log('  search-urls       - Generate image search URLs');
      console.log('  download-commands - Generate download commands template');
      console.log('');
      console.log('Examples:');
      console.log('  node update-recipe-images.js list');
      console.log('  node update-recipe-images.js update korean-bulgogi-recipe /images/recipes/bulgogi.jpg');
      console.log('  node update-recipe-images.js batch ./my-recipe-photos');
      console.log('  node update-recipe-images.js search-urls');
  }
}

main();