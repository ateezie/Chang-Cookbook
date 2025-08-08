const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('👤 Setting up admin user...')

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@changcookbook.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', adminEmail)
      console.log('📧 Email:', adminEmail)
      console.log('🔑 Password: (unchanged)')
      return
    }

    // Create new admin
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Chang Cookbook Admin',
        role: 'admin'
      }
    })

    console.log('🎉 Admin user created successfully!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    console.log('')
    console.log('📝 Next steps:')
    console.log('1. Start your server: npm run dev')
    console.log('2. Visit: http://localhost:3000/admin')
    console.log('3. Login with the credentials above')

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })