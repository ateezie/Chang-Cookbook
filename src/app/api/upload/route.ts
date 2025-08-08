import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import { existsSync, mkdirSync } from 'fs'
import path from 'path'

// Ensure upload directories exist
function ensureUploadDirs() {
  const dirs = [
    './public/images/recipes',
    './public/images/chefs'
  ]
  
  dirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
  })
}

// POST /api/upload - Upload images (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const adminUser = await authenticateAdmin(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'recipe' or 'chef'

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (!type || !['recipe', 'chef'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid upload type. Must be "recipe" or "chef"' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG and WebP images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB for recipes, 2MB for chefs)
    const maxSize = type === 'recipe' ? 5 * 1024 * 1024 : 2 * 1024 * 1024
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      return NextResponse.json(
        { error: `File size exceeds ${maxSizeMB}MB limit` },
        { status: 400 }
      )
    }

    // Ensure directories exist
    ensureUploadDirs()

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '')
    const extension = path.extname(sanitizedName)
    const baseName = path.basename(sanitizedName, extension)
    const fileName = `${type}-${uniqueSuffix}-${baseName}${extension}`

    // Determine upload path
    const uploadDir = `./public/images/${type === 'recipe' ? 'recipes' : 'chefs'}`
    const filePath = path.join(uploadDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return the URL path (not file system path)
    const imageUrl = `/images/${type === 'recipe' ? 'recipes' : 'chefs'}/${fileName}`

    return NextResponse.json({
      message: 'File uploaded successfully',
      filename: fileName,
      path: imageUrl,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/upload - List uploaded files (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const adminUser = await authenticateAdmin(request)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'recipe' or 'chef'

    if (type && !['recipe', 'chef'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type parameter. Must be "recipe" or "chef"' },
        { status: 400 }
      )
    }

    const fs = await import('fs/promises')
    const files: { name: string; path: string; type: string }[] = []

    const directories = type ? 
      [{ dir: `./public/images/${type === 'recipe' ? 'recipes' : 'chefs'}`, type }] :
      [
        { dir: './public/images/recipes', type: 'recipe' },
        { dir: './public/images/chefs', type: 'chef' }
      ]

    for (const { dir, type: dirType } of directories) {
      try {
        if (existsSync(dir)) {
          const dirFiles = await fs.readdir(dir)
          
          for (const file of dirFiles) {
            const isImage = /\.(jpg|jpeg|png|webp)$/i.test(file)
            if (isImage) {
              files.push({
                name: file,
                path: `/images/${dirType === 'recipe' ? 'recipes' : 'chefs'}/${file}`,
                type: dirType
              })
            }
          }
        }
      } catch (error) {
        console.error(`Error reading directory ${dir}:`, error)
      }
    }

    // Sort by filename (newest first based on timestamp in filename)
    files.sort((a, b) => b.name.localeCompare(a.name))

    return NextResponse.json({ files })

  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}