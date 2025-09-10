import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// POST /api/upload - Upload images to Cloudinary (Admin only)
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
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.' },
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

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: `chang-cookbook/${type}s`, // recipes or chefs folder
          format: 'webp', // Convert to WebP for better compression
          quality: 'auto:good', // Automatic quality optimization
          fetch_format: 'auto', // Automatic format selection
          transformation: [
            {
              width: type === 'recipe' ? 800 : 400, // Recipe images larger than chef avatars
              height: type === 'recipe' ? 600 : 400,
              crop: 'fill',
              gravity: 'center',
              quality: 'auto:good'
            }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    const result = uploadResult as any

    console.log('Image uploaded to Cloudinary:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height
    })

    return NextResponse.json({
      message: 'Image uploaded successfully to Cloudinary',
      filename: result.public_id,
      path: result.secure_url,
      size: result.bytes,
      type: result.format,
      width: result.width,
      height: result.height,
      cloudinary_id: result.public_id
    })

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

// GET /api/upload - List uploaded images from Cloudinary (Admin only)
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

    // Get images from Cloudinary
    const folder = type ? `chang-cookbook/${type}s` : 'chang-cookbook'
    const result = await cloudinary.search
      .expression(`folder:${folder}/*`)
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute()

    const files = result.resources.map((resource: any) => ({
      name: resource.public_id.split('/').pop(),
      path: resource.secure_url,
      type: resource.public_id.includes('/recipes/') ? 'recipe' : 'chef',
      cloudinary_id: resource.public_id,
      created_at: resource.created_at,
      bytes: resource.bytes,
      width: resource.width,
      height: resource.height
    }))

    return NextResponse.json({ files })

  } catch (error) {
    console.error('Error listing Cloudinary images:', error)
    return NextResponse.json(
      { error: 'Failed to list images' },
      { status: 500 }
    )
  }
}