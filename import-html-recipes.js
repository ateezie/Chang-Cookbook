#!/usr/bin/env node

/**
 * HTML Recipe Import Tool for Chang Cookbook
 * Converts HTML recipe files to Chang Cookbook JSON format
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const CONFIG = {
  htmlFolder: './recipes-html',  // Folder containing your HTML files
  outputFile: './src/data/recipes.json',
  backupFile: './src/data/recipes-backup.json',
  
  // Default values for missing data
  defaults: {
    difficulty: 'medium',
    rating: 4.0,
    reviewCount: 1,
    chef: {
      name: 'Chang Cookbook',
      avatar: '/images/logo/chang-logo-small.png'
    },
    featured: false
  },

  // Category mapping keywords
  categoryKeywords: {
    appetizers: ['appetizer', 'starter', 'snack', 'dip', 'finger food'],
    'main-course': ['main', 'entree', 'dinner', 'lunch', 'meat', 'chicken', 'beef', 'pork', 'fish'],
    pasta: ['pasta', 'spaghetti', 'linguine', 'penne', 'fettuccine', 'noodle'],
    salads: ['salad', 'greens', 'lettuce', 'spinach'],
    soups: ['soup', 'stew', 'broth', 'bisque', 'chowder'],
    desserts: ['dessert', 'cake', 'cookie', 'pie', 'sweet', 'chocolate', 'ice cream'],
    'asian-fusion': ['asian', 'chinese', 'thai', 'japanese', 'korean', 'vietnamese'],
    'quick-meals': ['quick', 'fast', 'easy', '15 minute', '20 minute', '30 minute']
  }
};

/**
 * Create slug from title
 */
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Detect category from title and content
 */
function detectCategory(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  
  for (const [category, keywords] of Object.entries(CONFIG.categoryKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return category;
    }
  }
  
  return 'main-course'; // Default fallback
}

/**
 * Extract cooking times from text
 */
function extractTimes(text) {
  const times = { prepTime: 15, cookTime: 30, totalTime: 45 };
  
  // Look for prep time
  const prepMatch = text.match(/prep(?:\s+time)?:?\s*(\d+)\s*(?:min|minute|hr|hour)/i);
  if (prepMatch) {
    times.prepTime = parseInt(prepMatch[1]) * (prepMatch[0].includes('hr') ? 60 : 1);
  }
  
  // Look for cook time
  const cookMatch = text.match(/cook(?:\s+time)?:?\s*(\d+)\s*(?:min|minute|hr|hour)/i);
  if (cookMatch) {
    times.cookTime = parseInt(cookMatch[1]) * (cookMatch[0].includes('hr') ? 60 : 1);
  }
  
  // Look for total time
  const totalMatch = text.match(/total(?:\s+time)?:?\s*(\d+)\s*(?:min|minute|hr|hour)/i);
  if (totalMatch) {
    times.totalTime = parseInt(totalMatch[1]) * (totalMatch[0].includes('hr') ? 60 : 1);
  } else {
    times.totalTime = times.prepTime + times.cookTime;
  }
  
  return times;
}

/**
 * Extract servings from text
 */
function extractServings(text) {
  const servingsMatch = text.match(/(?:serves?|servings?|yield|makes?):?\s*(\d+)/i);
  return servingsMatch ? parseInt(servingsMatch[1]) : 4;
}

/**
 * Extract difficulty from text and HTML elements
 */
function extractDifficulty(dom, text) {
  // First check for specific difficulty elements
  const difficultySelectors = ['.meta-value', '.difficulty'];
  for (const selector of difficultySelectors) {
    const elements = dom.window.document.querySelectorAll(selector);
    for (const element of elements) {
      const diffText = element.textContent.trim().toLowerCase();
      if (['easy', 'medium', 'hard', 'beginner', 'intermediate', 'advanced'].includes(diffText)) {
        if (diffText === 'beginner') return 'easy';
        if (diffText === 'intermediate') return 'medium';
        if (diffText === 'advanced') return 'hard';
        return diffText;
      }
    }
  }
  
  // Fallback to text analysis
  const lowerText = text.toLowerCase();
  if (lowerText.includes('easy') || lowerText.includes('beginner') || lowerText.includes('simple')) {
    return 'easy';
  }
  if (lowerText.includes('hard') || lowerText.includes('difficult') || lowerText.includes('advanced')) {
    return 'hard';
  }
  
  return 'medium'; // Default
}

