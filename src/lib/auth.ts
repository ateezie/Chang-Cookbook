import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

export interface User {
  id: string
  email: string
  name: string
  role: string
  status: string
  bio?: string | null
  website?: string | null
  socialLinks?: any
  chef?: {
    id: string
    name: string
    avatar?: string | null
  } | null
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message)
    this.name = 'AuthError'
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

// Get user from token
export async function getUserFromToken(token: string) {
  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  })

  return user
}

// Middleware to authenticate admin requests
export async function authenticateAdmin(request: NextRequest): Promise<JWTPayload | null> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const payload = verifyToken(token)
  
  if (!payload || payload.role !== 'admin') {
    return null
  }

  // Verify user still exists in database
  const user = await prisma.user.findUnique({
    where: { id: payload.userId }
  })

  if (!user) {
    return null
  }

  return payload
}

// Get user by ID with chef profile
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      bio: user.bio,
      website: user.website,
      socialLinks: user.socialLinks,
      chef: user.chef
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
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

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      bio: user.bio,
      website: user.website,
      socialLinks: user.socialLinks,
      chef: user.chef
    }
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
}

// Register new user
export async function registerUser(email: string, password: string, name: string): Promise<User> {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      throw new AuthError('User with this email already exists', 409)
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'chef',
        status: 'active'
      }
    })

    // Create associated chef profile
    const chef = await prisma.chef.create({
      data: {
        name: name,
        userId: user.id
      }
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      bio: user.bio,
      website: user.website,
      socialLinks: user.socialLinks,
      chef: {
        id: chef.id,
        name: chef.name,
        avatar: chef.avatar
      }
    }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    console.error('Error registering user:', error)
    throw new AuthError('Failed to create user account', 500)
  }
}

// Login user
export async function loginUser(email: string, password: string): Promise<{ user: User; token: string }> {
  try {
    // Get user with password
    const userWithPassword = await prisma.user.findUnique({
      where: { email },
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

    if (!userWithPassword) {
      throw new AuthError('Invalid email or password', 401)
    }

    // Check if user is active
    if (userWithPassword.status !== 'active') {
      throw new AuthError('Account is not active. Please contact support.', 401)
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, userWithPassword.password)
    if (!isPasswordValid) {
      throw new AuthError('Invalid email or password', 401)
    }

    // Generate token
    const token = generateToken({
      userId: userWithPassword.id,
      email: userWithPassword.email,
      role: userWithPassword.role
    })

    const user: User = {
      id: userWithPassword.id,
      email: userWithPassword.email,
      name: userWithPassword.name,
      role: userWithPassword.role,
      status: userWithPassword.status,
      bio: userWithPassword.bio,
      website: userWithPassword.website,
      socialLinks: userWithPassword.socialLinks,
      chef: userWithPassword.chef
    }

    return { user, token }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }
    console.error('Error logging in user:', error)
    throw new AuthError('Login failed', 500)
  }
}

// Get current user from request
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    
    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) return null

    return await getUserById(payload.userId)
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Require authentication middleware helper
export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await getCurrentUser(request)
  if (!user) {
    throw new AuthError('Authentication required', 401)
  }
  return user
}

// Require admin role middleware helper
export async function requireAdmin(request: NextRequest): Promise<User> {
  const user = await requireAuth(request)
  if (user.role !== 'admin') {
    throw new AuthError('Admin access required', 403)
  }
  return user
}

// Generate invitation token
export function generateInvitationToken(email: string): string {
  return jwt.sign({ email, type: 'invitation' }, JWT_SECRET, { 
    expiresIn: '7d',
    issuer: 'chang-cookbook'
  })
}

// Verify invitation token
export function verifyInvitationToken(token: string): { email: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; type: string }
    if (decoded.type !== 'invitation') {
      throw new AuthError('Invalid invitation token', 400)
    }
    return { email: decoded.email }
  } catch (error) {
    throw new AuthError('Invalid or expired invitation token', 401)
  }
}

// Create default admin user if it doesn't exist
export async function createDefaultAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@changcookbook.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (existingAdmin) {
    console.log('✓ Admin user already exists')
    return existingAdmin
  }

  const hashedPassword = await hashPassword(adminPassword)
  
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Chang Cookbook Admin',
      role: 'admin',
      status: 'active'
    }
  })

  console.log('✓ Created default admin user:', adminEmail)
  return admin
}