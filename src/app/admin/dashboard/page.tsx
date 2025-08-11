'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ChangLogo from '@/components/ChangLogo'
import { Recipe } from '@/types/recipe'

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
}

export default function AdminDashboard() {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [sortedRecipes, setSortedRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [recipesLoading, setRecipesLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<{
    key: 'recipe' | 'category' | 'difficulty' | 'featured' | 'heroFeatured' | null
    direction: 'asc' | 'desc'
  }>({ key: 'recipe', direction: 'asc' })
  const [stats, setStats] = useState({
    total: 0,
    featured: 0,
    categories: 0
  })
  const router = useRouter()

  // Sorting function
  const sortRecipes = (recipesToSort: Recipe[], key: typeof sortConfig.key, direction: typeof sortConfig.direction) => {
    if (!key) return recipesToSort

    return [...recipesToSort].sort((a, b) => {
      let aValue: string | boolean
      let bValue: string | boolean

      switch (key) {
        case 'recipe':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'category':
          aValue = a.category.toLowerCase()
          bValue = b.category.toLowerCase()
          break
        case 'difficulty':
          aValue = a.difficulty.toLowerCase()
          bValue = b.difficulty.toLowerCase()
          break
        case 'featured':
          aValue = a.featured
          bValue = b.featured
          break
        case 'heroFeatured':
          aValue = a.heroFeatured || false
          bValue = b.heroFeatured || false
          break
        default:
          return 0
      }

      if (key === 'featured' || key === 'heroFeatured') {
        // For featured: featured items first when desc, non-featured first when asc
        if (direction === 'desc') {
          return (bValue as boolean) ? 1 : (aValue as boolean) ? -1 : 0
        } else {
          return (aValue as boolean) ? 1 : (bValue as boolean) ? -1 : 0
        }
      }

      // For text fields (recipe, category, difficulty)
      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    })
  }

  // Handle sorting
  const handleSort = (key: typeof sortConfig.key) => {
    let direction: 'asc' | 'desc' = 'desc' // Default to descending as requested
    
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc'
    }

    setSortConfig({ key, direction })
  }

  // Sort recipes whenever recipes or sortConfig changes
  useEffect(() => {
    const sorted = sortRecipes(recipes, sortConfig.key, sortConfig.direction)
    setSortedRecipes(sorted)
  }, [recipes, sortConfig])

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }

    // Verify authentication
    fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.valid) {
        setUser(data.user)
        loadRecipes()
      } else {
        localStorage.removeItem('admin_token')
        router.push('/admin')
      }
    })
    .catch(() => {
      localStorage.removeItem('admin_token')
      router.push('/admin')
    })
    .finally(() => setLoading(false))
  }, [router])

  const loadRecipes = async () => {
    try {
      const response = await fetch('/api/recipes?limit=100')
      const data = await response.json()
      
      if (response.ok) {
        setRecipes(data.recipes)
        setStats({
          total: data.totalCount,
          featured: data.recipes.filter((r: Recipe) => r.featured).length,
          categories: new Set(data.recipes.map((r: Recipe) => r.category)).size
        })
      }
    } catch (error) {
      console.error('Error loading recipes:', error)
    } finally {
      setRecipesLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin')
  }

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        loadRecipes() // Reload recipes
      } else {
        const data = await response.json()
        alert('Error deleting recipe: ' + data.error)
      }
    } catch (error) {
      alert('Error deleting recipe')
    }
  }

  const toggleFeatured = async (recipe: Recipe) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ featured: !recipe.featured })
      })

      if (response.ok) {
        loadRecipes() // Reload recipes
      }
    } catch (error) {
      console.error('Error toggling featured status:', error)
    }
  }

  const toggleHeroFeatured = async (recipe: Recipe) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ heroFeatured: !recipe.heroFeatured })
      })

      if (response.ok) {
        loadRecipes() // Reload recipes
      }
    } catch (error) {
      console.error('Error toggling hero featured status:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-chang-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <ChangLogo className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <p className="text-chang-brown-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-chang-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-chang-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ChangLogo className="h-8 w-8 mr-3" />
              <h1 className="text-xl font-bold text-chang-brown-800">
                Chang's Cookbook Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-chang-brown-600">
                Welcome, {user?.name}
              </span>
              <Link 
                href="/"
                className="text-sm text-chang-orange-600 hover:text-chang-orange-700"
              >
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm bg-chang-brown-600 text-white px-3 py-1 rounded hover:bg-chang-brown-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-chang-brown-800 mb-2">Total Recipes</h3>
            <p className="text-3xl font-bold text-chang-orange-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-chang-brown-800 mb-2">Featured Recipes</h3>
            <p className="text-3xl font-bold text-chang-orange-600">{stats.featured}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-chang-brown-800 mb-2">Categories</h3>
            <p className="text-3xl font-bold text-chang-orange-600">{stats.categories}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-chang-brown-800">Manage Recipes</h2>
          <div className="flex space-x-4">
            <Link
              href="/admin/recipes/new"
              className="bg-chang-orange-600 text-white px-4 py-2 rounded-md hover:bg-chang-orange-700"
            >
              Add New Recipe
            </Link>
            <Link
              href="/admin/migrate"
              className="bg-chang-brown-600 text-white px-4 py-2 rounded-md hover:bg-chang-brown-700"
            >
              Migrate JSON Data
            </Link>
          </div>
        </div>

        {/* Recipes Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {recipesLoading ? (
            <div className="p-8 text-center">
              <p className="text-chang-brown-600">Loading recipes...</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-chang-brown-600">No recipes found. Start by migrating your JSON data or adding a new recipe.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-chang-neutral-200">
                <thead className="bg-chang-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-chang-brown-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('recipe')}
                        className="flex items-center space-x-1 hover:text-chang-orange-600 transition-colors"
                      >
                        <span>Recipe</span>
                        {sortConfig.key === 'recipe' && (
                          <span className="text-chang-orange-500">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-chang-brown-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('category')}
                        className="flex items-center space-x-1 hover:text-chang-orange-600 transition-colors"
                      >
                        <span>Category</span>
                        {sortConfig.key === 'category' && (
                          <span className="text-chang-orange-500">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-chang-brown-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('difficulty')}
                        className="flex items-center space-x-1 hover:text-chang-orange-600 transition-colors"
                      >
                        <span>Difficulty</span>
                        {sortConfig.key === 'difficulty' && (
                          <span className="text-chang-orange-500">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-chang-brown-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('featured')}
                        className="flex items-center space-x-1 hover:text-chang-orange-600 transition-colors"
                      >
                        <span>Featured</span>
                        {sortConfig.key === 'featured' && (
                          <span className="text-chang-orange-500">
                            {sortConfig.direction === 'desc' ? '★' : '☆'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-chang-brown-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('heroFeatured')}
                        className="flex items-center space-x-1 hover:text-chang-orange-600 transition-colors"
                      >
                        <span>Hero</span>
                        {sortConfig.key === 'heroFeatured' && (
                          <span className="text-chang-orange-500">
                            {sortConfig.direction === 'desc' ? '🏆' : '🏅'}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-chang-brown-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-chang-neutral-200">
                  {sortedRecipes.map((recipe) => (
                    <tr key={recipe.id} className="hover:bg-chang-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {recipe.image && (
                            <img 
                              className="h-10 w-10 rounded-full object-cover mr-4" 
                              src={recipe.image} 
                              alt={recipe.title}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-chang-brown-900">
                              {recipe.title}
                            </div>
                            <div className="text-sm text-chang-brown-500">
                              {recipe.prepTime + recipe.cookTime} min
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-chang-brown-900">
                        {recipe.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {recipe.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleFeatured(recipe)}
                          className={`text-sm font-medium ${
                            recipe.featured 
                              ? 'text-chang-orange-600 hover:text-chang-orange-700'
                              : 'text-chang-brown-400 hover:text-chang-brown-600'
                          }`}
                        >
                          {recipe.featured ? '⭐ Featured' : '☆ Feature'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleHeroFeatured(recipe)}
                          className={`text-sm font-medium ${
                            recipe.heroFeatured 
                              ? 'text-red-600 hover:text-red-700'
                              : 'text-chang-brown-400 hover:text-chang-brown-600'
                          }`}
                        >
                          {recipe.heroFeatured ? '🏆 Hero' : '🏅 Set Hero'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Link
                          href={`/recipes/${recipe.id}`}
                          className="text-chang-orange-600 hover:text-chang-orange-700"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/recipes/${recipe.id}/edit`}
                          className="text-chang-brown-600 hover:text-chang-brown-700"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}