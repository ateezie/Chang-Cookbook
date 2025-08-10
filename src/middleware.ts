import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // In standalone mode, Next.js handles static files automatically
  // Don't intercept static file requests - let Next.js handle them natively
  
  // Only handle non-static requests for now
  if (!request.nextUrl.pathname.startsWith('/images/') && 
      !request.nextUrl.pathname.startsWith('/_next/') &&
      !request.nextUrl.pathname.startsWith('/favicon')) {
    
    const response = NextResponse.next()
    
    // Add security headers for non-static requests
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    
    return response
  }
  
  // For static files, let Next.js handle them completely
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ]
}