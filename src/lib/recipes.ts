import { Recipe, Category, FilterOptions, SortOptions } from '@/types'
import { prisma } from '@/lib/prisma'
import { safeDbOperation, buildTimeFallbacks } from '@/lib/build-safe-db'

// Get all recipes
export async function getAllRecipes(): Promise<Recipe[]> {
  return await safeDbOperation(
    async () => {
      const recipes = await prisma.recipe.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          chef: true,
          ingredients: { orderBy: { order: 'asc' } },
          instructions: { orderBy: { order: 'asc' } },
          tags: { include: { tag: true } }
        }
      })
      
      return recipes.map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description,
        category: recipe.categoryId,
        difficulty: recipe.difficulty as 'easy' | 'medium' | 'hard',
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: recipe.totalTime,
        servings: recipe.servings,
        rating: recipe.rating,
        reviewCount: recipe.reviewCount,
        image: recipe.image || '',
        featured: recipe.featured,
        heroFeatured: recipe.heroFeatured,
        createdAt: recipe.createdAt.toISOString().split('T')[0],
        chef: {
          name: recipe.chef.name,
          avatar: recipe.chef.avatar || ''
        },
        ingredients: recipe.ingredients.map((ing: any) => ({
          item: ing.item,
          amount: ing.amount
        })),
        instructions: recipe.instructions.map((inst: any) => inst.step),
        tags: recipe.tags.map((t: any) => t.tag.name),
        equipment: recipe.equipment ? JSON.parse(recipe.equipment) : [],
        notes: recipe.notes
      }))
    },
    buildTimeFallbacks.recipes,
    'get all recipes'
  )
}

// Get all categories
export async function getAllCategories(): Promise<Category[]> {
  return await safeDbOperation(
    async () => {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
      })
      
      return categories.map((category: any) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        emoji: category.emoji,
        count: category.count
      }))
    },
    buildTimeFallbacks.categories,
    'get all categories'
  )
}

// Get recipe by ID
export async function getRecipeById(id: string): Promise<Recipe | undefined> {
  return await safeDbOperation(
    async () => {
      const recipe = await prisma.recipe.findUnique({
        where: { id },
        include: {
          chef: true,
          ingredients: { orderBy: { order: 'asc' } },
          instructions: { orderBy: { order: 'asc' } },
          tags: { include: { tag: true } }
        }
      })
      
      if (!recipe) return undefined
      
      return {
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description,
        category: recipe.categoryId,
        difficulty: recipe.difficulty as 'easy' | 'medium' | 'hard',
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: recipe.totalTime,
        servings: recipe.servings,
        rating: recipe.rating,
        reviewCount: recipe.reviewCount,
        image: recipe.image || '',
        featured: recipe.featured,
        heroFeatured: recipe.heroFeatured,
        createdAt: recipe.createdAt.toISOString().split('T')[0],
        chef: {
          name: recipe.chef.name,
          avatar: recipe.chef.avatar || ''
        },
        ingredients: recipe.ingredients.map((ing: any) => ({
          item: ing.item,
          amount: ing.amount
        })),
        instructions: recipe.instructions.map((inst: any) => inst.step),
        tags: recipe.tags.map((t: any) => t.tag.name),
        equipment: recipe.equipment ? JSON.parse(recipe.equipment) : [],
        notes: recipe.notes
      }
    },
    buildTimeFallbacks.recipes.find((recipe: any) => recipe.id === id),
    'get recipe by ID'
  )
}

