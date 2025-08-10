import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// MIME type mapping for common image formats
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', 
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruct the file path from the dynamic route
    const filePath = params.path.join('/')
    const fullPath = path.join(process.cwd(), 'public', 'images', filePath)
    
    // Security check - prevent directory traversal
    const publicImagesPath = path.join(process.cwd(), 'public', 'images')
    const resolvedPath = path.resolve(fullPath)
    const resolvedPublicPath = path.resolve(publicImagesPath)
    
    if (!resolvedPath.startsWith(resolvedPublicPath)) {
      console.log('Security: Path traversal attempt blocked:', filePath)
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    // Check if file exists
    try {
      await fs.access(fullPath)
    } catch {
      console.log('File not found:', fullPath)
      return new NextResponse('Not Found', { status: 404 })
    }
    
    // Get file extension and determine MIME type
    const ext = path.extname(fullPath).toLowerCase()
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream'
    
    // Read file content
    const fileBuffer = await fs.readFile(fullPath)
    
    // Set appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', mimeType)
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')
    headers.set('Content-Length', fileBuffer.length.toString())
    
    console.log(`Serving static file: ${filePath} (${mimeType}, ${fileBuffer.length} bytes)`)
    
    return new Response(new Uint8Array(fileBuffer), { headers })
    
  } catch (error) {
    console.error('Error serving static file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}