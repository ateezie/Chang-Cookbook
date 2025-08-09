'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ChangLogo from '@/components/ChangLogo'

interface MigrationStatus {
  status: 'idle' | 'validating' | 'migrating' | 'completed' | 'error'
  message: string
  progress?: {
    current: number
    total: number
    currentItem?: string
  }
  results?: {
    recipes: number
    categories: number
    chefs: number
    skipped: number
    errors: string[]
  }
}

export default function MigratePage() {
  const router = useRouter()
  const [jsonFile, setJsonFile] = useState<File | null>(null)
  const [jsonPreview, setJsonPreview] = useState<any>(null)
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    status: 'idle',
    message: 'Ready to migrate JSON data'
  })

  // Check admin authentication
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }
  }, [router])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      setMigrationStatus({
        status: 'error',
        message: 'Please select a JSON file'
      })
      return
    }

    setJsonFile(file)
    setMigrationStatus({
      status: 'validating',
      message: 'Reading and validating JSON file...'
    })

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      // Basic validation
      if (!data.recipes || !Array.isArray(data.recipes)) {
        throw new Error('Invalid JSON format: missing recipes array')
      }

      if (!data.categories || !Array.isArray(data.categories)) {
        throw new Error('Invalid JSON format: missing categories array')
      }

      setJsonPreview(data)
      setMigrationStatus({
        status: 'idle',
        message: `Ready to migrate ${data.recipes.length} recipes and ${data.categories.length} categories`
      })

    } catch (error) {
      setMigrationStatus({
        status: 'error',
        message: `JSON validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
      setJsonFile(null)
      setJsonPreview(null)
    }
  }

  const handleMigrate = async () => {
    if (!jsonFile || !jsonPreview) return

    setMigrationStatus({
      status: 'migrating',
      message: 'Starting migration...',
      progress: { current: 0, total: jsonPreview.recipes.length }
    })

    try {
      const token = localStorage.getItem('admin_token')
      const formData = new FormData()
      formData.append('jsonFile', jsonFile)

      const response = await fetch('/api/admin/migrate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setMigrationStatus({
          status: 'completed',
          message: 'Migration completed successfully!',
          results: result.results
        })
      } else {
        setMigrationStatus({
          status: 'error',
          message: result.error || 'Migration failed'
        })
      }

    } catch (error) {
      setMigrationStatus({
        status: 'error',
        message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  const resetMigration = () => {
    setJsonFile(null)
    setJsonPreview(null)
    setMigrationStatus({
      status: 'idle',
      message: 'Ready to migrate JSON data'
    })
  }

  const getStatusColor = () => {
    switch (migrationStatus.status) {
      case 'completed': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'migrating': case 'validating': return 'text-blue-600'
      default: return 'text-chang-brown-700'
    }
  }

  const getStatusIcon = () => {
    switch (migrationStatus.status) {
      case 'completed': return '✅'
      case 'error': return '❌'
      case 'migrating': case 'validating': return '⏳'
      default: return '📄'
    }
  }

  return (
    <div className="min-h-screen bg-chang-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-chang-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ChangLogo className="h-8 w-8 mr-3" />
              <h1 className="text-xl font-bold text-chang-brown-800">
                Migrate JSON Data
              </h1>
            </div>
            <Link
              href="/admin/dashboard"
              className="text-sm text-chang-brown-600 hover:text-chang-brown-700"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium text-blue-900 mb-2">📋 Migration Instructions</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload a JSON file containing recipes and categories data</li>
            <li>• The system will validate the format before migration</li>
            <li>• Existing recipes with the same ID will be skipped</li>
            <li>• New recipes will be added to the database</li>
            <li>• This process cannot be undone - ensure you have a backup</li>
          </ul>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-3">{getStatusIcon()}</span>
            <div>
              <h2 className="text-lg font-medium text-chang-brown-800">Migration Status</h2>
              <p className={`text-sm ${getStatusColor()}`}>{migrationStatus.message}</p>
            </div>
          </div>

          {/* Progress Bar */}
          {migrationStatus.progress && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-chang-brown-600 mb-2">
                <span>Progress: {migrationStatus.progress.current} / {migrationStatus.progress.total}</span>
                <span>{Math.round((migrationStatus.progress.current / migrationStatus.progress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-chang-neutral-200 rounded-full h-2">
                <div 
                  className="bg-chang-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(migrationStatus.progress.current / migrationStatus.progress.total) * 100}%` }}
                ></div>
              </div>
              {migrationStatus.progress.currentItem && (
                <p className="text-xs text-chang-brown-500 mt-1">
                  Current: {migrationStatus.progress.currentItem}
                </p>
              )}
            </div>
          )}

          {/* Migration Results */}
          {migrationStatus.results && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">Migration Results</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-green-700 font-medium">Recipes:</span>
                  <span className="ml-1 text-green-800">{migrationStatus.results.recipes}</span>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Categories:</span>
                  <span className="ml-1 text-green-800">{migrationStatus.results.categories}</span>
                </div>
                <div>
                  <span className="text-green-700 font-medium">Chefs:</span>
                  <span className="ml-1 text-green-800">{migrationStatus.results.chefs}</span>
                </div>
                <div>
                  <span className="text-yellow-700 font-medium">Skipped:</span>
                  <span className="ml-1 text-yellow-800">{migrationStatus.results.skipped}</span>
                </div>
              </div>
              {migrationStatus.results.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-red-700 font-medium text-sm mb-1">Errors:</p>
                  <ul className="text-xs text-red-600 space-y-1">
                    {migrationStatus.results.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-chang-brown-800 mb-4">Upload JSON File</h2>
          
          <div className="border-2 border-dashed border-chang-neutral-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
              id="json-file-input"
              disabled={migrationStatus.status === 'migrating' || migrationStatus.status === 'validating'}
            />
            
            <label 
              htmlFor="json-file-input" 
              className={`cursor-pointer ${migrationStatus.status === 'migrating' || migrationStatus.status === 'validating' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-6xl mb-4">📁</div>
              <p className="text-lg font-medium text-chang-brown-800 mb-2">
                {jsonFile ? jsonFile.name : 'Choose JSON file'}
              </p>
              <p className="text-sm text-chang-brown-600">
                {jsonFile ? `${(jsonFile.size / 1024).toFixed(1)} KB` : 'Click to select or drag and drop'}
              </p>
            </label>
          </div>
        </div>

        {/* JSON Preview */}
        {jsonPreview && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-chang-brown-800 mb-4">JSON Preview</h2>
            <div className="bg-chang-neutral-50 rounded-lg p-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-chang-orange-600">{jsonPreview.recipes?.length || 0}</div>
                  <div className="text-chang-brown-600">Recipes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-chang-orange-600">{jsonPreview.categories?.length || 0}</div>
                  <div className="text-chang-brown-600">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-chang-orange-600">
                    {new Set(jsonPreview.recipes?.map((r: any) => r.chef?.name).filter(Boolean)).size || 0}
                  </div>
                  <div className="text-chang-brown-600">Unique Chefs</div>
                </div>
              </div>
              
              {/* Sample Recipe Preview */}
              {jsonPreview.recipes?.[0] && (
                <div className="border-t border-chang-neutral-200 pt-4">
                  <h3 className="font-medium text-chang-brown-700 mb-2">Sample Recipe:</h3>
                  <div className="font-mono text-xs bg-white p-3 rounded border overflow-x-auto">
                    <pre>{JSON.stringify(jsonPreview.recipes[0], null, 2).substring(0, 500)}...</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          {migrationStatus.status === 'completed' && (
            <button
              onClick={resetMigration}
              className="px-4 py-2 text-chang-brown-600 border border-chang-brown-300 rounded-md hover:bg-chang-brown-50"
            >
              Migrate Another File
            </button>
          )}
          
          <button
            onClick={handleMigrate}
            disabled={!jsonPreview || migrationStatus.status === 'migrating' || migrationStatus.status === 'validating' || migrationStatus.status === 'completed'}
            className="px-6 py-2 bg-chang-orange-600 text-white rounded-md hover:bg-chang-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {migrationStatus.status === 'migrating' ? 'Migrating...' : 'Start Migration'}
          </button>
        </div>
      </main>
    </div>
  )
}