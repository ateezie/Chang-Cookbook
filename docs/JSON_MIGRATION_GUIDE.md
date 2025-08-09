# JSON Migration Guide

This guide explains how to use the JSON migration feature to bulk import recipes into Chang Cookbook.

## 📄 Template Files

### Single Recipe Template
- **File**: `recipe-template.json`
- **Use**: Creating individual recipes
- **Contains**: Complete recipe structure for one recipe

### Migration Template  
- **File**: `migration-template.json`
- **Use**: Bulk importing multiple recipes with categories
- **Contains**: Full migration structure with categories and 3 sample recipes

## 🚀 Using the Migration Feature

### Step 1: Access Migration Page
1. Login to admin panel at `/admin`
2. Click **"Migrate JSON Data"** button on dashboard
3. Navigate to `/admin/migrate`

### Step 2: Prepare Your JSON File
1. Copy `migration-template.json` as starting point
2. Replace sample data with your recipes
3. Follow the JSON structure exactly
4. Validate JSON format before upload

### Step 3: Upload and Migrate
1. Click **"Choose JSON file"** or drag & drop
2. Review the validation and preview
3. Click **"Start Migration"** 
4. Monitor progress in real-time
5. Review detailed results

## 📋 JSON Structure Requirements

### Root Structure
```json
{
  "categories": [ /* Array of category objects */ ],
  "recipes": [ /* Array of recipe objects */ ]
}
```

### Category Object
```json
{
  "id": "category-slug",           // Required: URL-friendly ID
  "name": "Display Name",          // Required: Human-readable name  
  "description": "Category desc",  // Required: Brief description
  "emoji": "🍽️",                  // Required: Category emoji
  "count": 0                       // Required: Recipe count (auto-updated)
}
```

### Recipe Object
```json
{
  "id": "unique-recipe-id",        // Required: Unique identifier
  "title": "Recipe Title",         // Required: Recipe name
  "description": "Brief desc",     // Required: 1-2 sentence description
  "category": "main-course",       // Required: Must match category ID
  "difficulty": "easy",            // Required: easy|medium|hard
  "prepTime": 15,                  // Required: Prep time in minutes
  "cookTime": 30,                  // Required: Cook time in minutes  
  "totalTime": 45,                 // Optional: Auto-calculated if omitted
  "servings": 4,                   // Required: Number of servings
  "rating": 4.5,                   // Optional: 1-5 rating (default: 0)
  "reviewCount": 25,               // Optional: Review count (default: 0)
  "image": "/path/to/image.jpg",   // Optional: Recipe image path
  "imageCredit": "Photo credit",   // Optional: Image attribution  
  "unsplashId": "unsplash-id",     // Optional: Unsplash photo ID
  "featured": false,               // Optional: Featured status (default: false)
  "chef": {                        // Required: Chef information
    "name": "Chef Name",           // Required: Chef's name
    "avatar": "/path/to/avatar"    // Optional: Chef avatar image
  },
  "tags": ["tag1", "tag2"],        // Optional: Recipe tags array
  "ingredients": [                 // Required: Ingredients array
    {
      "item": "ingredient name",   // Required: Ingredient name
      "amount": "1 cup"           // Required: Amount/measurement
    }
  ],
  "instructions": [                // Required: Instructions array
    "Step 1 description",         // Each step as string
    "Step 2 description"
  ],
  "nutrition": {                   // Optional: Nutrition information
    "calories": 350,              // Optional: Calories per serving
    "protein": "25g",             // Optional: Protein content  
    "carbs": "40g",               // Optional: Carbohydrate content
    "fat": "12g"                  // Optional: Fat content
  },
  "createdAt": "2024-01-15"        // Optional: Creation date (YYYY-MM-DD)
}
```

## ✅ Valid Categories

Use these exact category IDs:
- `appetizers` - Appetizers & Starters
- `main-course` - Main Dishes  
- `side-dishes` - Side Dishes
- `desserts` - Desserts & Sweets
- `beverages` - Drinks & Beverages
- `snacks` - Snacks & Light Bites
- `breakfast` - Breakfast & Brunch
- `quick-meals` - Quick & Easy Meals

## 🔧 Migration Behavior

### Duplicate Handling
- **Existing recipes** (same ID) are **skipped**
- **New recipes** are **imported**
- **Skipped count** is reported in results

### Auto-Creation
- **Missing chefs** are created automatically
- **Missing categories** are created from your JSON
- **Tags** are created as needed
- **Recipe relationships** are established

### Transaction Safety
- Each recipe import is **transactional**
- Failed recipes don't affect successful ones
- **Detailed error reporting** for debugging

### Results Tracking
- **Recipes imported**: Count of new recipes added
- **Categories created**: New categories added
- **Chefs created**: New chefs added  
- **Recipes skipped**: Existing recipes not overwritten
- **Errors**: Detailed error messages for failed imports

## 🚨 Common Issues

### JSON Validation Errors
- **Invalid JSON syntax**: Check for missing commas, quotes, brackets
- **Missing required fields**: Ensure all required fields are present
- **Wrong data types**: Numbers should be numbers, strings in quotes
- **Invalid categories**: Use only predefined category IDs

### Migration Errors  
- **Duplicate recipe IDs**: Each recipe must have unique ID
- **Invalid difficulty**: Must be "easy", "medium", or "hard"
- **Empty arrays**: Ingredients and instructions cannot be empty
- **Invalid dates**: Use YYYY-MM-DD format for createdAt

### Image Paths
- **Relative paths**: Use `/images/recipes/filename.jpg`
- **External URLs**: Full HTTPS URLs are supported  
- **Missing images**: Migration continues, uses fallback images

## 💡 Tips & Best Practices

### Recipe IDs
- Use **URL-friendly** slugs: `chicken-teriyaki-bowl`
- Keep them **descriptive** but **concise**
- **No spaces** or special characters
- Use **hyphens** to separate words

### Images
- **Upload images first** via admin panel
- **Copy the generated path** to your JSON
- Or use **external image URLs**
- Ensure images are **optimized** (< 1MB recommended)

### Content Quality
- Write **clear, detailed instructions**
- Include **specific measurements**
- Add **timing and temperature** guidance
- Use **descriptive ingredient names**

### Testing
- **Start small**: Test with 1-2 recipes first
- **Validate JSON**: Use online JSON validators
- **Check results**: Review migration results carefully
- **Backup database**: Always backup before large imports

## 📞 Troubleshooting

### Migration Stuck?
- Check browser console for errors
- Ensure strong internet connection
- Try with smaller JSON file
- Contact admin if issues persist

### Recipes Not Appearing?
- Check migration results for errors
- Verify recipe category matches existing categories  
- Ensure required fields are present
- Check browser cache (hard refresh)

### Image Issues?
- Verify image paths are correct
- Upload images via admin panel first
- Use direct image URLs as fallback
- Check image file permissions

---

**Need help?** Check the [main documentation](README.md) or contact the development team.