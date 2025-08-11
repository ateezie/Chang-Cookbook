'use client'

import { useState, useEffect } from 'react'
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
  chef?: {
    id: string
    name: string
    avatar?: string | null
  } | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('user')
      
      if (!token || !storedUser) {
        router.push('/login')
        return
      }

      try {
        // Verify token is still valid by fetching profile
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          // Token is invalid, redirect to login
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          router.push('/login')
          return
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        router.push('/login')
        return
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-chang-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <ChangLogo className="h-16 w-16 mx-auto mb-4 animate-pulse" />
            <p className="text-chang-brown-600">Loading your dashboard...</p>
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
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <ChangLogo className="h-10 w-10 mr-4" />
                <div>
                  <h1 className="text-2xl font-bold text-chang-brown-800">
                    Welcome back, {user.name}!
                  </h1>
                  <p className="text-chang-brown-600">
                    {user.role === 'admin' ? 'Administrator' : 'Chef'} Dashboard
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn-ghost text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="section-container">
          <div className="content-container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-4">
                  {user.chef?.avatar ? (
                    <img
                      src={user.chef.avatar}
                      alt={user.chef.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-chang-orange-100 flex items-center justify-center mr-4">
                      <span className="text-2xl font-bold text-chang-orange-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-chang-brown-800">
                      {user.chef?.name || user.name}
                    </h3>
                    <p className="text-chang-brown-600">{user.email}</p>
                  </div>
                </div>
                <Link 
                  href="/profile"
                  className="btn-secondary w-full text-center"
                >
                  Edit Profile
                </Link>
              </div>

              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-bold text-chang-brown-800 mb-6">
                  Quick Actions
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <Link
                    href="/admin/recipes/create"
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center mb-2">
                      <div className="p-2 bg-chang-orange-100 rounded-lg mr-3">
                        <svg className="w-6 h-6 text-chang-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-chang-brown-800 group-hover:text-chang-orange-600 transition-colors">
                        Add New Recipe
                      </h3>
                    </div>
                    <p className="text-sm text-chang-brown-600">
                      Share a delicious recipe with the community
                    </p>
                  </Link>

                  <Link
                    href="/recipes"
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-chang-brown-800 group-hover:text-blue-600 transition-colors">
                        Browse Recipes
                      </h3>
                    </div>
                    <p className="text-sm text-chang-brown-600">
                      Explore our collection of amazing recipes
                    </p>
                  </Link>

                  <Link
                    href="/my-recipes"
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center mb-2">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-chang-brown-800 group-hover:text-green-600 transition-colors">
                        My Recipes
                      </h3>
                    </div>
                    <p className="text-sm text-chang-brown-600">
                      Manage and edit your recipe collection
                    </p>
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      href="/invite-chef"
                      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-chang-brown-800 group-hover:text-purple-600 transition-colors">
                          Invite Chefs
                        </h3>
                      </div>
                      <p className="text-sm text-chang-brown-600">
                        Invite other chefs to join the platform
                      </p>
                    </Link>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-chang-brown-800 mb-4">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-chang-brown-600">
                      <div className="w-2 h-2 bg-chang-orange-500 rounded-full mr-3"></div>
                      Welcome to Chang Cookbook! Start by adding your first recipe.
                    </div>
                    <div className="flex items-center text-sm text-chang-brown-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Your chef profile has been created successfully.
                    </div>
                    <div className="flex items-center text-sm text-chang-brown-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Account registered and ready to use.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}