#!/usr/bin/env node

/**
 * Simple recipe validator for Chang Cookbook
 * Usage: node validate-recipe.js
 */

const fs = require('fs');
const path = require('path');

// Valid categories
const VALID_CATEGORIES = [
  'appetizers', 'main-course', 'pasta', 'salads', 
  'soups', 'desserts', 'asian-fusion', 'quick-meals'
];

// Valid difficulties
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

function validateRecipe(recipe, index = 0) {
  const errors = [];
  const warnings = [];

  // Required fields
  const requiredFields = [
    'id', 'title', 'description', 'category', 'difficulty',
    'prepTime', 'cookTime', 'totalTime', 'servings', 
    'ingredients', 'instructions', 'rating', 'reviewCount'
  ];

  requiredFields.forEach(field => {
    if (!recipe[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // ID validation
  if (recipe.id) {
    if (!/^[a-z0-9-]+$/.test(recipe.id)) {
      errors.push(`Invalid ID format: ${recipe.id}. Use lowercase letters, numbers, and hyphens only.`);
    }
  }

  // Category validation
  if (recipe.category && !VALID_CATEGORIES.includes(recipe.category)) {
    errors.push(`Invalid category: ${recipe.category}. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Difficulty validation
  if (recipe.difficulty && !VALID_DIFFICULTIES.includes(recipe.difficulty)) {
    errors.push(`Invalid difficulty: ${recipe.difficulty}. Must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  }

  // Time validation
  if (recipe.prepTime && recipe.cookTime && recipe.totalTime) {
    if (recipe.totalTime < (recipe.prepTime + recipe.cookTime)) {
      warnings.push(`Total time (${recipe.totalTime}) seems less than prep + cook time (${recipe.prepTime + recipe.cookTime})`);
    }
  }

  // Ingredients validation
  if (recipe.ingredients) {
    if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
      errors.push('Ingredients must be a non-empty array');
    } else {
      recipe.ingredients.forEach((ingredient, i) => {
        if (!ingredient.item || !ingredient.amount) {
          errors.push(`Ingredient ${i + 1} missing 'item' or 'amount'`);
        }
      });
    }
  }

  // Instructions validation
  if (recipe.instructions) {
    if (!Array.isArray(recipe.instructions) || recipe.instructions.length === 0) {
      errors.push('Instructions must be a non-empty array');
    } else if (recipe.instructions.length < 2) {
      warnings.push('Consider adding more detailed instructions (at least 2 steps recommended)');
    }
  }

  // Rating validation
  if (recipe.rating && (recipe.rating < 1 || recipe.rating > 5)) {
    errors.push(`Rating must be between 1 and 5, got: ${recipe.rating}`);
  }

  // Servings validation
  if (recipe.servings && recipe.servings < 1) {
    errors.push(`Servings must be at least 1, got: ${recipe.servings}`);
  }

  // Image URL validation
  if (recipe.image && !recipe.image.startsWith('http') && !recipe.image.startsWith('/')) {
    warnings.push('Image URL should be a full URL or start with / for local images');
  }

  return { errors, warnings };
}

function validateRecipeFile() {
  const recipesPath = path.join(__dirname, 'src', 'data', 'recipes.json');
  
  if (!fs.existsSync(recipesPath)) {
    console.error('❌ Recipe file not found:', recipesPath);
    return;
  }

  let recipesData;
  try {
    const fileContent = fs.readFileSync(recipesPath, 'utf8');
    recipesData = JSON.parse(fileContent);
  } catch (error) {
    console.error('❌ Invalid JSON in recipes file:', error.message);
    return;
  }

  if (!recipesData.recipes || !Array.isArray(recipesData.recipes)) {
    console.error('❌ Recipe file must have a "recipes" array');
    return;
  }

  console.log(`🔍 Validating ${recipesData.recipes.length} recipes...\n`);

  let totalErrors = 0;
  let totalWarnings = 0;

  recipesData.recipes.forEach((recipe, index) => {
    const { errors, warnings } = validateRecipe(recipe, index);
    
    if (errors.length > 0 || warnings.length > 0) {
      console.log(`📝 Recipe ${index + 1}: "${recipe.title || 'Untitled'}"`);
      
      if (errors.length > 0) {
        console.log('  ❌ Errors:');
        errors.forEach(error => console.log(`    - ${error}`));
        totalErrors += errors.length;
      }
      
      if (warnings.length > 0) {
        console.log('  ⚠️  Warnings:');
        warnings.forEach(warning => console.log(`    - ${warning}`));
        totalWarnings += warnings.length;
      }
      
      console.log('');
    }
  });

  // Summary
  if (totalErrors === 0 && totalWarnings === 0) {
    console.log('✅ All recipes are valid! 🎉');
  } else {
    console.log(`📊 Validation Summary:`);
    console.log(`   ❌ ${totalErrors} errors found`);
    console.log(`   ⚠️  ${totalWarnings} warnings found`);
    
    if (totalErrors > 0) {
      console.log('\n🚨 Please fix all errors before deploying!');
    }
  }

  // Check for duplicate IDs
  const ids = recipesData.recipes.map(r => r.id).filter(Boolean);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  
  if (duplicateIds.length > 0) {
    console.log(`\n❌ Duplicate recipe IDs found: ${[...new Set(duplicateIds)].join(', ')}`);
  }
}

// Run validation
validateRecipeFile();