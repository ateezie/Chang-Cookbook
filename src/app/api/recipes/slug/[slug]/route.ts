import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/recipes/slug/[slug] - Get recipe by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      include: {
        category: true,
        chef: true,
        ingredients: {
          orderBy: { order: 'asc' }
        },
        instructions: {
          orderBy: { order: 'asc' }
        },
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
      tags: recipe.tags.map(t => t.tag.name)
    }

    return NextResponse.json({ recipe: transformedRecipe })

  } catch (error) {
    console.error('Error fetching recipe by slug:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}