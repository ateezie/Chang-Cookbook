const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function setupTestAdmin() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Checking for existing admin users...')
    
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    })
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:')
      console.log(`Email: ${existingAdmin.email}`)
      console.log(`Name: ${existingAdmin.name}`)
      console.log(`Status: ${existingAdmin.status}`)
      console.log('\n🧪 Test Login Credentials:')
      console.log('Email: hello@alexthip.com')
      console.log('Password: cAEj05d7TtCf*@zD')
    } else {
      console.log('⚠️  No admin user found. Creating test admin...')
      
      const hashedPassword = await bcrypt.hash('cAEj05d7TtCf*@zD', 12)
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'hello@alexthip.com',
          password: hashedPassword,
          name: 'Chang Cookbook Admin',
          role: 'admin',
          status: 'active'
        }
      })
      
      console.log('✅ Created test admin user:')
      console.log(`Email: ${newAdmin.email}`)
      console.log(`Name: ${newAdmin.name}`)
      console.log('\n🧪 Test Login Credentials:')
      console.log('Email: hello@alexthip.com')
      console.log('Password: cAEj05d7TtCf*@zD')
    }
    
    console.log('\n📍 Login URL: http://localhost:3000/login')
    console.log('\n🎯 How to test login:')
    console.log('1. Go to http://localhost:3000/login')
    console.log('2. Enter email: hello@alexthip.com')
    console.log('3. Enter password: cAEj05d7TtCf*@zD')
    console.log('4. Click login button')
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Error setting up test admin:', error)
    await prisma.$disconnect()
  }
}

setupTestAdmin()