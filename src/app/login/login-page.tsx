'use client'

import { useState, FormEvent, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Layout from '@/components/Layout'
import ChangLogo from '@/components/ChangLogo'

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginPageComponent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [successMessage, setSuccessMessage] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  useEffect(() => {
    // Check for success messages from URL params
    const message = searchParams.get('message')
    if (message === 'registration_success') {
      setSuccessMessage('Account created successfully! Please sign in.')
    }
  }, [searchParams])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Client-side validation
    const newErrors: FormErrors = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store the token in localStorage
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Redirect to dashboard or intended page
        const redirectTo = searchParams.get('redirect') || '/dashboard'
        router.push(redirectTo)
      } else {
        if (data.details) {
          // Handle validation errors from server
          const serverErrors: FormErrors = {}
          data.details.forEach((error: any) => {
            if (error.path.length > 0) {
              serverErrors[error.path[0] as keyof FormErrors] = error.message
            }
          })
          setErrors(serverErrors)
        } else {
          setErrors({ general: data.error || 'Login failed' })
        }
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
    }

    setLoading(false)
  }

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-chang-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <ChangLogo className="mx-auto h-16 w-16 mb-4" />
            <h2 className="text-3xl font-bold text-chang-brown-800">
              Welcome Back
            </h2>
            <p className="mt-2 text-chang-brown-600">
              Sign in to your Chang Cookbook account
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-600 text-sm">{successMessage}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-chang-brown-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500 ${
                    errors.email ? 'border-red-300' : 'border-chang-neutral-300'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-chang-brown-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500 ${
                    errors.password ? 'border-red-300' : 'border-chang-neutral-300'
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-chang-orange-600 border-chang-neutral-300 rounded focus:ring-chang-orange-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-chang-brown-600">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link 
                    href="/forgot-password" 
                    className="font-medium text-chang-orange-600 hover:text-chang-orange-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-chang-brown-600">
                  Don't have an account?{' '}
                  <Link 
                    href="/register" 
                    className="font-medium text-chang-orange-600 hover:text-chang-orange-500 transition-colors"
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <div className="text-center">
            <p className="text-xs text-chang-brown-500">
              Join our community of passionate chefs and food lovers.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}