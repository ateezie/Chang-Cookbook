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
      role: 'admin'
    }
  })

  console.log('✓ Created default admin user:', adminEmail)
  return admin
}