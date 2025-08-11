'use client'

import { Suspense } from 'react'
import NextDynamic from 'next/dynamic'

// Dynamically import the login component with SSR disabled to prevent build issues
const LoginComponent = NextDynamic(() => import('./login-page'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-chang-orange-500"></div>
    </div>
  )
})

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-chang-orange-500"></div>
      </div>
    }>
      <LoginComponent />
    </Suspense>
  )
}