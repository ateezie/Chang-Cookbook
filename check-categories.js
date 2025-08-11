const { PrismaClient } = require('@prisma/client');

async function checkCategories() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Current categories in database:');
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    categories.forEach(cat => {
      console.log(`- ${cat.id}: ${cat.name} (${cat.count} recipes)`);
    });
    
    console.log('\nChecking for Snacks recipes:');
    const snacksRecipes = await prisma.recipe.findMany({
      where: { categoryId: 'snacks' },
      select: { id: true, title: true }
    });
    
    console.log(`Found ${snacksRecipes.length} snacks recipes:`);
    snacksRecipes.forEach(recipe => {
      console.log(`- ${recipe.id}: ${recipe.title}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();