/**
 * Parse ingredients from HTML
 */
function parseIngredients(dom) {
  const ingredients = [];
  
  // Try different selectors for ingredients (order matters - most specific first)
  const selectors = [
    '.ingredient-text',           // Custom format like brown sugar recipe
    '.ingredient-line .ingredient-text',
    '.ingredients li',
    '.ingredient-list li', 
    '.recipe-ingredients li',
    '[class*="ingredient"] li',
    'ul li'
  ];
  
  for (const selector of selectors) {
    const elements = dom.window.document.querySelectorAll(selector);
    if (elements.length > 0) {
      let validIngredients = [];
      
      elements.forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length > 3) {
          // Skip equipment items (common equipment keywords)
          const equipmentKeywords = ['baking dish', 'mixing bowl', 'skillet', 'pan', 'knife', 'cutting board', 'thermometer', 'brush', 'tongs', 'grater', 'processor'];
          const isEquipment = equipmentKeywords.some(keyword => text.toLowerCase().includes(keyword));
          
          if (!isEquipment) {
            // Try to separate amount and item
            const match = text.match(/^([\d\s\/\-.,¼½¾⅓⅔⅛⅜⅝⅞]+(?:\s+\w+)?)\s+(.+)$/);
            if (match) {
              validIngredients.push({
                amount: match[1].trim(),
                item: match[2].trim()
              });
            } else {
              validIngredients.push({
                amount: '',
                item: text
              });
            }
          }
        }
      });
      
      if (validIngredients.length > 0) {
        ingredients.push(...validIngredients);
        break; // Use first successful selector
      }
    }
  }
  
  // Fallback: look for any list items that might be ingredients
  if (ingredients.length === 0) {
    const allLis = dom.window.document.querySelectorAll('li');
    allLis.forEach(li => {
      const text = li.textContent.trim();
      // Skip if text is too short or looks like navigation or equipment
      const equipmentKeywords = ['baking dish', 'mixing bowl', 'skillet', 'pan', 'knife', 'cutting board', 'thermometer', 'brush', 'tongs', 'grater', 'processor'];
      const isEquipment = equipmentKeywords.some(keyword => text.toLowerCase().includes(keyword));
      
      if (text.length > 10 && !text.toLowerCase().includes('home') && !text.toLowerCase().includes('recipe') && !isEquipment) {
        ingredients.push({
          amount: '',
          item: text
        });
      }
    });
  }
  
  return ingredients.slice(0, 20); // Limit to reasonable number
}

/**
 * Parse instructions from HTML
 */
function parseInstructions(dom) {
  const instructions = [];
  
  // Try different selectors for instructions (order matters - most specific first)
  const selectors = [
    '.step-text',                 // Custom format like brown sugar recipe
    '.instruction-step .step-text',
    '.instructions li',
    '.directions li',
    '.method li',
    '.steps li',
    '.recipe-instructions li',
    'ol li'
  ];
  
  for (const selector of selectors) {
    const elements = dom.window.document.querySelectorAll(selector);
    if (elements.length > 0) {
      elements.forEach(el => {
        const text = el.textContent.trim();
        if (text && text.length > 10) {
          // Clean up step text (remove step numbers if they're at the beginning)
          const cleanText = text.replace(/^\d+\.\s*/, '').trim();
          instructions.push(cleanText);
        }
      });
      break;
    }
  }
  
  // Fallback: look for paragraphs that might be instructions
  if (instructions.length === 0) {
    const paragraphs = dom.window.document.querySelectorAll('p');
    paragraphs.forEach(p => {
      const text = p.textContent.trim();
      if (text.length > 20 && (
        text.toLowerCase().includes('step') ||
        text.match(/^\d+\./) ||
        text.toLowerCase().includes('heat') ||
        text.toLowerCase().includes('cook') ||
        text.toLowerCase().includes('add') ||
        text.toLowerCase().includes('bake') ||
        text.toLowerCase().includes('mix') ||
        text.toLowerCase().includes('preheat')
      )) {
        const cleanText = text.replace(/^\d+\.\s*/, '').trim();
        instructions.push(cleanText);
      }
    });
  }
  
  return instructions.slice(0, 15); // Limit to reasonable number
}

