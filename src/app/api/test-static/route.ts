import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Try to read a static file directly and serve it
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo', 'chang-logo.svg')
    
    // Check if file exists
    const fileExists = await fs.access(logoPath).then(() => true).catch(() => false)
    
    if (!fileExists) {
      return NextResponse.json({
        error: 'File not found',
        path: logoPath,
        cwd: process.cwd()
      }, { status: 404 })
    }
    
    // Read the file content
    const fileContent = await fs.readFile(logoPath, 'utf-8')
    
    // Return as SVG
    return new Response(fileContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000'
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to serve static file',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}