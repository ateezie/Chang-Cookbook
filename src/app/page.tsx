'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import Hero from '@/components/Hero'
import RecipeCard from '@/components/RecipeCard'
import { Recipe } from '@/types'
// import CategoryFilter from '@/components/CategoryFilter' // Currently unused
import { Category } from '@/types'

export default function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recipes and categories concurrently
        const [recipesResponse, categoriesResponse] = await Promise.all([
          fetch('/api/recipes?limit=50'),
          fetch('/api/categories')
        ])
        
        if (recipesResponse.ok) {
          const recipesData = await recipesResponse.json()
          setRecipes(recipesData.recipes)
          setFeaturedRecipes(recipesData.recipes.filter((recipe: Recipe) => recipe.featured))
        }
        
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.categories)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        // No fallback - rely on API endpoints
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Remove synchronous calls - data now fetched via API
  
  // Get the hero featured recipe (or fallback to first featured, then first recipe)
  const heroFeaturedRecipe = recipes.find(recipe => recipe.heroFeatured) || featuredRecipes[0] || recipes[0]

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chang-orange-500 mx-auto mb-4"></div>
            <p className="text-chang-brown-600">Loading recipes...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Hero Section */}
      <Hero featuredRecipe={heroFeaturedRecipe} />

      {/* Featured Recipes Section */}
      <section className="section-container bg-white">
        <div className="content-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-chang-brown-900 mb-4">
              Featured Recipes
            </h2>
            <p className="text-lg font-body text-chang-brown-700 max-w-2xl mx-auto">
              Here are four of my favorite authentic Thai recipes curated by my mother! 🥰
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredRecipes.slice(0, 4).map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} featured />
            ))}
          </div>

          <div className="text-center">
            <Link 
              href="/recipes?featured=true"
              className="btn-primary inline-flex items-center"
            >
              View All Featured Recipes
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-container bg-chang-neutral-100">
        <div className="content-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-chang-brown-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg font-body text-chang-brown-700 max-w-2xl mx-auto">
              Find the perfect recipe for any occasion. From quick weeknight dinners to special celebrations.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/recipes?category=${category.id}`}
                className="feature-card group hover:scale-105 transform transition-all duration-200 hover:shadow-lg"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                  {category.emoji}
                </div>
                <h3 className="text-lg font-heading font-semibold text-chang-brown-900 mb-2 group-hover:text-chang-orange-400 transition-colors duration-200">
                  {category.name}
                </h3>
                <p className="text-chang-brown-700 font-body text-sm mb-3">
                  {category.description}
                </p>
                <span className="text-chang-orange-400 font-medium text-sm">
                  {category.count} recipes →
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link 
              href="/recipes"
              className="btn-secondary inline-flex items-center"
            >
              View All Recipes
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Recipes Section */}
      <section className="section-container bg-white">
        <div className="content-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-chang-brown-900 mb-4">
              Recent Recipes
            </h2>
            <p className="text-lg font-body text-chang-brown-700 max-w-2xl mx-auto">
              Discover our latest additions to the cookbook. Fresh ideas for your next meal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recipes.slice(0, 8).map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Hidden for now, might revisit later */}
      {/*
      <section className="section-container gradient-chang-warm">
        <div className="content-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-chang-brown-900 mb-4">
              Why Choose Chang Cookbook?
            </h2>
            <p className="text-lg font-body text-chang-brown-700 max-w-2xl mx-auto">
              We&apos;re committed to bringing you the best cooking experience with tested recipes and helpful guides.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="feature-card text-center group hover:scale-105 transform transition-all duration-200">
              <div className="w-16 h-16 mx-auto mb-6 bg-chang-orange-400 text-white rounded-full flex items-center justify-center text-2xl group-hover:bg-chang-orange-600 transition-colors duration-200 shadow-lg shadow-chang-orange-400/20">
                📚
              </div>
              <h3 className="text-xl font-heading font-semibold text-chang-brown-900 mb-4">
                Tested Recipes
              </h3>
              <p className="text-chang-brown-700 font-body leading-relaxed">
                Every recipe is thoroughly tested by our kitchen team to ensure perfect results every time you cook.
              </p>
            </div>

            <div className="feature-card text-center group hover:scale-105 transform transition-all duration-200">
              <div className="w-16 h-16 mx-auto mb-6 bg-chang-brown-700 text-white rounded-full flex items-center justify-center text-2xl group-hover:bg-chang-brown-800 transition-colors duration-200 shadow-lg shadow-chang-brown-700/20">
                ⏰
              </div>
              <h3 className="text-xl font-heading font-semibold text-chang-brown-900 mb-4">
                Quick & Easy
              </h3>
              <p className="text-chang-brown-700 font-body leading-relaxed">
                Most of our recipes are ready in 30 minutes or less, perfect for busy weeknights and quick meals.
              </p>
            </div>

            <div className="feature-card text-center group hover:scale-105 transform transition-all duration-200">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl group-hover:bg-green-600 transition-colors duration-200 shadow-lg shadow-green-500/20">
                🌱
              </div>
              <h3 className="text-xl font-heading font-semibold text-chang-brown-900 mb-4">
                Healthy Options
              </h3>
              <p className="text-chang-brown-700 font-body leading-relaxed">
                Nutritious and delicious options for every dietary need, from vegetarian to gluten-free choices.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg shadow-chang-brown-800/10 border border-chang-neutral-100 p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-heading font-bold text-chang-orange-400 mb-2">
                  {stats.total}+
                </div>
                <div className="text-chang-brown-700 font-body font-medium">Total Recipes</div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-chang-brown-700 mb-2">
                  {stats.totalReviews.toLocaleString()}+
                </div>
                <div className="text-chang-brown-700 font-body font-medium">Happy Cooks</div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-chang-orange-600 mb-2">
                  {stats.avgRating.toFixed(1)}
                </div>
                <div className="text-chang-brown-700 font-body font-medium">Avg Rating</div>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold text-chang-brown-800 mb-2">
                  {Math.round(stats.avgCookTime)}
                </div>
                <div className="text-chang-brown-700 font-body font-medium">Avg Cook Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}

      {/* Newsletter Section - Hidden for now, might revisit later */}
      {/*
      <section className="section-container bg-chang-brown-900 text-white">
        <div className="content-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              Never Miss a Recipe
            </h2>
            <p className="text-xl font-body text-chang-neutral-200 mb-8">
              Subscribe to our newsletter and get the latest recipes, cooking tips, and exclusive content delivered to your inbox.
            </p>
            
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-3 rounded-lg border-0 text-chang-brown-950 font-body placeholder-chang-neutral-500 focus:outline-none focus:ring-2 focus:ring-chang-orange-400"
              />
              <button className="btn-primary whitespace-nowrap">
                Subscribe Now
              </button>
            </div>
            
            <p className="text-chang-neutral-400 font-body text-sm mt-4">
              Join 10,000+ food lovers. No spam, unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
      */}
    </Layout>
  )
}