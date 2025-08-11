const { PrismaClient } = require('@prisma/client');

async function checkMango() {
  const prisma = new PrismaClient();
  
  try {
    const mangoRecipes = await prisma.recipe.findMany({
      where: {
        title: {
          contains: 'mango'
        }
      },
      select: {
        id: true,
        slug: true,
        title: true,
        featured: true
      }
    });
    
    console.log('Mango recipes found:');
    mangoRecipes.forEach(recipe => {
      console.log(`- ID: ${recipe.id}`);
      console.log(`  Slug: ${recipe.slug}`);
      console.log(`  Title: ${recipe.title}`);
      console.log(`  Featured: ${recipe.featured}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMango();