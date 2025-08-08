'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '@/components/Layout'
import RecipeCard from '@/components/RecipeCard'
import { LoadingPage } from '@/components/Loading'
import ClientOnlyDate from '@/components/ClientOnlyDate'
import { getRecipeById, getRelatedRecipes, formatTime } from '@/lib/recipes'
import { Recipe } from '@/types'

function StarRating({ rating, size = 'md' }: { rating: number, size?: 'sm' | 'md' | 'lg' }) {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  }

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <svg key={i} className={`${sizeClasses[size]} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )
  }

  if (hasHalfStar) {
    stars.push(
      <svg key="half" className={`${sizeClasses[size]} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipPath="inset(0 50% 0 0)" />
      </svg>
    )
  }

  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <svg key={`empty-${i}`} className={`${sizeClasses[size]} text-chang-neutral-300`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )
  }

  return <div className="flex">{stars}</div>
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-chang-orange-100 text-chang-orange-800'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[difficulty as keyof typeof colors]}`}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  )
}

interface RecipePageContentProps {
  slug: string
}

export default function RecipePageContent({ slug }: RecipePageContentProps) {
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [relatedRecipes, setRelatedRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [savedRecipe, setSavedRecipe] = useState(false)
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set())

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`/api/recipes/slug/${slug}`)
        
        if (!response.ok) {
          router.push('/recipes')
          return
        }

        const data = await response.json()
        setRecipe(data.recipe)
        
        // For now, use related recipes from JSON until we implement API-based related recipes
        setRelatedRecipes(getRelatedRecipes(data.recipe, 4))
      } catch (error) {
        console.error('Error fetching recipe:', error)
        router.push('/recipes')
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [slug, router])

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients)
    if (newChecked.has(index)) {
      newChecked.delete(index)
    } else {
      newChecked.add(index)
    }
    setCheckedIngredients(newChecked)
  }

  const toggleSaved = () => {
    setSavedRecipe(!savedRecipe)
  }

  const shareRecipe = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe?.title,
          text: recipe?.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      // You could show a toast notification here
    }
  }

  if (loading) {
    return (
      <Layout>
        <LoadingPage text="Loading recipe..." />
      </Layout>
    )
  }

  if (!recipe) {
    return (
      <Layout>
        <div className="section-container text-center">
          <h1 className="text-2xl font-bold text-chang-brown-900 mb-4">Recipe not found</h1>
          <Link href="/recipes" className="btn-primary">
            Browse All Recipes
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Breadcrumbs */}
      <nav className="bg-chang-neutral-50 py-4">
        <div className="content-container">
          <div className="flex items-center space-x-2 text-sm text-chang-brown-700">
            <Link href="/" className="hover:text-chang-orange-500 transition-colors duration-200">
              Home
            </Link>
            <svg className="w-4 h-4 text-chang-brown-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/recipes" className="hover:text-chang-orange-500 transition-colors duration-200">
              Recipes
            </Link>
            <svg className="w-4 h-4 text-chang-brown-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-chang-brown-700 font-medium">{recipe.title}</span>
          </div>
        </div>
      </nav>

      {/* Recipe Header */}
      <div className="section-container">
        <div className="content-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Recipe Image */}
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              
              {/* Featured Badge */}
              {recipe.featured && (
                <div className="absolute top-4 right-4">
                  <span className="bg-chang-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    ⭐ Featured
                  </span>
                </div>
              )}
            </div>

            {/* Recipe Info */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-chang-brown-700 mb-4">
                {recipe.title}
              </h1>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  <StarRating rating={recipe.rating} size="lg" />
                  <span className="ml-2 text-lg font-semibold text-chang-brown-700">
                    {recipe.rating}
                  </span>
                </div>
                <span className="text-chang-brown-500">
                  ({recipe.reviewCount} reviews)
                </span>
              </div>

              <div className="flex items-center space-x-2 mb-6">
                <Image
                  src={recipe.chef.avatar}
                  alt={recipe.chef.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span className="text-chang-brown-600">by {recipe.chef.name}</span>
                <span className="text-chang-brown-400">•</span>
                <ClientOnlyDate 
                  dateString={recipe.createdAt} 
                  className="text-chang-brown-500 text-sm"
                />
              </div>

              <p className="text-lg text-chang-brown-600 leading-relaxed mb-8">
                {recipe.description}
              </p>

              {/* Recipe Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 p-6 bg-stone-100 rounded-xl">
                <div className="text-center">
                  <div className="text-chang-orange-500 mb-2">
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-sm text-chang-brown-500">Prep Time</div>
                  <div className="font-semibold text-chang-brown-700">{formatTime(recipe.prepTime)}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-chang-orange-500 mb-2">
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                  <div className="text-sm text-chang-brown-500">Cook Time</div>
                  <div className="font-semibold text-chang-brown-700">{formatTime(recipe.cookTime)}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-blue-500 mb-2">
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="text-sm text-chang-brown-500">Servings</div>
                  <div className="font-semibold text-chang-brown-700">{recipe.servings}</div>
                </div>
                
                <div className="text-center">
                  <DifficultyBadge difficulty={recipe.difficulty} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <button 
                  onClick={toggleSaved}
                  className={`btn-${savedRecipe ? 'primary' : 'secondary'} flex items-center`}
                >
                  <svg className="w-5 h-5 mr-2" fill={savedRecipe ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {savedRecipe ? 'Saved' : 'Save Recipe'}
                </button>
                
                <button 
                  onClick={shareRecipe}
                  className="btn-ghost flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share
                </button>
              </div>

              {/* Tags */}
              {recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-chang-orange-100 text-chang-orange-700 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="section-container bg-slate-50">
        <div className="content-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Ingredients */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-8 sticky top-8">
                <h2 className="text-2xl font-bold text-chang-brown-700 mb-6">
                  Ingredients
                </h2>
                
                <div className="space-y-4">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={`ingredient-${index}`}
                        checked={checkedIngredients.has(index)}
                        onChange={() => toggleIngredient(index)}
                        className="mt-1 w-4 h-4 text-chang-orange-500 bg-white border-chang-neutral-300 rounded focus:ring-chang-orange-500 focus:ring-2"
                      />
                      <label 
                        htmlFor={`ingredient-${index}`}
                        className={`flex-1 cursor-pointer ${
                          checkedIngredients.has(index) 
                            ? 'line-through text-chang-brown-500' 
                            : 'text-chang-brown-700'
                        }`}
                      >
                        <span className="font-medium">{ingredient.amount}</span>{' '}
                        <span>{ingredient.item}</span>
                      </label>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 btn-secondary text-sm">
                  📝 Add to Shopping List
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-chang-brown-700 mb-6">
                  Instructions
                </h2>
                
                <div className="space-y-8">
                  {recipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-chang-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-chang-brown-700 leading-relaxed">
                          {instruction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutrition Info */}
              <div className="bg-white rounded-xl shadow-sm p-8 mt-8">
                <h3 className="text-xl font-bold text-chang-brown-700 mb-4">
                  Nutrition Information
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-chang-orange-500">
                      {recipe.nutrition.calories}
                    </div>
                    <div className="text-sm text-chang-brown-600">Calories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-500">
                      {recipe.nutrition.protein}
                    </div>
                    <div className="text-sm text-chang-brown-600">Protein</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-500">
                      {recipe.nutrition.carbs}
                    </div>
                    <div className="text-sm text-chang-brown-600">Carbs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-chang-orange-500">
                      {recipe.nutrition.fat}
                    </div>
                    <div className="text-sm text-chang-brown-600">Fat</div>
                  </div>
                </div>
                <p className="text-xs text-chang-brown-500 mt-4 text-center">
                  * Nutritional values are approximate and per serving
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Recipes */}
      {relatedRecipes.length > 0 && (
        <div className="section-container">
          <div className="content-container">
            <h2 className="text-3xl font-bold text-chang-brown-700 mb-8 text-center">
              You Might Also Like
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedRecipes.map((relatedRecipe) => (
                <RecipeCard key={relatedRecipe.id} recipe={relatedRecipe} />
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}