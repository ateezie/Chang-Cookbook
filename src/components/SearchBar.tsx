'use client'

import { useState, KeyboardEvent } from 'react'
import { SearchBarProps } from '@/types'

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search recipes, ingredients...',
  className = '',
  autoFocus = false
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(value)
    }
  }

  const handleClear = () => {
    onChange('')
  }

  const handleSubmit = () => {
    if (onSubmit && value.trim()) {
      onSubmit(value)
    }
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Search Icon */}
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
        <svg 
          className="w-5 h-5 text-chang-neutral-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`
          search-input font-body
          ${isFocused ? 'ring-2 ring-chang-orange-400 border-chang-orange-400' : ''}
          ${value ? 'pr-20' : 'pr-4'}
        `}
        aria-label={placeholder}
      />

      {/* Clear and Submit Buttons */}
      {value && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="p-1 text-chang-neutral-500 hover:text-chang-brown-700 transition-colors duration-200 rounded"
            aria-label="Clear search"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Submit Button */}
          {onSubmit && (
            <button
              onClick={handleSubmit}
              className="p-1 text-chang-orange-400 hover:text-chang-orange-600 transition-colors duration-200 rounded"
              aria-label="Search"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}