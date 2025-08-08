'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import RecipeCard from '@/components/RecipeCard'
import SearchBar from '@/components/SearchBar'
import CategoryFilter from '@/components/CategoryFilter'
import { RecipeGridSkeleton } from '@/components/Loading'
import { searchRecipes, getAllCategories, filterRecipes, sortRecipes, getPopularTags } from '@/lib/recipes'
import { Recipe, FilterOptions, SortOptions } from '@/types'

const RESULTS_PER_PAGE = 12

function SearchContent() {
  const searchParams = useSearchParams()
  // const router = useRouter() // Currently unused
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<Recipe[]>([])
  const [displayedResults, setDisplayedResults] = useState<Recipe[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  
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

  // Initialize search from URL params
  useEffect(() => {
    const query = searchParams.get('q') || ''
    setSearchQuery(query)
    setFilters(prev => ({ ...prev, searchQuery: query }))
    setLoading(false)
  }, [searchParams])

  // Get search results
  useEffect(() => {
    if (filters.searchQuery) {
      const results = searchRecipes(filters.searchQuery)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
    setCurrentPage(1) // Reset to first page on new search
  }, [filters.searchQuery])

  // Get filtered and sorted results
  const filteredAndSortedResults = useMemo(() => {
    const filtered = filterRecipes(searchResults, filters)
    return sortRecipes(filtered, sortOptions)
  }, [searchResults, filters, sortOptions])

  // Pagination
  const totalResults = filteredAndSortedResults.length
  const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE)
  
  useEffect(() => {
    const startIndex = (currentPage - 1) * RESULTS_PER_PAGE
    const endIndex = startIndex + RESULTS_PER_PAGE
    setDisplayedResults(filteredAndSortedResults.slice(startIndex, endIndex))
  }, [filteredAndSortedResults, currentPage])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, sortOptions])

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setFilters(prev => ({ ...prev, searchQuery: query }))
    
    // Update URL without page refresh
    if (query.trim()) {
      window.history.pushState(null, '', `/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

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

  // Clear all filters
  const clearFilters = () => {
    setFilters(prev => ({ ...prev, category: 'all', difficulty: 'all' }))
    setSortOptions({ sortBy: 'newest', order: 'desc' })
  }

  // Load more results
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const categories = getAllCategories()
  const popularTags = getPopularTags(8)
  const hasActiveFilters = filters.category !== 'all' || filters.difficulty !== 'all'
  const hasResults = searchResults.length > 0
  const hasQuery = (filters.searchQuery || '').trim().length > 0

  if (loading) {
    return (
      <Layout>
        <div className="section-container">
          <div className="content-container">
            <div className="max-w-2xl mx-auto mb-8">
              <div className="h-12 bg-chang-neutral-200 rounded animate-pulse"></div>
            </div>
            <RecipeGridSkeleton count={8} />
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Search Header */}
      <div className="gradient-chang-warm py-16">
        <div className="content-container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold text-chang-brown-900 mb-8">
              Search Recipes
            </h1>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearch}
                placeholder="Search by recipe name, ingredients, or chef..."
                className="w-full"
              />
            </div>

            {/* Search Results Info */}
            {hasQuery && (
              <div className="text-lg font-body text-chang-brown-700">
                {hasResults ? (
                  <>
                    Found <span className="font-semibold text-chang-brown-900">{totalResults}</span> recipe{totalResults !== 1 ? 's' : ''} 
                    for &quot;<span className="font-semibold text-chang-brown-900">{filters.searchQuery || ''}</span>&quot;
                  </>
                ) : (
                  <>
                    No recipes found for &quot;<span className="font-semibold text-chang-brown-900">{filters.searchQuery || ''}</span>&quot;
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="section-container">
        <div className="content-container">
          {/* No search query */}
          {!hasQuery && (
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🔍</div>
              <h2 className="text-2xl font-heading font-bold text-chang-brown-900 mb-4">
                What are you craving today?
              </h2>
              <p className="text-lg font-body text-chang-brown-700 mb-8">
                Search for recipes by name, ingredients, or cooking method
              </p>
              
              {/* Popular Tags */}
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-heading font-semibold text-chang-brown-900 mb-4">Popular Searches</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {popularTags.map((tagData) => (
                    <button
                      key={tagData.tag}
                      onClick={() => handleSearch(tagData.tag)}
                      className="px-4 py-2 bg-chang-orange-100 text-chang-orange-700 rounded-full text-sm font-body font-medium hover:bg-chang-orange-200 transition-colors duration-200"
                    >
                      {tagData.tag} ({tagData.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {hasQuery && (
            <>
              {/* Filters - only show if there are results */}
              {hasResults && (
                <div className="mb-8 space-y-6">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-body font-medium text-chang-brown-800 mb-3">
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
                        <label className="block text-sm font-body font-medium text-chang-brown-800 mb-2">
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
                        <label className="block text-sm font-body font-medium text-chang-brown-800 mb-2">
                          Sort by
                        </label>
                        <select
                          value={sortOptions.sortBy}
                          onChange={(e) => handleSortChange(e.target.value as SortOptions['sortBy'])}
                          className="input-field w-40"
                        >
                          <option value="newest">Most Relevant</option>
                          <option value="rating">Highest Rated</option>
                          <option value="popularity">Most Popular</option>
                          <option value="prepTime">Quickest</option>
                        </select>
                      </div>

                      {/* Clear Filters */}
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-chang-orange-400 hover:text-chang-orange-600 font-body font-medium text-sm mt-6"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              {displayedResults.length === 0 && hasResults === false ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">😔</div>
                  <h3 className="text-2xl font-heading font-bold text-chang-brown-900 mb-2">No recipes found</h3>
                  <p className="text-chang-brown-700 font-body mb-6">
                    Try searching for different ingredients or recipe names.
                  </p>
                  
                  {/* Search Suggestions */}
                  <div className="max-w-md mx-auto">
                    <h4 className="font-heading font-semibold text-chang-brown-900 mb-4">Try searching for:</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['pasta', 'chicken', 'dessert', 'salad', 'quick meals'].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => handleSearch(suggestion)}
                          className="px-3 py-1 bg-chang-neutral-200 text-chang-brown-800 font-body rounded-full text-sm hover:bg-chang-neutral-300 transition-colors duration-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : displayedResults.length === 0 && hasActiveFilters ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-heading font-bold text-chang-brown-900 mb-2">No recipes match your filters</h3>
                  <p className="text-chang-brown-700 font-body mb-6">
                    Try adjusting your filters to see more results.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn-primary"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : displayedResults.length > 0 ? (
                <>
                  {/* Results Count */}
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-chang-brown-700 font-body">
                      Showing {displayedResults.length} of {totalResults} results
                    </p>
                  </div>

                  {/* Recipe Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedResults.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} />
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
                          Load More Results
                        </button>
                      )}
                      <p className="text-chang-brown-700 font-body mt-4">
                        Page {currentPage} of {totalPages}
                      </p>
                    </div>
                  )}
                </>
              ) : null}
            </>
          )}

          {/* Popular Categories for empty search */}
          {!hasQuery && (
            <div className="mt-16">
              <h2 className="text-2xl font-heading font-bold text-chang-brown-900 mb-8 text-center">
                Browse by Category
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.slice(0, 8).map((category) => (
                  <Link
                    key={category.id}
                    href={`/recipes?category=${category.id}`}
                    className="feature-card group hover:scale-105 transform transition-all duration-200 hover:shadow-lg text-center"
                  >
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
                      {category.emoji}
                    </div>
                    <h3 className="font-heading font-semibold text-chang-brown-900 group-hover:text-chang-orange-400 transition-colors duration-200">
                      {category.name}
                    </h3>
                    <p className="text-chang-brown-600 font-body text-sm mt-1">
                      {category.count} recipes
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<RecipeGridSkeleton count={8} />}>
      <SearchContent />
    </Suspense>
  )
}