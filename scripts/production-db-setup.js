// Chang Cookbook - Production Database Setup Script
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function setupProductionDatabase() {
  console.log('🗄️ Setting up Chang Cookbook production database...')

  try {
    // 1. Run database migrations
    console.log('📋 Running database migrations...')
    // Note: Migrations should be run via `npx prisma migrate deploy` in production
    
    // 2. Check if data already exists
    const existingRecipes = await prisma.recipe.count()
    const existingUsers = await prisma.user.count()
    
    console.log(`📊 Found ${existingRecipes} recipes and ${existingUsers} users in database`)
    
    // 3. Create admin user if doesn't exist
    console.log('👤 Setting up admin user...')
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@changcookbook.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    let admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12)
      admin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Chang Cookbook Admin',
          role: 'admin'
        }
      })
      console.log(`✅ Created admin user: ${adminEmail}`)
    } else {
      console.log(`✅ Admin user already exists: ${adminEmail}`)
    }
    
    // 4. Import recipes if database is empty
    if (existingRecipes === 0) {
      console.log('📚 Importing recipes from JSON...')
      
      const recipesPath = path.join(process.cwd(), 'src', 'data', 'recipes.json')
      
      if (fs.existsSync(recipesPath)) {
        // Import recipes using existing migration script
        const { execSync } = require('child_process')
        execSync('node scripts/migrate-json-to-db.js', { stdio: 'inherit' })
        console.log('✅ Recipes imported successfully')
      } else {
        console.log('⚠️ No recipes.json found, skipping recipe import')
      }
    } else {
      console.log(`✅ Database already contains ${existingRecipes} recipes`)
    }
    
    // 5. Verify database setup
    const finalStats = await prisma.recipe.count()
    const categoryCount = await prisma.category.count()
    const chefCount = await prisma.chef.count()
    
    console.log('\n🎉 Production database setup completed!')
    console.log('📊 Database statistics:')
    console.log(`   - Recipes: ${finalStats}`)
    console.log(`   - Categories: ${categoryCount}`)
    console.log(`   - Chefs: ${chefCount}`)
    console.log(`   - Admin users: ${existingUsers}`)
    
    console.log('\n🔑 Admin login details:')
    console.log(`   - Email: ${adminEmail}`)
    console.log(`   - Password: ${adminPassword}`)
    console.log(`   - Admin panel: https://your-domain.com/admin`)
    
    console.log('\n⚠️ Security reminders:')
    console.log('   1. Change the admin password after first login')
    console.log('   2. Update JWT_SECRET in .env.local')
    console.log('   3. Set up regular database backups')
    console.log('   4. Configure SSL/HTTPS for production')
    
  } catch (error) {
    console.error('❌ Production database setup failed:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  setupProductionDatabase()
}

module.exports = { setupProductionDatabase }