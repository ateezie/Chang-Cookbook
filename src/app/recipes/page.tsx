'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Layout from '@/components/Layout'
import RecipeCard from '@/components/RecipeCard'
import CategoryFilter from '@/components/CategoryFilter'
import { RecipeGridSkeleton } from '@/components/Loading'
import { Recipe, FilterOptions, SortOptions, Category } from '@/types'

const RECIPES_PER_PAGE = 12

function RecipesContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [displayedRecipes, setDisplayedRecipes] = useState<Recipe[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'all',
    difficulty: 'all',
    searchQuery: ''
  })
  
  // Sort state
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    sortBy: 'newest',
    order: 'desc'
  })
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Initialize data and filters from URL params
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recipes and categories concurrently
        const [recipesResponse, categoriesResponse] = await Promise.all([
          fetch('/api/recipes?limit=100'),
          fetch('/api/categories')
        ])
        
        if (recipesResponse.ok) {
          const recipesData = await recipesResponse.json()
          setRecipes(recipesData.recipes)
        }
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.categories)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        // No fallback - rely on API endpoints
      }
      
      // Set filters from URL params
      const category = searchParams.get('category') || 'all'
      const difficulty = searchParams.get('difficulty') || 'all'
      const featured = searchParams.get('featured')
      
      setFilters(prev => ({
        ...prev,
        category,
        difficulty,
        ...(featured === 'true' && { tags: ['featured'] })
      }))
      
      setLoading(false)
    }

    fetchData()
  }, [searchParams])

  // Categories are now loaded from state

  // Apply filters and sorting
  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = [...recipes]
    
    // Filter by category
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(recipe => recipe.category === filters.category)
    }
    
    // Filter by difficulty
    if (filters.difficulty && filters.difficulty !== 'all') {
      filtered = filtered.filter(recipe => recipe.difficulty === filters.difficulty)
    }
    
    // Filter by search query
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.description.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some(ingredient => ingredient.item.toLowerCase().includes(searchTerm)) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }
    
    // Special handling for featured recipes
    if (searchParams.get('featured') === 'true') {
      filtered = filtered.filter(recipe => recipe.featured)
    }
    
    // Apply sorting
    const sorted = [...filtered]
    
    switch (sortOptions.sortBy) {
      case 'newest':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'prepTime':
        sorted.sort((a, b) => a.totalTime - b.totalTime)
        break
      default:
        sorted.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return b.rating - a.rating
        })
    }
    
    return sorted
  }, [recipes, filters, sortOptions, searchParams])

  // Pagination
  const totalRecipes = filteredAndSortedRecipes.length
  const totalPages = Math.ceil(totalRecipes / RECIPES_PER_PAGE)
  
  useEffect(() => {
    const startIndex = (currentPage - 1) * RECIPES_PER_PAGE
    const endIndex = startIndex + RECIPES_PER_PAGE
    setDisplayedRecipes(filteredAndSortedRecipes.slice(startIndex, endIndex))
  }, [filteredAndSortedRecipes, currentPage])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, sortOptions])

  // Handle filter changes
  const handleCategoryChange = (categoryId: string) => {
    setFilters(prev => ({ ...prev, category: categoryId }))
  }

  const handleDifficultyChange = (difficulty: string) => {
    setFilters(prev => ({ ...prev, difficulty }))
  }

  const handleSortChange = (sortBy: SortOptions['sortBy']) => {
    setSortOptions(prev => ({ ...prev, sortBy }))
  }

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({ category: 'all', difficulty: 'all', searchQuery: '' })
    setSortOptions({ sortBy: 'newest', order: 'desc' })
  }

  // Get page title based on filters
  const getPageTitle = () => {
    if (searchParams.get('featured') === 'true') return 'Featured Recipes'
    if (filters.category !== 'all') {
      const category = categories.find(c => c.id === filters.category)
      return category ? `${category.name} Recipes` : 'Recipes'
    }
    return 'All Recipes'
  }

  const pageTitle = getPageTitle()
  const hasActiveFilters = filters.category !== 'all' || filters.difficulty !== 'all' || searchParams.get('featured') === 'true'

  if (loading) {
    return (
      <Layout>
        <div className="section-container">
          <div className="content-container">
            <div className="h-12 bg-chang-neutral-200 rounded mb-6 animate-pulse"></div>
            <div className="flex flex-wrap gap-2 mb-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-10 w-24 bg-chang-neutral-200 rounded-full animate-pulse"></div>
              ))}
            </div>
            <RecipeGridSkeleton count={12} />
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Page Header */}
      <div className="bg-gradient-to-r from-chang-orange-50 to-chang-orange-100 py-12">
        <div className="content-container">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-chang-brown-700 mb-4">
              {pageTitle}
            </h1>
            <p className="text-lg text-chang-brown-600 max-w-2xl mx-auto">
              {totalRecipes} {totalRecipes === 1 ? 'recipe' : 'recipes'} found
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-4 text-chang-orange-500 hover:text-chang-orange-600 font-medium"
                >
                  Clear filters
                </button>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="section-container">
        <div className="content-container">
          {/* Filters */}
          <div className="mb-8 space-y-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-chang-brown-700 mb-3">
                Filter by Category
              </label>
              <CategoryFilter
                categories={categories}
                activeCategory={filters.category || 'all'}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            {/* Additional Filters and Sort */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex flex-wrap gap-4">
                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={filters.difficulty || 'all'}
                    onChange={(e) => handleDifficultyChange(e.target.value)}
                    className="input-field w-32"
                  >
                    <option value="all">All Levels</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                    Sort by
                  </label>
                  <select
                    value={sortOptions.sortBy}
                    onChange={(e) => handleSortChange(e.target.value as SortOptions['sortBy'])}
                    className="input-field w-40"
                  >
                    <option value="newest">Newest First</option>
                    <option value="prepTime">Quickest</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div>
                  <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                    View
                  </label>
                  <div className="flex border border-chang-neutral-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' 
                        ? 'bg-chang-orange-500 text-white' 
                        : 'bg-white text-chang-brown-700 hover:bg-chang-neutral-50'
                      } transition-colors duration-200`}
                      aria-label="Grid view"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' 
                        ? 'bg-chang-orange-500 text-white' 
                        : 'bg-white text-chang-brown-700 hover:bg-chang-neutral-50'
                      } transition-colors duration-200`}
                      aria-label="List view"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {displayedRecipes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-chang-brown-700 mb-2">No recipes found</h3>
              <p className="text-chang-brown-600 mb-6">
                Try adjusting your filters or search for different ingredients.
              </p>
              <button
                onClick={clearFilters}
                className="btn-primary"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Recipe Grid */}
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-6 max-w-4xl mx-auto'
              }>
                {displayedRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    className={viewMode === 'list' ? 'sm:flex sm:max-w-none' : ''}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 text-center">
                  {currentPage < totalPages && (
                    <button
                      onClick={handleLoadMore}
                      className="btn-primary mr-4"
                    >
                      Load More Recipes
                    </button>
                  )}
                  <p className="text-chang-brown-600 mt-4">
                    Showing {displayedRecipes.length} of {totalRecipes} recipes
                    (Page {currentPage} of {totalPages})
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default function RecipesPage() {
  return (
    <Suspense fallback={<RecipeGridSkeleton count={12} />}>
      <RecipesContent />
    </Suspense>
  )
}