// Get recipes by category
export async function getRecipesByCategory(categoryId: string): Promise<Recipe[]> {
  if (categoryId === 'all') return await getAllRecipes()
  
  return await safeDbOperation(
    async () => {
      const recipes = await prisma.recipe.findMany({
        where: { categoryId },
        orderBy: { createdAt: 'desc' },
        include: {
          chef: true,
          ingredients: { orderBy: { order: 'asc' } },
          instructions: { orderBy: { order: 'asc' } },
          tags: { include: { tag: true } }
        }
      })
      
      return recipes.map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description,
        category: recipe.categoryId,
        difficulty: recipe.difficulty as 'easy' | 'medium' | 'hard',
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: recipe.totalTime,
        servings: recipe.servings,
        rating: recipe.rating,
        reviewCount: recipe.reviewCount,
        image: recipe.image || '',
        featured: recipe.featured,
        heroFeatured: recipe.heroFeatured,
        createdAt: recipe.createdAt.toISOString().split('T')[0],
        chef: {
          name: recipe.chef.name,
          avatar: recipe.chef.avatar || ''
        },
        ingredients: recipe.ingredients.map((ing: any) => ({
          item: ing.item,
          amount: ing.amount
        })),
        instructions: recipe.instructions.map((inst: any) => inst.step),
        tags: recipe.tags.map((t: any) => t.tag.name),
        equipment: recipe.equipment ? JSON.parse(recipe.equipment) : [],
        notes: recipe.notes
      }))
    },
    buildTimeFallbacks.recipes.filter((recipe: any) => recipe.category === categoryId),
    'get recipes by category'
  )
}

// Get hero featured recipe (for homepage hero section)
export async function getHeroFeaturedRecipe(): Promise<Recipe | undefined> {
  return await safeDbOperation(
    async () => {
      const recipe = await prisma.recipe.findFirst({
        where: { heroFeatured: true },
        include: {
          chef: true,
          ingredients: { orderBy: { order: 'asc' } },
          instructions: { orderBy: { order: 'asc' } },
          tags: { include: { tag: true } }
        }
      })
      
      if (!recipe) return undefined
      
      return {
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description,
        category: recipe.categoryId,
        difficulty: recipe.difficulty as 'easy' | 'medium' | 'hard',
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: recipe.totalTime,
        servings: recipe.servings,
        rating: recipe.rating,
        reviewCount: recipe.reviewCount,
        image: recipe.image || '',
        featured: recipe.featured,
        heroFeatured: recipe.heroFeatured,
        createdAt: recipe.createdAt.toISOString().split('T')[0],
        chef: {
          name: recipe.chef.name,
          avatar: recipe.chef.avatar || ''
        },
        ingredients: recipe.ingredients.map((ing: any) => ({
          item: ing.item,
          amount: ing.amount
        })),
        instructions: recipe.instructions.map((inst: any) => inst.step),
        tags: recipe.tags.map((t: any) => t.tag.name),
        equipment: recipe.equipment ? JSON.parse(recipe.equipment) : [],
        notes: recipe.notes
      }
    },
    undefined, // No fallback for hero featured recipe
    'get hero featured recipe'
  )
}

// Get featured recipes
export async function getFeaturedRecipes(): Promise<Recipe[]> {
  return await safeDbOperation(
    async () => {
      const recipes = await prisma.recipe.findMany({
        where: { featured: true },
        orderBy: { createdAt: 'desc' },
        include: {
          chef: true,
          ingredients: { orderBy: { order: 'asc' } },
          instructions: { orderBy: { order: 'asc' } },
          tags: { include: { tag: true } }
        }
      })
      
      return recipes.map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description,
        category: recipe.categoryId,
        difficulty: recipe.difficulty as 'easy' | 'medium' | 'hard',
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: recipe.totalTime,
        servings: recipe.servings,
        rating: recipe.rating,
        reviewCount: recipe.reviewCount,
        image: recipe.image || '',
        featured: recipe.featured,
        heroFeatured: recipe.heroFeatured,
        createdAt: recipe.createdAt.toISOString().split('T')[0],
        chef: {
          name: recipe.chef.name,
          avatar: recipe.chef.avatar || ''
        },
        ingredients: recipe.ingredients.map((ing: any) => ({
          item: ing.item,
          amount: ing.amount
        })),
        instructions: recipe.instructions.map((inst: any) => inst.step),
        tags: recipe.tags.map((t: any) => t.tag.name),
        equipment: recipe.equipment ? JSON.parse(recipe.equipment) : [],
        notes: recipe.notes
      }))
    },
    buildTimeFallbacks.recipes.filter((recipe: any) => recipe.featured),
    'get featured recipes'
  )
}

// Search recipes by query
export async function searchRecipes(query: string): Promise<Recipe[]> {
  if (!query.trim()) return await getAllRecipes()
  
  return await safeDbOperation(
    async () => {
      const recipes = await prisma.recipe.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { ingredients: { some: { item: { contains: query, mode: 'insensitive' } } } },
            { tags: { some: { tag: { name: { contains: query, mode: 'insensitive' } } } } },
            { chef: { name: { contains: query, mode: 'insensitive' } } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        include: {
          chef: true,
          ingredients: { orderBy: { order: 'asc' } },
          instructions: { orderBy: { order: 'asc' } },
          tags: { include: { tag: true } }
        }
      })
      
      return recipes.map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description,
        category: recipe.categoryId,
        difficulty: recipe.difficulty as 'easy' | 'medium' | 'hard',
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: recipe.totalTime,
        servings: recipe.servings,
        rating: recipe.rating,
        reviewCount: recipe.reviewCount,
        image: recipe.image || '',
        featured: recipe.featured,
        heroFeatured: recipe.heroFeatured,
        createdAt: recipe.createdAt.toISOString().split('T')[0],
        chef: {
          name: recipe.chef.name,
          avatar: recipe.chef.avatar || ''
        },
        ingredients: recipe.ingredients.map((ing: any) => ({
          item: ing.item,
          amount: ing.amount
        })),
        instructions: recipe.instructions.map((inst: any) => inst.step),
        tags: recipe.tags.map((t: any) => t.tag.name),
        equipment: recipe.equipment ? JSON.parse(recipe.equipment) : [],
        notes: recipe.notes
      }))
    },
    buildTimeFallbacks.recipes.filter((recipe: any) => {
      const searchTerm = query.toLowerCase()
      return recipe.title.toLowerCase().includes(searchTerm) ||
             recipe.description.toLowerCase().includes(searchTerm) ||
             recipe.ingredients.some((ingredient: any) => ingredient.item.toLowerCase().includes(searchTerm)) ||
             recipe.tags.some((tag: any) => tag.toLowerCase().includes(searchTerm)) ||
             recipe.chef.name.toLowerCase().includes(searchTerm)
    }),
    'search recipes'
  )
}

// Filter recipes
export async function filterRecipes(recipes: Recipe[], filters: FilterOptions): Promise<Recipe[]> {
  let filtered = [...recipes]
  
  // Filter by category
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(recipe => recipe.category === filters.category)
  }
  
  // Filter by difficulty
  if (filters.difficulty && filters.difficulty !== 'all') {
    filtered = filtered.filter(recipe => recipe.difficulty === filters.difficulty)
  }
  
  // Filter by max time
  if (filters.maxTime) {
    filtered = filtered.filter(recipe => recipe.totalTime <= filters.maxTime!)
  }
  
  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(recipe => 
      filters.tags!.some(tag => recipe.tags.includes(tag))
    )
  }
  
  // Filter by search query
  if (filters.searchQuery) {
    const searchResults = await searchRecipes(filters.searchQuery)
    const searchIds = searchResults.map(recipe => recipe.id)
    filtered = filtered.filter(recipe => searchIds.includes(recipe.id))
  }
  
  return filtered
}

