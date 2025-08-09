# 🍳 How to Add Your Own Recipes to Chang Cookbook

## 📝 **Method 1: Direct JSON Editing (Recommended)**

### Step 1: Open the Recipe File
Edit this file: `E:\Projects\chang-cookbook\src\data\recipes.json`

### Step 2: Add Your Recipe
Copy this template and add it to the "recipes" array:

```json
{
  "id": "your-recipe-slug",
  "title": "Your Recipe Name",
  "description": "A brief description of your recipe (1-2 sentences)",
  "category": "main-course",
  "difficulty": "easy",
  "prepTime": 15,
  "cookTime": 30,
  "totalTime": 45,
  "servings": 4,
  "rating": 4.5,
  "reviewCount": 23,
  "image": "https://images.unsplash.com/your-image-url",
  "chef": {
    "name": "Your Name",
    "avatar": "https://images.unsplash.com/your-avatar-url"
  },
  "tags": ["tag1", "tag2", "tag3"],
  "ingredients": [
    {
      "item": "ingredient name",
      "amount": "1 cup"
    },
    {
      "item": "another ingredient", 
      "amount": "2 tbsp"
    }
  ],
  "instructions": [
    "Step 1: Do this first thing...",
    "Step 2: Then do this...",
    "Step 3: Finally, do this..."
  ],
  "nutrition": {
    "calories": 350,
    "protein": "25g",
    "carbs": "40g", 
    "fat": "12g"
  },
  "featured": false,
  "createdAt": "2024-01-15"
}
```

### Step 3: Fill Out Your Recipe Details

**Required Fields:**
- `id`: URL-friendly slug (lowercase, hyphens instead of spaces)
- `title`: Recipe name as it appears on the site
- `description`: 1-2 sentence description
- `category`: One of the existing categories (see below)
- `difficulty`: "easy", "medium", or "hard"
- `prepTime`, `cookTime`, `totalTime`: In minutes
- `servings`: Number of servings
- `ingredients`: Array of ingredient objects
- `instructions`: Array of step-by-step instructions

**Available Categories:**
- `appetizers`
- `main-course` 
- `pasta`
- `salads`
- `soups`
- `desserts`
- `asian-fusion`
- `quick-meals`

### Step 4: Add Nutrition Info (Optional but Recommended)
```json
"nutrition": {
  "calories": 350,
  "protein": "25g",
  "carbs": "40g",
  "fat": "12g"
}
```

## 🖼️ **Method 2: Add Your Own Recipe Images**

### Option A: Use Your Own Images
1. Create directory: `E:\Projects\chang-cookbook\public\images\recipes\`
2. Add your recipe images: `your-recipe-name.jpg`
3. Reference in JSON: `"image": "/images/recipes/your-recipe-name.jpg"`

### Option B: Use Stock Images
- Unsplash: `https://images.unsplash.com/photo-ID?w=800&q=80`
- Placeholder: `https://via.placeholder.com/800x500/ff9966/ffffff?text=Recipe`

## 👨‍🍳 **Method 3: Create Your Chef Profile**

Add yourself as a chef in the recipe:
```json
"chef": {
  "name": "Your Name",
  "avatar": "/images/chefs/your-photo.jpg"
}
```

Create the chef directory: `E:\Projects\chang-cookbook\public\images\chefs\`

## 🏷️ **Method 4: Organize with Tags**

Use relevant tags for better searchability:
```json
"tags": ["quick", "healthy", "vegetarian", "gluten-free", "comfort-food", "italian", "spicy", "one-pot"]
```

## 📋 **Complete Example Recipe**

Here's a fully filled example:

```json
{
  "id": "grandmas-apple-pie",
  "title": "Grandma's Classic Apple Pie", 
  "description": "Traditional apple pie with flaky crust and cinnamon-spiced apples. A family recipe passed down for generations.",
  "category": "desserts",
  "difficulty": "medium",
  "prepTime": 45,
  "cookTime": 60,
  "totalTime": 105,
  "servings": 8,
  "rating": 4.8,
  "reviewCount": 156,
  "image": "/images/recipes/apple-pie.jpg",
  "chef": {
    "name": "Sarah Johnson",
    "avatar": "/images/chefs/sarah.jpg"
  },
  "tags": ["dessert", "apple", "pie", "family-recipe", "comfort-food"],
  "ingredients": [
    {
      "item": "all-purpose flour",
      "amount": "2½ cups"
    },
    {
      "item": "unsalted butter, cold",
      "amount": "1 cup"
    },
    {
      "item": "Granny Smith apples, peeled and sliced",
      "amount": "6 large"
    },
    {
      "item": "granulated sugar",
      "amount": "¾ cup"
    },
    {
      "item": "ground cinnamon",
      "amount": "1 tsp"
    },
    {
      "item": "vanilla extract",
      "amount": "1 tsp"
    }
  ],
  "instructions": [
    "Make pie crust: Mix flour and salt. Cut in cold butter until mixture resembles coarse crumbs. Add ice water gradually until dough forms.",
    "Roll out bottom crust and place in 9-inch pie pan. Trim edges.",
    "Prepare filling: Toss sliced apples with sugar, cinnamon, and vanilla. Let sit 10 minutes.",
    "Fill pie shell with apple mixture. Dot with butter pieces.",
    "Roll out top crust and place over filling. Seal edges and cut steam vents.",
    "Bake at 425°F for 15 minutes, then reduce to 350°F and bake 35-40 minutes until golden."
  ],
  "nutrition": {
    "calories": 385,
    "protein": "4g",
    "carbs": "58g",
    "fat": "16g"
  },
  "featured": true,
  "createdAt": "2024-01-20"
}
```

## 🔧 **Method 5: Batch Import Multiple Recipes**

### Create a Recipe Import Tool
I can create a simple script to help you import multiple recipes at once. Would you like me to create:
1. **CSV Import Tool** - Import from spreadsheet
2. **Recipe Parser** - Convert from text format
3. **JSON Generator** - Interactive recipe builder

## ✅ **Testing Your New Recipes**

After adding recipes:
1. Save the `recipes.json` file
2. Restart development server: `npm run dev`
3. Visit `http://localhost:3002` to see your recipes
4. Check individual recipe pages: `http://localhost:3002/recipes/your-recipe-slug`

## 🚀 **Pro Tips**

### Recipe ID Guidelines
- Use lowercase letters, numbers, and hyphens only
- Make it descriptive: `spicy-thai-green-curry` not `recipe1`
- Keep it concise but clear

### Image Recommendations
- **Size**: 800x500 pixels (16:10 aspect ratio works best)
- **Format**: JPG or PNG
- **Quality**: High resolution, good lighting
- **Style**: Overhead shots or 45-degree angle work well

### Instruction Best Practices
- Start each step with an action verb
- Be specific about temperatures, times, and measurements
- Include visual cues ("until golden brown", "doubled in size")
- Keep steps concise but complete

### Category Guidelines
- Choose the most appropriate primary category
- Use tags for additional categorization
- Consider creating new categories if needed

## 🆘 **Need Help?**

**Common Issues:**
- **Recipe not appearing?** Check JSON syntax and restart server
- **Images not loading?** Verify image paths and file names
- **Formatting issues?** Use a JSON validator online

**Recipe doesn't display correctly?**
- Ensure all required fields are present
- Check that ingredient/instruction arrays are properly formatted
- Verify category matches existing categories

Ready to start adding your recipes? Just edit `src/data/recipes.json` and add your culinary creations! 🍳✨