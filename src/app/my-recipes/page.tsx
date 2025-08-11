'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import RecipeCard from '@/components/RecipeCard'
import ChangLogo from '@/components/ChangLogo'
import { Recipe } from '@/types'

// Force dynamic rendering to prevent prerender issues
export const dynamic = 'force-dynamic'

interface User {
  id: string
  email: string
  name: string
  role: string
  chef?: {
    id: string
    name: string
    avatar?: string | null
  } | null
}

// Using Recipe type from @/types

export default function MyRecipesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMyRecipes = async () => {
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        router.push('/login')
        return
      }

      try {
        // Get current user
        const profileResponse = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!profileResponse.ok) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          router.push('/login')
          return
        }

        const profileData = await profileResponse.json()
        setUser(profileData.user)

        // Get recipes by this chef
        const recipesResponse = await fetch(`/api/recipes?chef=${profileData.user.chef?.id || profileData.user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (recipesResponse.ok) {
          const recipesData = await recipesResponse.json()
          setRecipes(recipesData.recipes || [])
        } else {
          // If we can't fetch chef-specific recipes, show empty state
          setRecipes([])
        }

      } catch (error) {
        console.error('Error fetching my recipes:', error)
        setRecipes([])
      }

      setLoading(false)
    }

    fetchMyRecipes()
  }, [router])

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-chang-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <ChangLogo className="h-16 w-16 mx-auto mb-4 animate-pulse" />
            <p className="text-chang-brown-600">Loading your recipes...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <Layout>
      <div className="min-h-screen bg-chang-neutral-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-chang-neutral-200">
          <div className="content-container">
            <div className="py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-chang-brown-800 mb-2">
                    My Recipes
                  </h1>
                  <p className="text-chang-brown-600">
                    Manage and edit your recipe collection
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/admin/recipes/create"
                    className="btn-primary"
                  >
                    Add New Recipe
                  </Link>
                  <Link 
                    href="/dashboard"
                    className="btn-ghost"
                  >
                    Back to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="section-container">
          <div className="content-container">
            {recipes.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <div className="mb-6">
                  <svg className="w-24 h-24 mx-auto text-chang-brown-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-chang-brown-800 mb-3">
                  No recipes yet
                </h3>
                <p className="text-chang-brown-600 mb-8 max-w-md mx-auto">
                  You haven't created any recipes yet. Start sharing your culinary creations with the community!
                </p>
                <Link 
                  href="/admin/recipes/create"
                  className="btn-primary"
                >
                  Create Your First Recipe
                </Link>
              </div>
            ) : (
              /* Recipe Grid */
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="text-sm text-chang-brown-600">
                    Found {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recipes.map((recipe) => (
                    <div key={recipe.id} className="relative group">
                      <RecipeCard recipe={recipe} />
                      
                      {/* Edit Button Overlay */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/recipes/${recipe.id}/edit`}
                          className="bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                          title="Edit Recipe"
                        >
                          <svg className="w-4 h-4 text-chang-brown-600 hover:text-chang-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}