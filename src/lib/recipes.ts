import { Recipe, Category, FilterOptions, SortOptions } from '@/types'
import recipesData from '@/data/recipes.json'

// Get all recipes
export function getAllRecipes(): Recipe[] {
  return recipesData.recipes as Recipe[]
}

// Get all categories
export function getAllCategories(): Category[] {
  return recipesData.categories as Category[]
}

// Get recipe by ID
export function getRecipeById(id: string): Recipe | undefined {
  return (recipesData.recipes as Recipe[]).find(recipe => recipe.id === id)
}

// Get recipes by category
export function getRecipesByCategory(categoryId: string): Recipe[] {
  if (categoryId === 'all') return getAllRecipes()
  return (recipesData.recipes as Recipe[]).filter(recipe => recipe.category === categoryId)
}

// Get featured recipes
export function getFeaturedRecipes(): Recipe[] {
  return (recipesData.recipes as Recipe[]).filter(recipe => recipe.featured)
}

// Search recipes by query
export function searchRecipes(query: string): Recipe[] {
  if (!query.trim()) return getAllRecipes()
  
  const searchTerm = query.toLowerCase()
  
  return (recipesData.recipes as Recipe[]).filter(recipe => {
    // Search in title
    if (recipe.title.toLowerCase().includes(searchTerm)) return true
    
    // Search in description
    if (recipe.description.toLowerCase().includes(searchTerm)) return true
    
    // Search in ingredients
    if (recipe.ingredients.some(ingredient => 
      ingredient.item.toLowerCase().includes(searchTerm)
    )) return true
    
    // Search in tags
    if (recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm))) return true
    
    // Search in chef name
    if (recipe.chef.name.toLowerCase().includes(searchTerm)) return true
    
    return false
  })
}

// Filter recipes
export function filterRecipes(recipes: Recipe[], filters: FilterOptions): Recipe[] {
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
    const searchResults = searchRecipes(filters.searchQuery)
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
export function getRelatedRecipes(currentRecipe: Recipe, limit: number = 4): Recipe[] {
  const allRecipes = getAllRecipes().filter(recipe => recipe.id !== currentRecipe.id)
  
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
export function getPopularTags(limit: number = 10): Array<{ tag: string, count: number }> {
  const tagCounts = new Map<string, number>()
  
  getAllRecipes().forEach(recipe => {
    recipe.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })
  
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// Get recipe statistics
export function getRecipeStats() {
  const recipes = getAllRecipes()
  
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