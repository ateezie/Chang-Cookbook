'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ChangLogo from '@/components/ChangLogo'
import { Ingredient } from '@/types/recipe'

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

interface Category {
  id: string
  name: string
  description: string
  emoji: string
  count: number
}

const difficulties = ['easy', 'medium', 'hard'] as const

// Function to generate URL-friendly slugs
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export default function CreateRecipe() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    prepTime: 0,
    cookTime: 0,
    servings: 4,
    image: '',
    tags: '',
    featured: false
  })

  const [ingredients, setIngredients] = useState<Ingredient[]>([{ item: '', amount: '' }])
  const [instructions, setInstructions] = useState<string[]>([''])

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('user')
      
      if (!token || !storedUser) {
        router.push('/login')
        return
      }

      try {
        // Verify token is still valid and fetch categories
        const [profileResponse, categoriesResponse] = await Promise.all([
          fetch('/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/categories')
        ])

        if (profileResponse.ok) {
          const data = await profileResponse.json()
          setUser(data.user)
        } else {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          router.push('/login')
          return
        }

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.categories || [])
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/login')
        return
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // Validation
    if (!formData.title.trim()) {
      setError('Recipe title is required')
      setSaving(false)
      return
    }

    if (!formData.category) {
      setError('Category is required')
      setSaving(false)
      return
    }

    if (ingredients.filter(ing => ing.item.trim() && ing.amount.trim()).length === 0) {
      setError('At least one ingredient is required')
      setSaving(false)
      return
    }

    if (instructions.filter(inst => inst.trim()).length === 0) {
      setError('At least one instruction is required')
      setSaving(false)
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      
      // Generate a unique ID for the recipe
      const recipeId = `${formData.slug || generateSlug(formData.title)}-${Date.now()}`

      const newRecipe = {
        id: recipeId,
        title: formData.title.trim(),
        slug: formData.slug || generateSlug(formData.title),
        description: formData.description.trim(),
        categoryId: formData.category,
        difficulty: formData.difficulty,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        totalTime: formData.prepTime + formData.cookTime,
        servings: formData.servings,
        image: formData.image.trim(),
        featured: formData.featured,
        ingredients: ingredients.filter(ing => ing.item.trim() && ing.amount.trim()),
        instructions: instructions.filter(inst => inst.trim()),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }

      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newRecipe)
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const data = await response.json()
        setError(data.error || 'Error creating recipe')
      }
    } catch (error) {
      console.error('Error creating recipe:', error)
      setError('Error creating recipe')
    } finally {
      setSaving(false)
    }
  }

  const addIngredient = () => {
    setIngredients([...ingredients, { item: '', amount: '' }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: 'item' | 'amount', value: string) => {
    const updated = ingredients.map((ing, i) => 
      i === index ? { ...ing, [field]: value } : ing
    )
    setIngredients(updated)
  }

  const addInstruction = () => {
    setInstructions([...instructions, ''])
  }

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const updateInstruction = (index: number, value: string) => {
    const updated = instructions.map((inst, i) => 
      i === index ? value : inst
    )
    setInstructions(updated)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('type', 'recipe')

      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: uploadFormData
      })

      const data = await response.json()

      if (response.ok) {
        const imageUrl = data.path
        setFormData(prev => ({ ...prev, image: imageUrl }))
        setImagePreview(imageUrl)
      } else {
        setError(data.error || 'Failed to upload image')
      }
    } catch (error) {
      setError('Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }))
    setImagePreview('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-chang-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <ChangLogo className="h-16 w-16 mx-auto mb-4 animate-pulse" />
          <p className="text-chang-brown-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
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
                Create New Recipe
              </h1>
            </div>
            <Link
              href="/dashboard"
              className="text-sm text-chang-brown-600 hover:text-chang-brown-700"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-chang-brown-800 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value
                    // Auto-generate slug if slug field is empty or matches the old title slug
                    if (!formData.slug || formData.slug === generateSlug(formData.title)) {
                      setFormData({...formData, title: newTitle, slug: generateSlug(newTitle)})
                    } else {
                      setFormData({...formData, title: newTitle})
                    }
                  }}
                  className="w-full px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                  Permalink/URL Slug *
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-chang-brown-500">/recipes/</span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="flex-1 px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                    placeholder="recipe-url-slug"
                    pattern="^[a-z0-9-]+$"
                    title="Only lowercase letters, numbers, and hyphens are allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, slug: generateSlug(formData.title)})}
                    className="px-3 py-2 text-xs bg-chang-orange-100 text-chang-orange-700 border border-chang-orange-200 rounded hover:bg-chang-orange-200"
                  >
                    Generate
                  </button>
                </div>
                <p className="mt-1 text-xs text-chang-brown-500">
                  URL-friendly version of the recipe title. Only lowercase letters, numbers, and hyphens.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                  Difficulty *
                </label>
                <select
                  required
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard'})}
                  className="w-full px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                  Servings *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.servings}
                  onChange={(e) => setFormData({...formData, servings: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                  Prep Time (minutes) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.prepTime}
                  onChange={(e) => setFormData({...formData, prepTime: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                  Cook Time (minutes) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.cookTime}
                  onChange={(e) => setFormData({...formData, cookTime: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                  Recipe Image
                </label>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4">
                    <div className="relative inline-block">
                      <img 
                        src={imagePreview} 
                        alt="Recipe preview" 
                        className="w-32 h-32 object-cover rounded-lg border border-chang-neutral-300"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="px-4 py-2 bg-chang-orange-600 text-white rounded-md hover:bg-chang-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                      {uploading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          📁 Choose Image
                        </>
                      )}
                    </div>
                  </label>
                  
                  {/* Manual URL Input */}
                  <span className="text-chang-brown-500">or</span>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({...formData, image: e.target.value})
                      setImagePreview(e.target.value)
                    }}
                    className="flex-1 px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                    placeholder="Or paste image URL here"
                  />
                </div>
                
                <p className="mt-2 text-xs text-chang-brown-500">
                  Upload an image file (max 5MB) or paste an image URL. Supported formats: JPG, PNG, WebP, GIF.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="quick, healthy, gluten-free"
                  className="w-full px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    className="mr-2 rounded border-chang-neutral-300 text-chang-orange-600 focus:ring-chang-orange-500"
                  />
                  <span className="text-sm font-medium text-chang-brown-700">Featured Recipe</span>
                </label>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-chang-brown-800">Ingredients</h3>
              <button
                type="button"
                onClick={addIngredient}
                className="bg-chang-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-chang-orange-700"
              >
                Add Ingredient
              </button>
            </div>
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Amount (e.g., 1 cup)"
                    value={ingredient.amount}
                    onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                    className="w-1/3 px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={ingredient.item}
                    onChange={(e) => updateIngredient(index, 'item', e.target.value)}
                    className="flex-1 px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="text-red-600 hover:text-red-700 px-2"
                    disabled={ingredients.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-chang-brown-800">Instructions</h3>
              <button
                type="button"
                onClick={addInstruction}
                className="bg-chang-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-chang-orange-700"
              >
                Add Step
              </button>
            </div>
            <div className="space-y-3">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-3">
                  <span className="mt-2 text-sm font-medium text-chang-brown-600 min-w-[2rem]">
                    {index + 1}.
                  </span>
                  <textarea
                    rows={2}
                    placeholder="Describe this step..."
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className="text-red-600 hover:text-red-700 px-2 mt-2"
                    disabled={instructions.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-chang-brown-600 border border-chang-brown-300 rounded-md hover:bg-chang-brown-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-chang-orange-600 text-white rounded-md hover:bg-chang-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating Recipe...' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}