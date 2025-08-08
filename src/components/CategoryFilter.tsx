'use client'

import { CategoryFilterProps } from '@/types'

export default function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  className = ''
}: CategoryFilterProps) {
  const allCategory = {
    id: 'all',
    name: 'All Recipes',
    description: 'All available recipes',
    emoji: '🍽️',
    count: categories.reduce((total, cat) => total + cat.count, 0)
  }

  const allCategories = [allCategory, ...categories]

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {allCategories.map((category) => {
        const isActive = activeCategory === category.id
        const buttonClass = isActive ? 'filter-active' : 'filter-inactive'

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`${buttonClass} flex items-center space-x-2 hover:scale-105 transform transition-all duration-200`}
            aria-pressed={isActive}
            aria-label={`Filter by ${category.name}`}
          >
            <span className="text-base" role="img" aria-label={category.name}>
              {category.emoji}
            </span>
            <span>{category.name}</span>
            <span className="text-xs opacity-75">
              ({category.count})
            </span>
          </button>
        )
      })}
    </div>
  )
}

// Alternative compact version for mobile
export function CompactCategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
  className = ''
}: CategoryFilterProps) {
  const allCategory = {
    id: 'all',
    name: 'All',
    emoji: '🍽️',
    count: categories.reduce((total, cat) => total + cat.count, 0)
  }

  const allCategories = [allCategory, ...categories]

  return (
    <div className={`flex overflow-x-auto space-x-2 pb-2 ${className}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {allCategories.map((category) => {
        const isActive = activeCategory === category.id
        const buttonClass = isActive 
          ? 'bg-chang-orange-400 text-white shadow-md shadow-chang-orange-400/20' 
          : 'bg-chang-neutral-200 text-chang-brown-800 hover:bg-chang-neutral-300'

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`${buttonClass} flex items-center space-x-1 px-3 py-2 rounded-full text-sm font-medium font-body transition-colors duration-200 whitespace-nowrap flex-shrink-0`}
            aria-pressed={isActive}
            aria-label={`Filter by ${category.name}`}
          >
            <span className="text-sm" role="img" aria-label={category.name}>
              {category.emoji}
            </span>
            <span>{category.name}</span>
          </button>
        )
      })}
    </div>
  )
}