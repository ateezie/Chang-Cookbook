import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateAdmin } from '@/lib/auth'
import { UpdateRecipeSchema } from '@/lib/validations/recipe'
import { generateSlug } from '@/lib/slug'
import { z } from 'zod'

// GET /api/recipes/[id] - Get single recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const recipe = await prisma.recipe.findUnique({
      where: { id },
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
    })

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    // Transform to match existing Recipe interface
    const transformedRecipe = {
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
    }

    return NextResponse.json({ recipe: transformedRecipe })

  } catch (error) {
    console.error('Error fetching recipe:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/recipes/[id] - Update recipe (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate admin
    const adminUser = await authenticateAdmin(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const data = UpdateRecipeSchema.parse({ ...body, id })

    // Check if recipe exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: true,
        instructions: true,
        nutrition: true,
        tags: true
      }
    })

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    // Update recipe in transaction
    const updatedRecipe = await prisma.$transaction(async (tx) => {
      // Handle chef update if provided
      let chefId = existingRecipe.chefId
      if (data.chef) {
        let chef = await tx.chef.findFirst({
          where: { name: data.chef.name }
        })

        if (!chef) {
          chef = await tx.chef.create({
            data: {
              name: data.chef.name,
              avatar: data.chef.avatar
            }
          })
        } else if (data.chef.avatar && chef.avatar !== data.chef.avatar) {
          chef = await tx.chef.update({
            where: { id: chef.id },
            data: { avatar: data.chef.avatar }
          })
        }
        chefId = chef.id
      }

      // Auto-generate slug if title is updated but slug is not provided
      if (data.title && !data.slug) {
        data.slug = generateSlug(data.title)
      }

      // Update main recipe fields
      const recipe = await tx.recipe.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.slug && { slug: data.slug }),
          ...(data.description && { description: data.description }),
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.difficulty && { difficulty: data.difficulty }),
          ...(data.prepTime !== undefined && { prepTime: data.prepTime }),
          ...(data.cookTime !== undefined && { cookTime: data.cookTime }),
          ...(data.totalTime !== undefined && { totalTime: data.totalTime }),
          ...(data.servings !== undefined && { servings: data.servings }),
          ...(data.image !== undefined && { image: data.image }),
          ...(data.imageCredit !== undefined && { imageCredit: data.imageCredit }),
          ...(data.unsplashId !== undefined && { unsplashId: data.unsplashId }),
          ...(data.featured !== undefined && { featured: data.featured }),
          chefId
        }
      })

      // Update ingredients if provided
      if (data.ingredients) {
        await tx.ingredient.deleteMany({ where: { recipeId: id } })
        await tx.ingredient.createMany({
          data: data.ingredients.map((ingredient, index) => ({
            recipeId: id,
            item: ingredient.item,
            amount: ingredient.amount,
            order: index
          }))
        })
      }

      // Update instructions if provided
      if (data.instructions) {
        await tx.instruction.deleteMany({ where: { recipeId: id } })
        await tx.instruction.createMany({
          data: data.instructions.map((instruction, index) => ({
            recipeId: id,
            step: instruction,
            order: index
          }))
        })
      }

      // Update nutrition if provided
      if (data.nutrition) {
        await tx.nutrition.upsert({
          where: { recipeId: id },
          create: {
            recipeId: id,
            calories: data.nutrition.calories,
            protein: data.nutrition.protein,
            carbs: data.nutrition.carbs,
            fat: data.nutrition.fat
          },
          update: {
            calories: data.nutrition.calories,
            protein: data.nutrition.protein,
            carbs: data.nutrition.carbs,
            fat: data.nutrition.fat
          }
        })
      }

      // Update tags if provided
      if (data.tags) {
        // Remove existing tags
        await tx.recipeTag.deleteMany({ where: { recipeId: id } })

        // Add new tags
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
              recipeId: id,
              tagId: tag.id
            }
          })
        }
      }

      return recipe
    })

    return NextResponse.json({
      message: 'Recipe updated successfully',
      id: updatedRecipe.id
    })

  } catch (error) {
    console.error('Error updating recipe:', error)
    
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

// DELETE /api/recipes/[id] - Delete recipe (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate admin
    const adminUser = await authenticateAdmin(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if recipe exists
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id }
    })

    if (!existingRecipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      )
    }

    // Delete recipe (cascade will handle related records)
    await prisma.recipe.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Recipe deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting recipe:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}