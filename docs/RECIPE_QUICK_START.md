# 🚀 Quick Start: Add Your First Recipe

## Option 1: Copy & Paste Template (Fastest)

1. **Open** `E:\Projects\chang-cookbook\src\data\recipes.json`

2. **Find the closing bracket** of the last recipe (look for `},` near the end)

3. **Add a comma** after the last recipe and **paste this template**:

```json
    ,{
      "id": "my-favorite-recipe",
      "title": "My Favorite Recipe",
      "description": "Replace this with your recipe description",
      "category": "main-course",
      "difficulty": "easy", 
      "prepTime": 15,
      "cookTime": 30,
      "totalTime": 45,
      "servings": 4,
      "rating": 4.5,
      "reviewCount": 12,
      "image": "https://via.placeholder.com/800x500/ff9966/ffffff?text=My+Recipe",
      "chef": {
        "name": "Your Name Here",
        "avatar": "https://via.placeholder.com/100x100/4a3429/ffffff?text=You"
      },
      "tags": ["quick", "easy", "comfort-food"],
      "ingredients": [
        {"item": "first ingredient", "amount": "1 cup"},
        {"item": "second ingredient", "amount": "2 tbsp"},
        {"item": "third ingredient", "amount": "to taste"}
      ],
      "instructions": [
        "Step 1: Do this first thing",
        "Step 2: Then do this",
        "Step 3: Finally, do this and serve"
      ],
      "nutrition": {
        "calories": 350,
        "protein": "25g", 
        "carbs": "40g",
        "fat": "12g"
      },
      "featured": false,
      "createdAt": "2024-12-07"
    }
```

4. **Fill in your details** and **save the file**

5. **Restart the server**: `npm run dev`

6. **Visit your recipe**: `http://localhost:3002/recipes/my-favorite-recipe`

## Option 2: Use the Recipe Template

1. **Copy** `recipe-template.json` 
2. **Fill out** your recipe details
3. **Add it** to the recipes array in `src/data/recipes.json`

## Option 3: Validate Your Recipe

Run the validator to check for errors:
```bash
node validate-recipe.js
```

## 🎯 **Quick Tips**

### Recipe ID Rules
- Use lowercase only: `chocolate-chip-cookies` ✅
- No spaces: `chocolate chip cookies` ❌
- Use hyphens: `beef-stir-fry` ✅

### Categories Available
- `appetizers` - Starters, snacks
- `main-course` - Dinner entrees  
- `pasta` - All pasta dishes
- `salads` - Fresh salads
- `soups` - Broths, bisques, stews
- `desserts` - Sweet treats
- `asian-fusion` - Asian-inspired dishes
- `quick-meals` - 30 minutes or less

### Difficulty Levels
- `easy` - Simple, few ingredients
- `medium` - Some cooking skills needed
- `hard` - Advanced techniques required

### Time Guidelines
- Times are in **minutes**
- `prepTime` - Chopping, mixing, prep work
- `cookTime` - Active cooking time
- `totalTime` - Start to finish

## 🖼️ **Adding Recipe Images**

### Quick Option: Placeholder
```json
"image": "https://via.placeholder.com/800x500/ff9966/ffffff?text=Your+Recipe+Name"
```

### Own Images:
1. Create folder: `public/images/recipes/`
2. Add your image: `my-recipe.jpg`
3. Reference: `"image": "/images/recipes/my-recipe.jpg"`

## ✅ **Test Your Recipe**

1. Save `recipes.json`
2. Restart: `npm run dev` 
3. Check homepage for your recipe
4. Visit: `localhost:3002/recipes/your-recipe-id`
5. Test search and filtering

## 🆘 **Something Wrong?**

**Recipe not showing?**
- Check JSON syntax (missing commas, brackets)
- Restart development server
- Check browser console (F12) for errors

**JSON validator online:** jsonlint.com

Ready to add your first recipe? Just edit that JSON file! 🍳✨