/**
 * Extract nutrition info (basic estimation)
 */
function extractNutrition(title, ingredients) {
  // Very basic nutrition estimation based on ingredients
  let calories = 200; // Base calories
  
  const highCalorieKeywords = ['butter', 'oil', 'cream', 'cheese', 'meat', 'pasta'];
  const lowCalorieKeywords = ['salad', 'vegetable', 'broth'];
  
  const text = (title + ' ' + ingredients.map(i => i.item).join(' ')).toLowerCase();
  
  highCalorieKeywords.forEach(keyword => {
    if (text.includes(keyword)) calories += 50;
  });
  
  lowCalorieKeywords.forEach(keyword => {
    if (text.includes(keyword)) calories -= 30;
  });
  
  return {
    calories: Math.max(100, Math.min(800, calories)),
    protein: '15g',
    carbs: '25g',
    fat: '10g'
  };
}

/**
 * Get recipe image path - checks for existing images first
 */
function getRecipeImage(recipeId, title) {
  const possiblePaths = [
    `./public/images/recipes/${recipeId}.jpg`,
    `./public/images/recipes/${recipeId}.png`,
    `./public/images/recipes/${recipeId}.jpeg`,
  ];
  
  // Check if any of these image files exist
  for (const imagePath of possiblePaths) {
    if (fs.existsSync(imagePath)) {
      // Return the public path (remove ./public prefix)
      return imagePath.replace('./public', '');
    }
  }
  
  // Fallback to placeholder if no image found
  return `https://via.placeholder.com/800x500/ff9966/ffffff?text=${encodeURIComponent(title)}`;
}

/**
 * Parse single HTML recipe file
 */
