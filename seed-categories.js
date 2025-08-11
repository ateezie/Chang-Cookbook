const { PrismaClient } = require('@prisma/client');

const categories = [
  { id: 'appetizers', name: 'Appetizers', description: 'Start your meal with delicious appetizers', emoji: '🥗' },
  { id: 'main-course', name: 'Main Course', description: 'Hearty main dishes for every occasion', emoji: '🍽️' },
  { id: 'side-dishes', name: 'Side Dishes', description: 'Perfect accompaniments to your main course', emoji: '🥔' },
  { id: 'desserts', name: 'Desserts', description: 'Sweet treats to end your meal', emoji: '🍰' },
  { id: 'beverages', name: 'Beverages', description: 'Refreshing drinks and cocktails', emoji: '🥤' },
  { id: 'snacks', name: 'Snacks', description: 'Quick bites and snacks', emoji: '🍿' },
  { id: 'breakfast', name: 'Breakfast', description: 'Start your day with a great breakfast', emoji: '🍳' },
  { id: 'quick-meals', name: 'Quick Meals', description: 'Fast and easy meals for busy days', emoji: '⚡' }
];

async function seedCategories() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Seeding categories...');
    
    for (const category of categories) {
      const existingCategory = await prisma.category.findUnique({
        where: { id: category.id }
      });
      
      if (existingCategory) {
        console.log(`✓ Category ${category.name} already exists`);
        // Update the category with new data
        await prisma.category.update({
          where: { id: category.id },
          data: {
            name: category.name,
            description: category.description,
            emoji: category.emoji
          }
        });
      } else {
        await prisma.category.create({
          data: category
        });
        console.log(`✓ Created category: ${category.name}`);
      }
    }
    
    console.log('\nUpdating recipe counts...');
    for (const category of categories) {
      const count = await prisma.recipe.count({
        where: { categoryId: category.id }
      });
      
      await prisma.category.update({
        where: { id: category.id },
        data: { count }
      });
      
      console.log(`✓ Updated ${category.name}: ${count} recipes`);
    }
    
    console.log('\nCategories seeded successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();