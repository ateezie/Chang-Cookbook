require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function createAdminUser() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔧 Creating admin user in PostgreSQL database...')
    
    const adminEmail = process.env.ADMIN_EMAIL || 'hello@alexthip.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'cAEj05d7TtCf*@zD'
    
    console.log(`📧 Admin email: ${adminEmail}`)
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists')
      console.log(`👤 User ID: ${existingAdmin.id}`)
      console.log(`📧 Email: ${existingAdmin.email}`)
      console.log(`🔐 Role: ${existingAdmin.role}`)
      return existingAdmin
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Chang Cookbook Admin',
        role: 'admin',
        status: 'active'
      }
    })
    
    console.log('✅ Admin user created successfully!')
    console.log(`👤 User ID: ${admin.id}`)
    console.log(`📧 Email: ${admin.email}`)
    console.log(`🔐 Role: ${admin.role}`)
    
    return admin
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('🎉 Admin user setup completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Failed to create admin user:', error)
      process.exit(1)
    })
}

module.exports = { createAdminUser }