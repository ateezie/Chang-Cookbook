import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Debug endpoint to check if assets are properly available
export async function GET() {
  try {
    const publicPath = path.join(process.cwd(), 'public')
    
    // Check if public directory exists
    const publicExists = await fs.access(publicPath).then(() => true).catch(() => false)
    
    if (!publicExists) {
      return NextResponse.json({
        error: 'Public directory not found',
        publicPath,
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }
    
    // Check logo files
    const logoPath = path.join(publicPath, 'images', 'logo')
    const logoFiles = await fs.readdir(logoPath).catch(() => [])
    
    // Check OG files  
    const ogPath = path.join(publicPath, 'images', 'og')
    const ogFiles = await fs.readdir(ogPath).catch(() => [])
    
    // Check if specific files exist
    const criticalFiles = [
      'images/logo/chang-logo.svg',
      'images/logo/chang-logo.png', 
      'images/logo/chang-logo-small.png',
      'images/logo/chang-logo-favicon.png',
      'images/og/default.svg',
      'images/og/default.jpg'
    ]
    
    const fileStatus: Record<string, { exists: boolean; size?: number; modified?: string }> = {}
    for (const file of criticalFiles) {
      const filePath = path.join(publicPath, file)
      try {
        const stats = await fs.stat(filePath)
        fileStatus[file] = {
          exists: true,
          size: stats.size,
          modified: stats.mtime.toISOString()
        }
      } catch {
        fileStatus[file] = { exists: false }
      }
    }
    
    // Check working directory and server structure
    const workingDir = process.cwd()
    const serverStructure: string[] = await fs.readdir(workingDir).catch(() => [])
    
    return NextResponse.json({
      status: 'success',
      server: {
        workingDirectory: workingDir,
        filesInRoot: serverStructure,
        hasServerJs: serverStructure.includes('server.js'),
        hasPublicDir: serverStructure.includes('public')
      },
      public: {
        path: publicPath,
        exists: publicExists
      },
      logo: {
        path: logoPath,
        files: logoFiles
      },
      og: {
        path: ogPath, 
        files: ogFiles
      },
      criticalFiles: fileStatus,
      timestamp: new Date().toISOString(),
      note: 'Server connectivity restored - debugging static files',
      environment: process.env.NODE_ENV,
      platform: process.platform
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check assets',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json({
    message: 'Use GET to check asset status'
  }, { status: 405 })
}