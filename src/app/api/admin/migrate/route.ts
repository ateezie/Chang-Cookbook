import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Function to generate URL-friendly slugs
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authorization = request.headers.get('authorization')
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authorization.split(' ')[1]
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
    
    try {
      jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Parse form data
    const formData = await request.formData()
    const jsonFile = formData.get('jsonFile') as File
    
    if (!jsonFile) {
      return NextResponse.json({ error: 'No JSON file provided' }, { status: 400 })
    }

    // Read and parse JSON file
    const jsonText = await jsonFile.text()
    let jsonData: any

    try {
      jsonData = JSON.parse(jsonText)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON format' }, { status: 400 })
    }

    // Handle both single recipe and multiple recipe formats
    let recipes: any[]
    let categories: any[]

    // Check if it's a single recipe format (like honey.json)
    if (jsonData.title && jsonData.ingredients && jsonData.instructions) {
      // Single recipe format - wrap it in the expected structure
      recipes = [jsonData]
      categories = [{
        id: jsonData.category || 'main-course',
        name: jsonData.category?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Main Course',
        description: `Category for ${jsonData.category || 'main course'} recipes`,
        emoji: '🍳',
        count: 1
      }]
    } else {
      // Multiple recipe format - validate structure
      if (!jsonData.recipes || !Array.isArray(jsonData.recipes)) {
        return NextResponse.json({ error: 'Missing or invalid recipes array' }, { status: 400 })
      }

      if (!jsonData.categories || !Array.isArray(jsonData.categories)) {
        return NextResponse.json({ error: 'Missing or invalid categories array' }, { status: 400 })
      }

      recipes = jsonData.recipes
      categories = jsonData.categories
    }
    const results = {
      recipes: 0,
      categories: 0,
      chefs: 0,
      skipped: 0,
      errors: [] as string[]
    }

    try {
      // Get or create admin user
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@changcookbook.com'
      let admin = await prisma.user.findUnique({
        where: { email: adminEmail }
      })

      if (!admin) {
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
        const hashedPassword = await bcrypt.hash(adminPassword, 12)
        admin = await prisma.user.create({
          data: {
            email: adminEmail,
            password: hashedPassword,
            name: 'Chang Cookbook Admin',
            role: 'admin'
          }
        })
      }

      // Migrate categories
      for (const category of categories) {
        try {
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
          results.categories++
        } catch (error) {
          results.errors.push(`Category ${category.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Set up chefs
      const chefMap = new Map<string, string>()

      for (const recipe of recipes) {
        if (recipe.chef && !chefMap.has(recipe.chef.name)) {
          try {
            let chef = await prisma.chef.findFirst({
              where: { name: recipe.chef.name }
            })

            if (!chef) {
              chef = await prisma.chef.create({
                data: {
                  name: recipe.chef.name,
                  avatar: recipe.chef.avatar || null
                }
              })
              results.chefs++
            }
            chefMap.set(recipe.chef.name, chef.id)
          } catch (error) {
            results.errors.push(`Chef ${recipe.chef.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }
      }

      // Migrate recipes
      for (const recipe of recipes) {
        try {
          // Check if recipe already exists
          const existingRecipe = await prisma.recipe.findUnique({
            where: { id: recipe.id }
          })

          if (existingRecipe) {
            results.skipped++
            continue
          }

          // Get chef ID
          const chefId = chefMap.get(recipe.chef.name)
          if (!chefId) {
            results.errors.push(`Recipe ${recipe.title}: Chef not found`)
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
                totalTime: recipe.totalTime || (recipe.prepTime + recipe.cookTime),
                servings: recipe.servings,
                rating: recipe.rating || 0,
                reviewCount: recipe.reviewCount || 0,
                image: recipe.image,
                imageCredit: recipe.imageCredit,
                unsplashId: recipe.unsplashId,
                featured: recipe.featured || false,
                chefId: chefId,
                authorId: admin.id,
                createdAt: recipe.createdAt ? new Date(recipe.createdAt + 'T00:00:00.000Z') : new Date()
              }
            })

            // Create ingredients
            if (recipe.ingredients && recipe.ingredients.length > 0) {
              await tx.ingredient.createMany({
                data: recipe.ingredients.map((ingredient: any, index: number) => ({
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
                data: recipe.instructions.map((instruction: string, index: number) => ({
                  recipeId: newRecipe.id,
                  step: instruction,
                  order: index
                }))
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

          results.recipes++

        } catch (error) {
          results.errors.push(`Recipe ${recipe.title}: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

      return NextResponse.json({
        message: 'Migration completed successfully',
        results
      })

    } catch (error) {
      console.error('Migration error:', error)
      return NextResponse.json(
        { error: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Migration API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}