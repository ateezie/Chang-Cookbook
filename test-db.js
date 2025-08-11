const { PrismaClient } = require('@prisma/client')

async function testDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Testing database connection...')
    const count = await prisma.recipe.count()
    console.log('✅ Database connection working!')
    console.log(`📊 Found ${count} recipes`)
    
    // Test the new heroFeatured field
    const heroRecipes = await prisma.recipe.count({
      where: { heroFeatured: true }
    })
    console.log(`🏆 Hero featured recipes: ${heroRecipes}`)
    
    // Test basic recipe fields
    const firstRecipe = await prisma.recipe.findFirst({
      select: { id: true, title: true, featured: true, heroFeatured: true }
    })
    console.log(`📋 First recipe: ${firstRecipe?.title}`)
    console.log(`   Featured: ${firstRecipe?.featured}, Hero Featured: ${firstRecipe?.heroFeatured}`)
    
  } catch (error) {
    console.error('❌ Database error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })