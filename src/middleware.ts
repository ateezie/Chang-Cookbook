import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle static image requests by ensuring they're routed correctly
  if (request.nextUrl.pathname.startsWith('/images/')) {
    // Log the request for debugging
    console.log('Static image request:', request.nextUrl.pathname)
    
    // Let Next.js handle it normally, but ensure proper headers
    const response = NextResponse.next()
    
    // Add cache headers for images
    if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|svg|gif|webp)$/i)) {
      response.headers.set('Cache-Control', 'public, max-age=31536000')
    }
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/images/:path*',
  ]
}