function parseHtmlRecipe(filePath) {
  try {
    const html = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    
    // Extract title
    let title = '';
    const titleSelectors = ['title', 'h1', 'h2', '.recipe-title', '.title'];
    for (const selector of titleSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        title = element.textContent.trim();
        if (title) break;
      }
    }
    
    if (!title) {
      title = path.basename(filePath, '.html').replace(/-/g, ' ');
    }
    
    // Clean up title
    title = title.replace(/^recipe:?\s*/i, '').trim();
    
    // Extract description
    let description = '';
    const descSelectors = ['.recipe-subtitle', '.description', '.summary', '.intro', 'meta[name="description"]'];
    for (const selector of descSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        description = element.textContent || element.getAttribute('content') || '';
        if (description && description.length > 10) break;
      }
    }
    
    if (!description) {
      description = `Delicious ${title.toLowerCase()} recipe from Chang Cookbook.`;
    }
    
    // Get all text content for analysis
    const allText = doc.body.textContent || '';
    
    // Extract recipe data
    const times = extractTimes(allText);
    const servings = extractServings(allText);
    const difficulty = extractDifficulty(dom, allText);
    const category = detectCategory(title, allText);
    const ingredients = parseIngredients(dom);
    const instructions = parseInstructions(dom);
    const nutrition = extractNutrition(title, ingredients);
    
    // Generate tags
    const tags = [];
    if (times.totalTime <= 30) tags.push('quick');
    if (ingredients.length <= 5) tags.push('simple');
    if (allText.toLowerCase().includes('vegetarian')) tags.push('vegetarian');
    if (allText.toLowerCase().includes('healthy')) tags.push('healthy');
    tags.push('homemade');
    
    const recipeId = createSlug(title);
    const recipe = {
      id: recipeId,
      title: title,
      description: description.substring(0, 200).trim(),
      category: category,
      difficulty: difficulty,
      prepTime: times.prepTime,
      cookTime: times.cookTime,
      totalTime: times.totalTime,
      servings: servings,
      rating: CONFIG.defaults.rating,
      reviewCount: CONFIG.defaults.reviewCount,
      image: getRecipeImage(recipeId, title),
      chef: CONFIG.defaults.chef,
      tags: tags,
      ingredients: ingredients,
      instructions: instructions,
      nutrition: nutrition,
      featured: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    return recipe;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Import all HTML recipes
 */
function importHtmlRecipes() {
  console.log('🍳 Chang Cookbook HTML Recipe Importer\n');
  
  // Check if HTML folder exists
  if (!fs.existsSync(CONFIG.htmlFolder)) {
    console.error(`❌ HTML folder not found: ${CONFIG.htmlFolder}`);
    console.log(`Create the folder and place your HTML files there, or update CONFIG.htmlFolder in this script.`);
    return;
  }
  
  // Get all HTML files
  const htmlFiles = fs.readdirSync(CONFIG.htmlFolder)
    .filter(file => file.toLowerCase().endsWith('.html'))
    .map(file => path.join(CONFIG.htmlFolder, file));
  
  if (htmlFiles.length === 0) {
    console.error(`❌ No HTML files found in ${CONFIG.htmlFolder}`);
    return;
  }
  
  console.log(`📁 Found ${htmlFiles.length} HTML files`);
  
  // Backup existing recipes if file exists
  if (fs.existsSync(CONFIG.outputFile)) {
    fs.copyFileSync(CONFIG.outputFile, CONFIG.backupFile);
    console.log(`💾 Backed up existing recipes to ${CONFIG.backupFile}`);
  }
  
  // Parse all HTML files
  const recipes = [];
  let successCount = 0;
  
  htmlFiles.forEach((file, index) => {
    console.log(`📝 Parsing ${index + 1}/${htmlFiles.length}: ${path.basename(file)}`);
    
    const recipe = parseHtmlRecipe(file);
    if (recipe) {
      recipes.push(recipe);
      successCount++;
    }
  });
  
  // Create categories data
  const categories = {};
  recipes.forEach(recipe => {
    if (!categories[recipe.category]) {
      categories[recipe.category] = {
        id: recipe.category,
        name: recipe.category.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        description: `Delicious ${recipe.category.replace('-', ' ')} recipes`,
        emoji: '🍽️',
        count: 0
      };
    }
    categories[recipe.category].count++;
  });
  
  // Create final JSON structure
  const recipesData = {
    recipes: recipes,
    categories: Object.values(categories)
  };
  
  // Write to file
  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(recipesData, null, 2));
  
  console.log(`\n✅ Import complete!`);
  console.log(`   📊 ${successCount}/${htmlFiles.length} recipes imported successfully`);
  console.log(`   📁 Saved to: ${CONFIG.outputFile}`);
  console.log(`   📋 Categories created: ${Object.keys(categories).length}`);
  console.log(`\nNext steps:`);
  console.log(`   1. Review the imported recipes: ${CONFIG.outputFile}`);
  console.log(`   2. Add your own images to replace placeholders`);
  console.log(`   3. Restart your development server: npm run dev`);
  console.log(`   4. Visit http://localhost:3002 to see your recipes!`);
}

// Check if JSDOM is available
try {
  require('jsdom');
} catch (error) {
  console.error('❌ JSDOM not found. Please install it:');
  console.log('npm install jsdom');
  process.exit(1);
}

// Run the importer
importHtmlRecipes();