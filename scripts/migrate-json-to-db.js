const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

// Function to generate URL-friendly slugs
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting migration from JSON to database...')

  try {
    // Read the recipes JSON file
    const recipesPath = path.join(process.cwd(), 'src', 'data', 'recipes.json')
    
    if (!fs.existsSync(recipesPath)) {
      console.error('❌ recipes.json not found at:', recipesPath)
      return
    }

    const data = JSON.parse(fs.readFileSync(recipesPath, 'utf8'))
    const { recipes, categories } = data

    console.log(`📊 Found ${recipes.length} recipes and ${categories.length} categories`)

    // 1. Create default admin user if doesn't exist
    console.log('👤 Setting up admin user...')
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@changcookbook.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    let admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

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

    // 2. Migrate categories
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

    // 3. Create a default chef if recipes have chef data
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

    // 4. Migrate recipes
    console.log('🍳 Migrating recipes...')
    let migratedCount = 0
    let skippedCount = 0

    for (const recipe of recipes) {
      try {
        // Check if recipe already exists
        const existingRecipe = await prisma.recipe.findUnique({
          where: { id: recipe.id }
        })

        if (existingRecipe) {
          console.log(`⚠️  Skipping existing recipe: ${recipe.title}`)
          skippedCount++
          continue
        }

        // Get chef ID
        const chefId = chefMap.get(recipe.chef.name)
        if (!chefId) {
          console.error(`❌ No chef found for recipe: ${recipe.title}`)
          continue
        }

        // Create the recipe in a transaction
        await prisma.$transaction(async (tx) => {
          // Generate slug from title
          const slug = generateSlug(recipe.title)

          // Create recipe
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
              // Create or find tag
              let tag = await tx.tag.findUnique({
                where: { name: tagName }
              })

              if (!tag) {
                tag = await tx.tag.create({
                  data: { name: tagName }
                })
              }

              // Create recipe-tag relation
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

    // 5. Update category counts
    console.log('🔢 Updating category counts...')
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

    console.log('\n🎉 Migration completed!')
    console.log(`✅ Successfully migrated: ${migratedCount} recipes`)
    console.log(`⚠️  Skipped existing: ${skippedCount} recipes`)
    console.log(`📁 Categories: ${categories.length}`)
    console.log(`👨‍🍳 Chefs: ${chefMap.size}`)
    
    console.log('\n📝 Next steps:')
    console.log('1. Start your development server: npm run dev')
    console.log('2. Visit http://localhost:3000/admin to login')
    console.log(`3. Use credentials: ${adminEmail} / ${adminPassword}`)
    console.log('4. Your recipes are now available via API endpoints!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })