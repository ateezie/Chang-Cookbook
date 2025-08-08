import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { NextRequest } from 'next/server'

// Ensure upload directories exist
export function ensureUploadDirs() {
  const dirs = [
    './public/images/recipes',
    './public/images/chefs'
  ]
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

// Configure multer for recipe images
const recipeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDirs()
    cb(null, './public/images/recipes')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '')
    cb(null, `recipe-${uniqueSuffix}-${sanitizedName}`)
  }
})

// Configure multer for chef avatars
const chefStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDirs()
    cb(null, './public/images/chefs')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '')
    cb(null, `chef-${uniqueSuffix}-${sanitizedName}`)
  }
})

// File filter to allow only images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'))
  }
}

// Multer configurations
export const recipeImageUpload = multer({
  storage: recipeStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter
})

export const chefAvatarUpload = multer({
  storage: chefStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter
})

// Helper to convert file path to URL
export function filePathToUrl(filePath: string): string {
  return filePath.replace('./public', '').replace(/\\/g, '/')
}

// Helper to delete uploaded file
export function deleteUploadedFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (error) {
    console.error('Error deleting file:', error)
  }
}

// Middleware wrapper for Next.js API routes
export function runMiddleware(req: any, res: any, fn: any): Promise<any> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}