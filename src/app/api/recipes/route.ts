import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateAdmin } from '@/lib/auth'
import { CreateRecipeSchema, RecipeQuerySchema } from '@/lib/validations/recipe'
import { z } from 'zod'

// GET /api/recipes - List recipes with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = RecipeQuerySchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      category: searchParams.get('category') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      featured: searchParams.get('featured') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'newest',
      order: searchParams.get('order') || 'desc'
    })

    const { page, limit, category, difficulty, featured, search, sortBy, order } = query

    // Build where clause
    const where: any = {}
    
    if (category) where.categoryId = category
    if (difficulty) where.difficulty = difficulty
    if (featured !== undefined) where.featured = featured
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { ingredients: { some: { item: { contains: search, mode: 'insensitive' } } } }
      ]
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' } // default
    
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: order }
        break
      case 'oldest':
        orderBy = { createdAt: order }
        break
      case 'rating':
        orderBy = { rating: order }
        break
      case 'prepTime':
        orderBy = { prepTime: order }
        break
      case 'title':
        orderBy = { title: order }
        break
    }

    const [recipes, totalCount] = await Promise.all([
      prisma.recipe.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
          chef: true,
          ingredients: {
            orderBy: { order: 'asc' }
          },
          instructions: {
            orderBy: { order: 'asc' }
          },
          nutrition: true,
          tags: {
            include: { tag: true }
          }
        }
      }),
      prisma.recipe.count({ where })
    ])

    // Transform the data to match your existing Recipe interface
    const transformedRecipes = recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      slug: recipe.slug,
      description: recipe.description,
      category: recipe.categoryId,
      difficulty: recipe.difficulty,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      totalTime: recipe.totalTime,
      servings: recipe.servings,
      rating: recipe.rating,
      reviewCount: recipe.reviewCount,
      image: recipe.image || '',
      imageCredit: recipe.imageCredit,
      unsplashId: recipe.unsplashId,
      featured: recipe.featured,
      createdAt: recipe.createdAt.toISOString().split('T')[0],
      chef: {
        name: recipe.chef.name,
        avatar: recipe.chef.avatar || ''
      },
      ingredients: recipe.ingredients.map(ing => ({
        item: ing.item,
        amount: ing.amount
      })),
      instructions: recipe.instructions.map(inst => inst.step),
      nutrition: recipe.nutrition ? {
        calories: recipe.nutrition.calories,
        protein: recipe.nutrition.protein,
        carbs: recipe.nutrition.carbs,
        fat: recipe.nutrition.fat
      } : undefined,
      tags: recipe.tags.map(t => t.tag.name)
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      recipes: transformedRecipes,
      totalCount,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    })

  } catch (error) {
    console.error('Error fetching recipes:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/recipes - Create new recipe (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const adminUser = await authenticateAdmin(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = CreateRecipeSchema.parse(body)

    // Check if recipe ID already exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: data.id }
    })

    if (existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe with this ID already exists' },
        { status: 409 }
      )
    }

    // Create or find chef
    let chef = await prisma.chef.findFirst({
      where: { name: data.chef.name }
    })

    if (!chef) {
      chef = await prisma.chef.create({
        data: {
          name: data.chef.name,
          avatar: data.chef.avatar
        }
      })
    }

    // Create recipe with related data in a transaction
    const recipe = await prisma.$transaction(async (tx) => {
      // Create the recipe
      const newRecipe = await tx.recipe.create({
        data: {
          id: data.id,
          title: data.title,
          slug: data.slug,
          description: data.description,
          categoryId: data.categoryId,
          difficulty: data.difficulty,
          prepTime: data.prepTime,
          cookTime: data.cookTime,
          totalTime: data.totalTime,
          servings: data.servings,
          image: data.image,
          imageCredit: data.imageCredit,
          unsplashId: data.unsplashId,
          featured: data.featured,
          chefId: chef!.id,
          authorId: adminUser.userId
        }
      })

      // Create ingredients
      await tx.ingredient.createMany({
        data: data.ingredients.map((ingredient, index) => ({
          recipeId: newRecipe.id,
          item: ingredient.item,
          amount: ingredient.amount,
          order: index
        }))
      })

      // Create instructions
      await tx.instruction.createMany({
        data: data.instructions.map((instruction, index) => ({
          recipeId: newRecipe.id,
          step: instruction,
          order: index
        }))
      })

      // Create nutrition if provided
      if (data.nutrition) {
        await tx.nutrition.create({
          data: {
            recipeId: newRecipe.id,
            calories: data.nutrition.calories,
            protein: data.nutrition.protein,
            carbs: data.nutrition.carbs,
            fat: data.nutrition.fat
          }
        })
      }

      // Handle tags
      if (data.tags.length > 0) {
        for (const tagName of data.tags) {
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

      return newRecipe
    })

    return NextResponse.json(
      { message: 'Recipe created successfully', id: recipe.id },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating recipe:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}