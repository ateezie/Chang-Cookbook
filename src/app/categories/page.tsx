'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { LoadingPage } from '@/components/Loading'
import { getAllCategories } from '@/lib/recipes'
import { Category } from '@/types'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        
        const data = await response.json()
        setCategories(data.categories)
      } catch (error) {
        console.error('Error fetching categories:', error)
        setError('Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <Layout>
        <LoadingPage text="Loading categories..." />
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="section-container text-center">
          <h1 className="text-2xl font-bold text-chang-brown-900 mb-4">Error</h1>
          <p className="text-chang-brown-600 mb-6">{error}</p>
          <Link href="/recipes" className="btn-primary">
            Browse All Recipes
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-chang-orange-50 to-chang-neutral-50 py-16">
        <div className="content-container text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-chang-brown-900 mb-6">
            Recipe Categories
          </h1>
          <p className="text-xl text-chang-brown-600 max-w-3xl mx-auto leading-relaxed">
            Explore our carefully curated recipe collections. From quick weeknight dinners 
            to elaborate special occasion dishes, find exactly what you're craving.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="section-container">
        <div className="content-container">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-chang-brown-600 mb-6">No categories found.</p>
              <Link href="/recipes" className="btn-primary">
                Browse All Recipes
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categories.map((category) => (
                <Link 
                  key={category.id} 
                  href={`/recipes?category=${category.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-chang-neutral-200 hover:border-chang-orange-300 transform hover:-translate-y-1">
                    {/* Category Header */}
                    <div className="bg-gradient-to-r from-chang-orange-500 to-chang-orange-600 p-6 text-center">
                      <div className="text-4xl mb-3">
                        {category.emoji || '🍽️'}
                      </div>
                      <h3 className="text-xl font-bold text-white capitalize">
                        {category.name}
                      </h3>
                    </div>

                    {/* Category Content */}
                    <div className="p-6">
                      <p className="text-chang-brown-600 text-center mb-4 line-clamp-3">
                        {category.description || `Discover delicious ${category.name} recipes`}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-chang-neutral-200">
                        <div className="flex items-center text-chang-brown-500">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-sm">
                            {category.count || 0} recipe{(category.count || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        <div className="text-chang-orange-600 group-hover:text-chang-orange-700 transition-colors">
                          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-chang-orange-500 to-chang-orange-600 py-16">
        <div className="content-container text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-chang-orange-100 mb-8 text-lg">
            Browse all our recipes or use the search to find specific dishes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/recipes" 
              className="bg-white text-chang-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-chang-neutral-50 transition-colors duration-200 shadow-lg"
            >
              Browse All Recipes
            </Link>
            <Link 
              href="/search" 
              className="bg-chang-orange-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-chang-orange-800 transition-colors duration-200 shadow-lg border-2 border-chang-orange-400"
            >
              Search Recipes
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}