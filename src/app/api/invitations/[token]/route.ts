import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyInvitationToken, registerUser, requireAdmin, AuthError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Accept invitation schema
const acceptInvitationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

// GET /api/invitations/[token] - Get invitation details
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      )
    }

    // Verify token
    let email: string
    try {
      const decoded = verifyInvitationToken(token)
      email = decoded.email
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation token' },
        { status: 401 }
      )
    }

    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { email },
      include: {
        invitedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    if (invitation.token !== token) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 401 }
      )
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invitation is no longer valid' },
        { status: 410 }
      )
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      )
    }

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

    return NextResponse.json({
      success: true,
      invitation: {
        email: invitation.email,
        invitedBy: invitation.invitedBy,
        expiresAt: invitation.expiresAt
      }
    })

  } catch (error) {
    console.error('Get invitation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/invitations/[token] - Accept invitation and create account
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token
    const body = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      )
    }

    // Validate request body
    const validation = acceptInvitationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error.errors
        },
        { status: 400 }
      )
    }

    const { name, password } = validation.data

    // Verify token
    let email: string
    try {
      const decoded = verifyInvitationToken(token)
      email = decoded.email
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation token' },
        { status: 401 }
      )
    }

    // Find and validate invitation
    const invitation = await prisma.invitation.findUnique({
      where: { email }
    })

    if (!invitation || invitation.token !== token || invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 401 }
      )
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      )
    }

    // Register user
    const user = await registerUser(email, password, name)

    // Update invitation status
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'accepted',
        invitedUserId: user.id
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You can now sign in.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        chef: user.chef
      }
    })

  } catch (error) {
    console.error('Accept invitation error:', error)

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

// DELETE /api/invitations/[token] - Revoke invitation (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const user = await requireAdmin(request)
    const token = params.token

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      )
    }

    // Find invitation by token
    const invitation = await prisma.invitation.findFirst({
      where: { token }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Update invitation status to revoked
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'revoked'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Invitation revoked successfully'
    })

  } catch (error) {
    console.error('Revoke invitation error:', error)

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