// Sort recipes
export function sortRecipes(recipes: Recipe[], sortOptions: SortOptions): Recipe[] {
  const sorted = [...recipes]
  
  switch (sortOptions.sortBy) {
    case 'newest':
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
      
    case 'oldest':
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      break
      
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating)
      break
      
    case 'prepTime':
      sorted.sort((a, b) => a.totalTime - b.totalTime)
      break
      
    case 'popularity':
      sorted.sort((a, b) => b.reviewCount - a.reviewCount)
      break
      
    default:
      // Default to featured first, then by rating
      sorted.sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return b.rating - a.rating
      })
  }
  
  if (sortOptions.order === 'asc') {
    return sorted.reverse()
  }
  
  return sorted
}

// Get recipe suggestions based on current recipe
export async function getRelatedRecipes(currentRecipe: Recipe, limit: number = 4): Promise<Recipe[]> {
  const allRecipes = (await getAllRecipes()).filter(recipe => recipe.id !== currentRecipe.id)
  
  // Score recipes based on similarity
  const scored = allRecipes.map(recipe => {
    let score = 0
    
    // Same category gets high score
    if (recipe.category === currentRecipe.category) score += 50
    
    // Similar difficulty
    if (recipe.difficulty === currentRecipe.difficulty) score += 20
    
    // Similar cook time (within 15 minutes)
    if (Math.abs(recipe.totalTime - currentRecipe.totalTime) <= 15) score += 15
    
    // Similar rating (within 0.5)
    if (Math.abs(recipe.rating - currentRecipe.rating) <= 0.5) score += 10
    
    // Shared tags
    const sharedTags = currentRecipe.tags.filter(tag => recipe.tags.includes(tag))
    score += sharedTags.length * 10
    
    return { recipe, score }
  })
  
  // Sort by score and return top results
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.recipe)
}

// Get popular tags
export async function getPopularTags(limit: number = 10): Promise<Array<{ tag: string, count: number }>> {
  return await safeDbOperation(
    async () => {
      const tags = await prisma.tag.findMany({
        include: {
          _count: {
            select: { recipes: true }
          }
        },
        orderBy: {
          recipes: {
            _count: 'desc'
          }
        },
        take: limit
      })
      
      return tags.map((tag: any) => ({
        tag: tag.name,
        count: tag._count.recipes
      }))
    },
    // Fallback: calculate from JSON data
    (() => {
      const tagCounts = new Map<string, number>()
      buildTimeFallbacks.recipes.forEach((recipe: any) => {
        recipe.tags.forEach((tag: any) => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
        })
      })
      return Array.from(tagCounts.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
    })(),
    'get popular tags'
  )
}

// Get recipe statistics
export async function getRecipeStats() {
  const recipes = await getAllRecipes()
  
  return {
    total: recipes.length,
    featured: recipes.filter(r => r.featured).length,
    avgRating: recipes.reduce((sum, r) => sum + r.rating, 0) / recipes.length,
    avgCookTime: recipes.reduce((sum, r) => sum + r.totalTime, 0) / recipes.length,
    totalReviews: recipes.reduce((sum, r) => sum + r.reviewCount, 0),
    difficulties: {
      easy: recipes.filter(r => r.difficulty === 'easy').length,
      medium: recipes.filter(r => r.difficulty === 'medium').length,
      hard: recipes.filter(r => r.difficulty === 'hard').length,
    }
  }
}

// Pagination helper
export function paginateRecipes(recipes: Recipe[], page: number, limit: number) {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  
  return {
    recipes: recipes.slice(startIndex, endIndex),
    totalCount: recipes.length,
    currentPage: page,
    totalPages: Math.ceil(recipes.length / limit),
    hasNextPage: endIndex < recipes.length,
    hasPrevPage: page > 1
  }
}

// Format time helper
export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

// Generate recipe URL
export function getRecipeUrl(recipe: Recipe): string {
  return `/recipes/${recipe.slug || recipe.id}`
}

// Generate category URL  
export function getCategoryUrl(categoryId: string): string {
  return `/recipes?category=${categoryId}`
}

// Generate search URL
export function getSearchUrl(query: string): string {
  return `/search?q=${encodeURIComponent(query)}`
}