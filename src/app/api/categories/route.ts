import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateAdmin } from '@/lib/auth'
import { safeDbOperation, buildTimeFallbacks } from '@/lib/build-safe-db'
import { z } from 'zod'

const CategorySchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
  name: z.string().min(1, 'Category name is required'),
  description: z.string().min(1, 'Category description is required'),
  emoji: z.string().min(1, 'Category emoji is required')
})

// GET /api/categories - List all categories
export async function GET() {
  const categories = await safeDbOperation(
    async () => {
      const dbCategories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { recipes: true }
          }
        }
      })

      return dbCategories.map((category: any) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        emoji: category.emoji,
        count: category._count.recipes
      }))
    },
    buildTimeFallbacks.categories,
    'fetch categories'
  )

  return NextResponse.json({ categories })
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