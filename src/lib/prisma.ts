import { PrismaClient } from '@prisma/client'
import { isBuildTime } from './build-safe-db'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a build-safe Prisma client that only initializes during runtime
function createPrismaClient() {
  if (isBuildTime()) {
    console.log('⚠️  Skipping Prisma client initialization during build')
    return null as any // Return null during build time
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}