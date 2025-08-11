import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser, requireAuth, AuthError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Profile update schema
const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  socialLinks: z.object({
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    linkedin: z.string().optional()
  }).optional(),
  chef: z.object({
    name: z.string().min(2, 'Chef name must be at least 2 characters'),
    avatar: z.string().url('Invalid avatar URL').optional().or(z.literal(''))
  }).optional()
})

// GET /api/auth/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/auth/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    
    // Validate request body
    const validation = updateProfileSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }

    const { name, bio, website, socialLinks, chef } = validation.data

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(bio !== undefined && { bio: bio || null }),
        ...(website !== undefined && { website: website || null }),
        ...(socialLinks && { socialLinks })
      },
      include: {
        chef: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    // Update chef profile if provided
    if (chef && user.chef) {
      await prisma.chef.update({
        where: { id: user.chef.id },
        data: {
          name: chef.name,
          ...(chef.avatar !== undefined && { avatar: chef.avatar || null })
        }
      })
    }

    // Fetch updated user with chef profile
    const refreshedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        chef: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: refreshedUser!.id,
        email: refreshedUser!.email,
        name: refreshedUser!.name,
        role: refreshedUser!.role,
        status: refreshedUser!.status,
        bio: refreshedUser!.bio,
        website: refreshedUser!.website,
        socialLinks: refreshedUser!.socialLinks,
        chef: refreshedUser!.chef
      }
    })

  } catch (error) {
    console.error('Profile update error:', error)

    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}