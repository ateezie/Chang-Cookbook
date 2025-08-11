'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Temporary simple redirect to prevent build issues during PostgreSQL migration
export default function RegisterPage() {
  const router = useRouter()
  
  useEffect(() => {
    // For now, redirect to home page
    router.push('/')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-chang-orange-500 mx-auto mb-4"></div>
        <p className="text-chang-brown-600">Redirecting...</p>
      </div>
    </div>
  )
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'