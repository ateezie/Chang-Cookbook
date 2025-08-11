import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateAdmin } from '@/lib/auth'
import { z } from 'zod'

const CategorySchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
  name: z.string().min(1, 'Category name is required'),
  description: z.string().min(1, 'Category description is required'),
  emoji: z.string().min(1, 'Category emoji is required')
})

// GET /api/categories - List all categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { recipes: true }
        }
      }
    })

    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      emoji: category.emoji,
      count: category._count.recipes
    }))

    return NextResponse.json({ categories: transformedCategories })

  } catch (error) {
    console.error('Error fetching categories:', error)
    
    // Return fallback categories during build time or database connection issues
    const fallbackCategories = [
      { id: 'main-course', name: 'Main Course', description: 'Main dishes and entrees', emoji: '🍽️', count: 0 },
      { id: 'appetizers', name: 'Appetizers', description: 'Starters and appetizers', emoji: '🥗', count: 0 },
      { id: 'desserts', name: 'Desserts', description: 'Sweet treats and desserts', emoji: '🍰', count: 0 },
      { id: 'quick-meals', name: 'Quick Meals', description: 'Fast and easy meals', emoji: '⚡', count: 0 },
      { id: 'snacks', name: 'Snacks', description: 'Quick bites and snacks', emoji: '🍿', count: 0 },
      { id: 'breakfast', name: 'Breakfast', description: 'Morning meals and brunch', emoji: '🥞', count: 0 }
    ]
    
    return NextResponse.json({ categories: fallbackCategories })
  }
}

// POST /api/categories - Create new category (Admin only)
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
    const data = CategorySchema.parse(body)

    // Check if category ID already exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: data.id }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this ID already exists' },
        { status: 409 }
      )
    }

    const category = await prisma.category.create({
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        emoji: data.emoji
      }
    })

    return NextResponse.json(
      { message: 'Category created successfully', category },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating category:', error)
    
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