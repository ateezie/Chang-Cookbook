const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function migrateRecipesToPostgres() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🚀 Starting recipe migration from JSON to PostgreSQL...')
    
    // Read the recipes JSON file
    const recipesPath = path.join(process.cwd(), 'src', 'data', 'recipes.json')
    const data = JSON.parse(fs.readFileSync(recipesPath, 'utf8'))
    
    console.log(`📖 Found ${data.recipes.length} recipes in JSON`)
    console.log(`📦 Found ${data.categories.length} categories in JSON`)
    
    // Get the chef profile for the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'hello@alexthip.com' },
      include: { chef: true }
    })
    
    if (!adminUser || !adminUser.chef) {
      console.error('❌ Admin user or chef profile not found')
      return
    }
    
    console.log(`👨‍🍳 Using chef: ${adminUser.chef.name} (${adminUser.chef.id})`)
    
    // Clear existing data (optional - comment out if you want to keep existing recipes)
    console.log('🧹 Clearing existing database recipes...')
    await prisma.instruction.deleteMany({})
    await prisma.ingredient.deleteMany({})
    await prisma.recipeTag.deleteMany({})
    await prisma.recipe.deleteMany({})
    await prisma.tag.deleteMany({})
    await prisma.category.deleteMany({})
    console.log('✅ Existing data cleared')
    
    // Migrate categories first
    console.log('\n📂 Migrating categories...')
    for (const category of data.categories) {
      await prisma.category.create({
        data: {
          id: category.id,
          name: category.name,
          description: category.description,
          emoji: category.emoji,
          count: 0 // Will be updated based on actual recipe count
        }
      })
      console.log(`✅ Category: ${category.name}`)
    }
    
    // Collect all unique tags
    const allTags = new Set()
    data.recipes.forEach(recipe => {
      recipe.tags.forEach(tag => allTags.add(tag))
    })
    
    // Create tags
    console.log('\n🏷️ Creating tags...')
    const tagMap = new Map()
    for (const tagName of allTags) {
      const tag = await prisma.tag.create({
        data: { name: tagName }
      })
      tagMap.set(tagName, tag.id)
      console.log(`✅ Tag: ${tagName}`)
    }
    
    // Migrate recipes
    console.log('\n🍳 Migrating recipes...')
    let migratedCount = 0
    
    for (const recipe of data.recipes) {
      try {
        console.log(`📝 Migrating: ${recipe.title}`)
        
        // Create the recipe
        const newRecipe = await prisma.recipe.create({
          data: {
            id: recipe.id,
            title: recipe.title,
            slug: recipe.slug,
            description: recipe.description,
            categoryId: recipe.category,
            difficulty: recipe.difficulty,
            prepTime: recipe.prepTime,
            cookTime: recipe.cookTime,
            totalTime: recipe.totalTime,
            servings: recipe.servings,
            rating: recipe.rating,
            reviewCount: recipe.reviewCount,
            image: recipe.image || null,
            featured: recipe.featured || false,
            chefId: adminUser.chef.id,
            authorId: adminUser.id,
            createdAt: new Date(recipe.createdAt)
          }
        })
        
        // Create ingredients
        for (let i = 0; i < recipe.ingredients.length; i++) {
          const ingredient = recipe.ingredients[i]
          await prisma.ingredient.create({
            data: {
              recipeId: newRecipe.id,
              item: ingredient.item,
              amount: ingredient.amount || '',
              order: i
            }
          })
        }
        
        // Create instructions
        for (let i = 0; i < recipe.instructions.length; i++) {
          const instruction = recipe.instructions[i]
          await prisma.instruction.create({
            data: {
              recipeId: newRecipe.id,
              step: instruction,
              order: i
            }
          })
        }
        
        // Create recipe-tag relationships
        for (const tagName of recipe.tags) {
          const tagId = tagMap.get(tagName)
          if (tagId) {
            await prisma.recipeTag.create({
              data: {
                recipeId: newRecipe.id,
                tagId: tagId
              }
            })
          }
        }
        
        migratedCount++
        console.log(`✅ Recipe migrated: ${recipe.title}`)
        
      } catch (error) {
        console.error(`❌ Error migrating ${recipe.title}:`, error.message)
      }
    }
    
    // Update category counts
    console.log('\n📊 Updating category counts...')
    for (const category of data.categories) {
      const count = await prisma.recipe.count({
        where: { categoryId: category.id }
      })
      
      await prisma.category.update({
        where: { id: category.id },
        data: { count }
      })
      
      console.log(`📈 ${category.name}: ${count} recipes`)
    }
    
    console.log('\n🎉 Migration completed successfully!')
    console.log(`✅ Migrated ${migratedCount} out of ${data.recipes.length} recipes`)
    console.log(`✅ Created ${allTags.size} tags`)
    console.log(`✅ Created ${data.categories.length} categories`)
    
    // Display summary
    const totalRecipes = await prisma.recipe.count()
    const totalIngredients = await prisma.ingredient.count()
    const totalInstructions = await prisma.instruction.count()
    
    console.log('\n📋 Database summary:')
    console.log(`- Recipes: ${totalRecipes}`)
    console.log(`- Ingredients: ${totalIngredients}`)
    console.log(`- Instructions: ${totalInstructions}`)
    console.log(`- Tags: ${allTags.size}`)
    console.log(`- Categories: ${data.categories.length}`)
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

migrateRecipesToPostgres()