'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import ChangLogo from '@/components/ChangLogo'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface Invitation {
  id: string
  email: string
  status: string
  expiresAt: string
  createdAt: string
  invitedBy: {
    id: string
    name: string
    email: string
  }
  invitedUser?: {
    id: string
    name: string
    email: string
  }
  invitationLink?: string
}

interface FormErrors {
  email?: string
  general?: string
}

export default function InviteChefPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [success, setSuccess] = useState('')
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loadingInvitations, setLoadingInvitations] = useState(false)
  
  const [formData, setFormData] = useState({
    email: ''
  })

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('user')
      
      if (!token || !storedUser) {
        router.push('/login')
        return
      }

      const parsedUser = JSON.parse(storedUser)
      if (parsedUser.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      try {
        // Verify token is still valid
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.user.role !== 'admin') {
            router.push('/dashboard')
            return
          }
          setUser(data.user)
          fetchInvitations()
        } else {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          router.push('/login')
          return
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

  const fetchInvitations = async () => {
    setLoadingInvitations(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/invitations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setInvitations(data.invitations || [])
      }
    } catch (error) {
      console.error('Error fetching invitations:', error)
    }
    setLoadingInvitations(false)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    setSuccess('')

    // Client-side validation
    if (!formData.email.trim()) {
      setErrors({ email: 'Email is required' })
      setSubmitting(false)
      return
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Invalid email address' })
      setSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Invitation sent to ${formData.email}!`)
        setFormData({ email: '' })
        fetchInvitations() // Refresh the list
      } else {
        if (data.details) {
          const serverErrors: FormErrors = {}
          data.details.forEach((error: any) => {
            if (error.path.length > 0) {
              serverErrors[error.path[0] as keyof FormErrors] = error.message
            }
          })
          setErrors(serverErrors)
        } else {
          setErrors({ general: data.error || 'Failed to send invitation' })
        }
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' })
    }

    setSubmitting(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ email: e.target.value })
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }))
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      revoked: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors] || colors.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const copyInvitationLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setSuccess('Invitation link copied to clipboard!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-chang-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <ChangLogo className="h-16 w-16 mx-auto mb-4 animate-pulse" />
            <p className="text-chang-brown-600">Loading...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <Layout>
      <div className="min-h-screen bg-chang-neutral-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-chang-neutral-200">
          <div className="content-container">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <ChangLogo className="h-8 w-8 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-chang-brown-800">
                    Invite Chefs
                  </h1>
                  <p className="text-chang-brown-600">
                    Invite other chefs to join the platform
                  </p>
                </div>
              </div>
              <Link 
                href="/dashboard" 
                className="btn-ghost text-sm"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="section-container">
          <div className="content-container max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Invite Form */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-chang-brown-800 mb-4">
                  Send New Invitation
                </h2>

                {success && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-green-600 text-sm">{success}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-chang-orange-500 ${
                        errors.email ? 'border-red-300' : 'border-chang-neutral-300'
                      }`}
                      placeholder="chef@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Sending Invitation...
                      </div>
                    ) : (
                      'Send Invitation'
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-chang-neutral-200">
                  <h3 className="text-sm font-medium text-chang-brown-700 mb-2">
                    How it works:
                  </h3>
                  <ul className="text-sm text-chang-brown-600 space-y-1">
                    <li>• An invitation link will be generated</li>
                    <li>• The chef can use this link to create their account</li>
                    <li>• Invitations expire after 7 days</li>
                    <li>• You can revoke invitations if needed</li>
                  </ul>
                </div>
              </div>

              {/* Recent Invitations */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-chang-brown-800">
                    Recent Invitations
                  </h2>
                  {!loadingInvitations && (
                    <button
                      onClick={fetchInvitations}
                      className="text-sm text-chang-orange-600 hover:text-chang-orange-500"
                    >
                      Refresh
                    </button>
                  )}
                </div>

                {loadingInvitations ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-chang-orange-500 border-t-transparent mx-auto"></div>
                    <p className="text-chang-brown-600 mt-2">Loading invitations...</p>
                  </div>
                ) : invitations.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-chang-brown-500">No invitations sent yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {invitations.map((invitation) => (
                      <div key={invitation.id} className="border border-chang-neutral-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-chang-brown-800">
                              {invitation.email}
                            </p>
                            <p className="text-sm text-chang-brown-600">
                              Invited {new Date(invitation.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(invitation.status)}
                        </div>
                        
                        {invitation.status === 'accepted' && invitation.invitedUser && (
                          <p className="text-sm text-green-600 mb-2">
                            ✓ Joined as {invitation.invitedUser.name}
                          </p>
                        )}

                        {invitation.status === 'pending' && (
                          <div className="mt-2">
                            <p className="text-xs text-chang-brown-500 mb-2">
                              Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                            </p>
                            {invitation.invitationLink && (
                              <button
                                onClick={() => copyInvitationLink(invitation.invitationLink!)}
                                className="text-xs btn-ghost py-1 px-2"
                              >
                                📋 Copy Invitation Link
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}