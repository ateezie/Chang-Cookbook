'use client'

import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import Layout from '@/components/Layout'
import ChangLogo from '@/components/ChangLogo'

interface Invitation {
  email: string
  invitedBy: {
    name: string
    email: string
  }
  expiresAt: string
}

interface FormErrors {
  name?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function InviteAcceptPage() {
  const router = useRouter()
  const params = useParams()
  const token = params?.token as string

  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState(false)
  const [expired, setExpired] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const response = await fetch(`/api/invitations/${token}`)
        const data = await response.json()

        if (response.ok) {
          setInvitation(data.invitation)
        } else {
          if (response.status === 410) {
            setExpired(true)
          } else {
            setErrors({ general: data.error || 'Invalid invitation' })
          }
        }
      } catch (error) {
        console.error('Error fetching invitation:', error)
        setErrors({ general: 'Network error. Please try again.' })
      }

      setLoading(false)
    }

    fetchInvitation()
  }, [token, router])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    // Client-side validation
    const newErrors: FormErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch(`/api/invitations/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/login?message=account_created')
        }, 3000)
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
          setErrors({ general: data.error || 'Failed to create account' })
        }
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
    }

    setSubmitting(false)
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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-chang-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <ChangLogo className="mx-auto h-16 w-16 animate-pulse" />
            <p className="text-chang-brown-600">Verifying invitation...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (expired) {
    return (
      <Layout>
        <div className="min-h-screen bg-chang-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <ChangLogo className="mx-auto h-16 w-16 mb-4" />
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center justify-center mb-4">
                  <svg className="h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-red-800 mb-2">
                  Invitation Expired
                </h2>
                <p className="text-red-700 mb-4">
                  This invitation has expired or is no longer valid.
                </p>
                <div className="flex flex-col space-y-2">
                  <Link 
                    href="/register" 
                    className="btn-primary text-center"
                  >
                    Create Account
                  </Link>
                  <Link 
                    href="/login" 
                    className="btn-ghost text-center"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (success) {
    return (
      <Layout>
        <div className="min-h-screen bg-chang-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <ChangLogo className="mx-auto h-16 w-16 mb-4" />
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-center mb-4">
                  <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-green-800 mb-2">
                  Welcome to Chang Cookbook!
                </h2>
                <p className="text-green-700 mb-4">
                  Your chef account has been created successfully.
                </p>
                <p className="text-sm text-green-600">
                  Redirecting to login page...
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (errors.general && !invitation) {
    return (
      <Layout>
        <div className="min-h-screen bg-chang-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <ChangLogo className="mx-auto h-16 w-16 mb-4" />
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-red-800 mb-2">
                  Invalid Invitation
                </h2>
                <p className="text-red-700 mb-4">{errors.general}</p>
                <div className="flex flex-col space-y-2">
                  <Link 
                    href="/register" 
                    className="btn-primary text-center"
                  >
                    Create Account
                  </Link>
                  <Link 
                    href="/login" 
                    className="btn-ghost text-center"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!invitation) {
    return null
  }

  return (
    <Layout>
      <div className="min-h-screen bg-chang-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <ChangLogo className="mx-auto h-16 w-16 mb-4" />
            <h2 className="text-3xl font-bold text-chang-brown-800">
              Join Chang Cookbook
            </h2>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                <strong>{invitation.invitedBy.name}</strong> has invited you to join as a chef!
              </p>
              <p className="text-blue-600 text-sm mt-1">
                Create your account for: <strong>{invitation.email}</strong>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-chang-brown-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500 ${
                    errors.name ? 'border-red-300' : 'border-chang-neutral-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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
                  placeholder="Create a password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-chang-brown-500">
                  Must be at least 6 characters long
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-chang-brown-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-chang-neutral-300'
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Accept Invitation & Create Account'
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-chang-brown-600">
                  Already have an account?{' '}
                  <Link 
                    href="/login" 
                    className="font-medium text-chang-orange-600 hover:text-chang-orange-500 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>

          <div className="text-center">
            <p className="text-xs text-chang-brown-500">
              This invitation expires on{' '}
              {new Date(invitation.expiresAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}