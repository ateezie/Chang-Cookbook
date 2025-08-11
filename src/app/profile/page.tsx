'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import ChangLogo from '@/components/ChangLogo'

// Force dynamic rendering to prevent prerender issues
export const dynamic = 'force-dynamic'

interface User {
  id: string
  email: string
  name: string
  role: string
  status: string
  bio?: string | null
  website?: string | null
  socialLinks?: any
  chef?: {
    id: string
    name: string
    avatar?: string | null
  } | null
}

interface FormErrors {
  name?: string
  bio?: string
  website?: string
  chefName?: string
  chefAvatar?: string
  general?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    website: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      facebook: '',
      linkedin: ''
    },
    chef: {
      name: '',
      avatar: ''
    }
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          const userData = data.user
          setUser(userData)
          
          // Populate form data
          setFormData({
            name: userData.name || '',
            bio: userData.bio || '',
            website: userData.website || '',
            socialLinks: {
              twitter: userData.socialLinks?.twitter || '',
              instagram: userData.socialLinks?.instagram || '',
              facebook: userData.socialLinks?.facebook || '',
              linkedin: userData.socialLinks?.linkedin || ''
            },
            chef: {
              name: userData.chef?.name || userData.name || '',
              avatar: userData.chef?.avatar || ''
            }
          })
        } else {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          router.push('/login')
          return
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        router.push('/login')
        return
      }

      setLoading(false)
    }

    fetchProfile()
  }, [router])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setSuccess(false)

    // Client-side validation
    const newErrors: FormErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.chef.name.trim()) {
      newErrors.chefName = 'Chef name is required'
    } else if (formData.chef.name.trim().length < 2) {
      newErrors.chefName = 'Chef name must be at least 2 characters'
    }

    if (formData.website && formData.website.trim() && !/^https?:\/\/.+/.test(formData.website.trim())) {
      newErrors.website = 'Website must start with http:// or https://'
    }

    if (formData.chef.avatar && formData.chef.avatar.trim() && !/^https?:\/\/.+/.test(formData.chef.avatar.trim())) {
      newErrors.chefAvatar = 'Avatar URL must start with http:// or https://'
    }

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setSaving(false)
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          bio: formData.bio.trim() || null,
          website: formData.website.trim() || null,
          socialLinks: {
            twitter: formData.socialLinks.twitter.trim() || undefined,
            instagram: formData.socialLinks.instagram.trim() || undefined,
            facebook: formData.socialLinks.facebook.trim() || undefined,
            linkedin: formData.socialLinks.linkedin.trim() || undefined
          },
          chef: {
            name: formData.chef.name.trim(),
            avatar: formData.chef.avatar.trim() || null
          }
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } else {
        if (data.details) {
          const serverErrors: FormErrors = {}
          data.details.forEach((error: any) => {
            if (error.path.length > 0) {
              const path = error.path[0]
              if (path === 'chef') {
                serverErrors.chefName = error.message
              } else {
                serverErrors[path as keyof FormErrors] = error.message
              }
            }
          })
          setErrors(serverErrors)
        } else {
          setErrors({ general: data.error || 'Failed to update profile' })
        }
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
    }

    setSaving(false)
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('socialLinks.')) {
      const socialField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value
        }
      }))
    } else if (field.startsWith('chef.')) {
      const chefField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        chef: {
          ...prev.chef,
          [chefField]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear related errors
    if (field === 'name' && errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }))
    } else if (field === 'chef.name' && errors.chefName) {
      setErrors(prev => ({ ...prev, chefName: undefined }))
    } else if (field === 'website' && errors.website) {
      setErrors(prev => ({ ...prev, website: undefined }))
    } else if (field === 'chef.avatar' && errors.chefAvatar) {
      setErrors(prev => ({ ...prev, chefAvatar: undefined }))
    } else if (field === 'bio' && errors.bio) {
      setErrors(prev => ({ ...prev, bio: undefined }))
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-chang-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <ChangLogo className="h-16 w-16 mx-auto mb-4 animate-pulse" />
            <p className="text-chang-brown-600">Loading your profile...</p>
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
            <div className="flex items-center py-6">
              <ChangLogo className="h-8 w-8 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-chang-brown-800">
                  Profile Settings
                </h1>
                <p className="text-chang-brown-600">
                  Manage your account and chef profile
                </p>
              </div>
              <div className="ml-auto">
                <Link 
                  href="/dashboard" 
                  className="btn-ghost text-sm"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="section-container">
          <div className="content-container max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm">
              {success && (
                <div className="mx-6 mt-6 bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-green-600 text-sm">Profile updated successfully!</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-600 text-sm">{errors.general}</p>
                  </div>
                )}

                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-chang-brown-800 mb-4">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500 ${
                          errors.name ? 'border-red-300' : 'border-chang-neutral-300'
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-3 py-2 border border-chang-neutral-300 rounded-md bg-chang-neutral-50 text-chang-brown-500"
                      />
                      <p className="mt-1 text-xs text-chang-brown-500">
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        rows={3}
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500 ${
                          errors.bio ? 'border-red-300' : 'border-chang-neutral-300'
                        }`}
                        placeholder="Tell us about yourself and your cooking style..."
                      />
                      <div className="flex justify-between mt-1">
                        {errors.bio && (
                          <p className="text-sm text-red-600">{errors.bio}</p>
                        )}
                        <p className="text-xs text-chang-brown-500 ml-auto">
                          {formData.bio.length}/500 characters
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500 ${
                          errors.website ? 'border-red-300' : 'border-chang-neutral-300'
                        }`}
                        placeholder="https://yourwebsite.com"
                      />
                      {errors.website && (
                        <p className="mt-1 text-sm text-red-600">{errors.website}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chef Profile */}
                <div>
                  <h3 className="text-lg font-medium text-chang-brown-800 mb-4">
                    Chef Profile
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                        Chef Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.chef.name}
                        onChange={(e) => handleInputChange('chef.name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500 ${
                          errors.chefName ? 'border-red-300' : 'border-chang-neutral-300'
                        }`}
                        placeholder="The name that appears on your recipes"
                      />
                      {errors.chefName && (
                        <p className="mt-1 text-sm text-red-600">{errors.chefName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                        Chef Avatar URL
                      </label>
                      <input
                        type="url"
                        value={formData.chef.avatar}
                        onChange={(e) => handleInputChange('chef.avatar', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500 ${
                          errors.chefAvatar ? 'border-red-300' : 'border-chang-neutral-300'
                        }`}
                        placeholder="https://example.com/avatar.jpg"
                      />
                      {errors.chefAvatar && (
                        <p className="mt-1 text-sm text-red-600">{errors.chefAvatar}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="text-lg font-medium text-chang-brown-800 mb-4">
                    Social Media Links
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                        Twitter
                      </label>
                      <input
                        type="text"
                        value={formData.socialLinks.twitter}
                        onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                        className="w-full px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                        placeholder="@yourusername"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                        Instagram
                      </label>
                      <input
                        type="text"
                        value={formData.socialLinks.instagram}
                        onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                        className="w-full px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                        placeholder="@yourusername"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                        Facebook
                      </label>
                      <input
                        type="text"
                        value={formData.socialLinks.facebook}
                        onChange={(e) => handleInputChange('socialLinks.facebook', e.target.value)}
                        className="w-full px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                        placeholder="facebook.com/yourpage"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-chang-brown-700 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="text"
                        value={formData.socialLinks.linkedin}
                        onChange={(e) => handleInputChange('socialLinks.linkedin', e.target.value)}
                        className="w-full px-3 py-2 border border-chang-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500"
                        placeholder="linkedin.com/in/yourprofile"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-chang-neutral-200">
                  <Link
                    href="/dashboard"
                    className="btn-ghost"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Profile'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}