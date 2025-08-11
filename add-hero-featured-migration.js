#!/usr/bin/env node

/**
 * Migration script to add heroFeatured column to recipes table
 * Run with: node add-hero-featured-migration.js
 */

const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()

  try {
    console.log('🚀 Starting heroFeatured column migration...')

    // Add the heroFeatured column using raw SQL
    await prisma.$executeRaw`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS "heroFeatured" BOOLEAN NOT NULL DEFAULT false`

    console.log('✅ Successfully added heroFeatured column to recipes table')

    // Count current recipes
    const recipeCount = await prisma.recipe.count()
    console.log(`📊 Found ${recipeCount} recipes in the database`)

    if (recipeCount > 0) {
      console.log('💡 You can now set recipes as hero featured through the admin dashboard')
      console.log('   Go to /admin/dashboard and click the "🏅 Set Hero" button for any recipe')
    }

    console.log('🎉 Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })