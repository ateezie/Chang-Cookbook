import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin, generateInvitationToken, AuthError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Invitation schema
const createInvitationSchema = z.object({
  email: z.string().email('Invalid email address')
})

// GET /api/invitations - List all invitations (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    
    const invitations = await prisma.invitation.findMany({
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        invitedUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      invitations
    })

  } catch (error) {
    console.error('Get invitations error:', error)

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

// POST /api/invitations - Create new invitation (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    const body = await request.json()
    
    // Validate request body
    const validation = createInvitationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }

    const { email } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Check if invitation already exists and is still valid
    const existingInvitation = await prisma.invitation.findUnique({
      where: { email }
    })

    if (existingInvitation) {
      if (existingInvitation.status === 'pending' && existingInvitation.expiresAt > new Date()) {
        return NextResponse.json(
          { error: 'An active invitation already exists for this email' },
          { status: 409 }
        )
      }
      
      // Remove old invitation
      await prisma.invitation.delete({
        where: { email }
      })
    }

    // Generate invitation token
    const token = generateInvitationToken(email)
    
    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        invitedById: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending'
      },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // TODO: Send invitation email
    // In a real app, you would send an email with the invitation link
    const invitationLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/invite/${token}`
    
    return NextResponse.json({
      success: true,
      message: 'Invitation created successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
        invitedBy: invitation.invitedBy,
        invitationLink // For demo purposes - in production this would be sent via email
      }
    })

  } catch (error) {
    console.error('Create invitation error:', error)

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