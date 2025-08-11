// Build-safe database utilities for static generation
// Prevents database connection errors during Next.js build time

export function isBuildTime(): boolean {
  // Check if we're in build phase
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
  
  // Check if we're in a serverless environment without database access
  const noDatabase = !process.env.DATABASE_URL
  
  // Check if we're in CI/build environment
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
  
  return isBuild || (noDatabase && !process.env.NODE_ENV?.includes('dev'))
}

export function shouldSkipDatabase(): boolean {
  // Skip database operations during build time or when no DATABASE_URL is available
  return isBuildTime() || typeof window !== 'undefined'
}

// Safe database wrapper that returns fallback data during build
export async function safeDbOperation<T>(
  dbOperation: () => Promise<T>,
  fallback: T,
  operationName?: string
): Promise<T> {
  if (shouldSkipDatabase()) {
    if (operationName) {
      console.log(`⚠️  Skipping database operation during build: ${operationName}`)
    }
    return fallback
  }

  try {
    return await dbOperation()
  } catch (error) {
    console.error(`Database operation failed${operationName ? ` (${operationName})` : ''}:`, error)
    return fallback
  }
}

// Fallback data for build time
export const buildTimeFallbacks = {
  categories: [
    { id: 'main-course', name: 'Main Course', description: 'Main dishes and entrees', emoji: '🍽️', count: 0 },
    { id: 'appetizers', name: 'Appetizers', description: 'Starters and small plates', emoji: '🥗', count: 0 },
    { id: 'desserts', name: 'Desserts', description: 'Sweet treats and desserts', emoji: '🍰', count: 0 },
    { id: 'beverages', name: 'Beverages', description: 'Drinks and beverages', emoji: '🥤', count: 0 },
    { id: 'salads', name: 'Salads', description: 'Fresh and healthy salads', emoji: '🥙', count: 0 },
    { id: 'soups', name: 'Soups', description: 'Warm and comforting soups', emoji: '🍲', count: 0 },
    { id: 'snacks', name: 'Snacks', description: 'Quick bites and snacks', emoji: '🥨', count: 0 },
    { id: 'quick-meals', name: 'Quick Meals', description: 'Fast and easy meals', emoji: '⚡', count: 0 }
  ],
  recipes: [],
  user: null,
  chef: null
}