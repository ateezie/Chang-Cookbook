const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

// Function to generate URL-friendly slugs
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function initializeDatabase() {
  console.log('🗃️ Initializing Chang Cookbook database...')
  
  // Ensure database directory exists
  const dbDir = '/app/data'
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
    console.log('✅ Created database directory')
  }

  // Set database URL for this init process
  process.env.DATABASE_URL = 'file:/app/data/production.db'
  
  const prisma = new PrismaClient()

  try {
    // Check if database is properly initialized by running a simple query
    const recipeCount = await prisma.recipe.count().catch(() => null)
    
    if (recipeCount !== null && recipeCount > 0) {
      console.log(`✅ Database already has ${recipeCount} recipes - skipping initialization`)
      return
    }

    console.log('🔄 Database needs initialization...')

    // Read the recipes JSON file
    const recipesPath = path.join(process.cwd(), 'src', 'data', 'recipes.json')
    
    if (!fs.existsSync(recipesPath)) {
      console.error('❌ recipes.json not found at:', recipesPath)
      return
    }

    const data = JSON.parse(fs.readFileSync(recipesPath, 'utf8'))
    const { recipes, categories } = data

    console.log(`📊 Found ${recipes.length} recipes and ${categories.length} categories`)

    // Create default admin user if doesn't exist
    console.log('👤 Setting up admin user...')
    const adminEmail = process.env.ADMIN_EMAIL || 'hello@alexthip.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'cAEj05d7TtCf*@zD'

    let admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    }).catch(() => null)

    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12)
      admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Chang Cookbook Admin',
          role: 'admin'
        }
      })
      console.log('✅ Created admin user:', adminEmail)
    } else {
      console.log('✅ Admin user already exists')
    }

    // Migrate categories
    console.log('📁 Migrating categories...')
    for (const category of categories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: {
          name: category.name,
          description: category.description,
          emoji: category.emoji,
          count: category.count
        },
        create: {
          id: category.id,
          name: category.name,
          description: category.description,
          emoji: category.emoji,
          count: category.count
        }
      })
    }
    console.log(`✅ Migrated ${categories.length} categories`)

    // Set up chefs
    console.log('👨‍🍳 Setting up chefs...')
    const chefMap = new Map()

    for (const recipe of recipes) {
      if (recipe.chef && !chefMap.has(recipe.chef.name)) {
        let chef = await prisma.chef.findFirst({
          where: { name: recipe.chef.name }
        })

        if (!chef) {
          chef = await prisma.chef.create({
            data: {
              name: recipe.chef.name,
              avatar: recipe.chef.avatar
            }
          })
        }
        chefMap.set(recipe.chef.name, chef.id)
      }
    }
    console.log(`✅ Set up ${chefMap.size} chefs`)

    // Migrate recipes
    console.log('🍳 Migrating recipes...')
    let migratedCount = 0

    for (const recipe of recipes) {
      try {
        // Get chef ID
        const chefId = chefMap.get(recipe.chef.name)
        if (!chefId) continue

        // Generate slug from title
        const slug = generateSlug(recipe.title)

        // Create recipe in transaction
        await prisma.$transaction(async (tx) => {
          const newRecipe = await tx.recipe.create({
            data: {
              id: recipe.id,
              title: recipe.title,
              slug: slug,
              description: recipe.description,
              categoryId: recipe.category,
              difficulty: recipe.difficulty,
              prepTime: recipe.prepTime,
              cookTime: recipe.cookTime,
              totalTime: recipe.totalTime,
              servings: recipe.servings,
              rating: recipe.rating,
              reviewCount: recipe.reviewCount,
              image: recipe.image,
              imageCredit: recipe.imageCredit,
              unsplashId: recipe.unsplashId,
              featured: recipe.featured || false,
              chefId: chefId,
              authorId: admin.id,
              createdAt: new Date(recipe.createdAt + 'T00:00:00.000Z')
            }
          })

          // Create ingredients
          if (recipe.ingredients && recipe.ingredients.length > 0) {
            await tx.ingredient.createMany({
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
            await tx.instruction.createMany({
              data: recipe.instructions.map((instruction, index) => ({
                recipeId: newRecipe.id,
                step: instruction,
                order: index
              }))
            })
          }

          // Create nutrition
          if (recipe.nutrition) {
            await tx.nutrition.create({
              data: {
                recipeId: newRecipe.id,
                calories: recipe.nutrition.calories,
                protein: recipe.nutrition.protein,
                carbs: recipe.nutrition.carbs,
                fat: recipe.nutrition.fat
              }
            })
          }

          // Create tags
          if (recipe.tags && recipe.tags.length > 0) {
            for (const tagName of recipe.tags) {
              let tag = await tx.tag.findUnique({
                where: { name: tagName }
              })

              if (!tag) {
                tag = await tx.tag.create({
                  data: { name: tagName }
                })
              }

              await tx.recipeTag.create({
                data: {
                  recipeId: newRecipe.id,
                  tagId: tag.id
                }
              })
            }
          }
        })

        migratedCount++
        console.log(`✅ Migrated: ${recipe.title}`)

      } catch (error) {
        console.error(`❌ Error migrating recipe ${recipe.title}:`, error.message)
      }
    }

    // Update category counts
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

    console.log('\n🎉 Database initialization completed!')
    console.log(`✅ Successfully migrated: ${migratedCount} recipes`)

  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = { initializeDatabase }