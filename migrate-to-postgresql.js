const fs = require('fs')
const path = require('path')

// Migration script to set up PostgreSQL with existing recipe data
async function migrateToPostgreSQL() {
  console.log('🐘 Starting migration to PostgreSQL...')
  
  // Check if DATABASE_URL is set to PostgreSQL
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('postgresql')) {
    console.error('❌ Please set DATABASE_URL to your Neon PostgreSQL connection string first!')
    console.log('Example: DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"')
    process.exit(1)
  }

  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    // Test connection
    console.log('🔗 Testing PostgreSQL connection...')
    await prisma.$connect()
    console.log('✅ Successfully connected to PostgreSQL!')

    // Read existing recipe data
    const recipesPath = path.join(__dirname, 'src', 'data', 'recipes.json')
    if (!fs.existsSync(recipesPath)) {
      console.error('❌ recipes.json not found!')
      process.exit(1)
    }

    const data = JSON.parse(fs.readFileSync(recipesPath, 'utf8'))
    const { recipes } = data

    console.log(`📊 Found ${recipes.length} recipes to migrate`)

    // Check if data already exists
    const existingRecipes = await prisma.recipe.count().catch(() => 0)
    if (existingRecipes > 0) {
      console.log(`⚠️  Database already contains ${existingRecipes} recipes`)
      console.log('Skipping data migration (database already populated)')
      await prisma.$disconnect()
      return
    }

    // Seed categories first
    console.log('📁 Setting up categories...')
    const categories = [
      { id: 'appetizers', name: 'Appetizers', description: 'Starters and appetizers', emoji: '🥗' },
      { id: 'main-course', name: 'Main Course', description: 'Main dishes and entrees', emoji: '🍽️' },
      { id: 'side-dishes', name: 'Side Dishes', description: 'Sides and accompaniments', emoji: '🥄' },
      { id: 'desserts', name: 'Desserts', description: 'Sweet treats and desserts', emoji: '🍰' },
      { id: 'beverages', name: 'Beverages', description: 'Drinks and beverages', emoji: '🥤' },
      { id: 'snacks', name: 'Snacks', description: 'Quick bites and snacks', emoji: '🍿' },
      { id: 'breakfast', name: 'Breakfast', description: 'Morning meals and brunch', emoji: '🥞' },
      { id: 'quick-meals', name: 'Quick Meals', description: 'Fast and easy meals', emoji: '⚡' }
    ]

    for (const category of categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: category,
        create: category
      })
    }
    console.log(`✅ Created ${categories.length} categories`)

    // Create chefs
    console.log('👨‍🍳 Setting up chefs...')
    const chefMap = new Map()
    const uniqueChefs = new Map()

    recipes.forEach(recipe => {
      if (recipe.chef && !uniqueChefs.has(recipe.chef.name)) {
        uniqueChefs.set(recipe.chef.name, recipe.chef)
      }
    })

    for (const [name, chefData] of uniqueChefs) {
      const chef = await prisma.chef.create({
        data: {
          name: chefData.name,
          avatar: chefData.avatar
        }
      })
      chefMap.set(name, chef.id)
    }
    console.log(`✅ Created ${chefMap.size} chefs`)

    // Migrate recipes
    console.log('🍳 Migrating recipes...')
    let successCount = 0

    for (const recipe of recipes) {
      try {
        const chefId = chefMap.get(recipe.chef.name)
        if (!chefId) continue

        const newRecipe = await prisma.recipe.create({
          data: {
            id: recipe.id,
            title: recipe.title,
            slug: recipe.id, // Use ID as slug
            description: recipe.description,
            categoryId: recipe.category,
            difficulty: recipe.difficulty,
            prepTime: recipe.prepTime,
            cookTime: recipe.cookTime,
            totalTime: recipe.totalTime,
            servings: recipe.servings,
            rating: recipe.rating || 0,
            reviewCount: recipe.reviewCount || 0,
            image: recipe.image,
            featured: recipe.featured || false,
            chefId: chefId,
            createdAt: new Date(recipe.createdAt + 'T00:00:00.000Z')
          }
        })

        // Create ingredients
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          await prisma.ingredient.createMany({
            data: recipe.ingredients.map((ingredient, index) => ({
              recipeId: newRecipe.id,
              item: ingredient.item,
              amount: ingredient.amount || '',
              order: index
            }))
          })
        }

        // Create instructions
        if (recipe.instructions && recipe.instructions.length > 0) {
          await prisma.instruction.createMany({
            data: recipe.instructions.map((instruction, index) => ({
              recipeId: newRecipe.id,
              step: instruction,
              order: index
            }))
          })
        }

        successCount++
        if (successCount % 5 === 0) {
          console.log(`📝 Migrated ${successCount} recipes so far...`)
        }

      } catch (error) {
        console.error(`❌ Error migrating recipe ${recipe.title}:`, error.message)
      }
    }

    // Update category counts
    console.log('📊 Updating category counts...')
    const categoryStats = await prisma.recipe.groupBy({
      by: ['categoryId'],
      _count: { id: true }
    })

    for (const stat of categoryStats) {
      await prisma.category.update({
        where: { id: stat.categoryId },
        data: { count: stat._count.id }
      })
    }

    console.log(`\n🎉 Migration completed successfully!`)
    console.log(`✅ Migrated ${successCount} recipes to PostgreSQL`)
    console.log(`🐘 Your Chang Cookbook is now running on PostgreSQL!`)

    await prisma.$disconnect()

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Instructions for user
if (require.main === module) {
  console.log('🐘 Chang Cookbook PostgreSQL Migration')
  console.log('=====================================')
  console.log('')
  console.log('Before running this script:')
  console.log('1. Create a Neon PostgreSQL database at https://neon.tech')
  console.log('2. Update your .env file with the PostgreSQL connection string:')
  console.log('   DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"')
  console.log('3. Run: npx prisma migrate dev --name init_postgresql')
  console.log('4. Then run: node migrate-to-postgresql.js')
  console.log('')
  
  migrateToPostgreSQL()
}

module.exports = { migrateToPostgreSQL }