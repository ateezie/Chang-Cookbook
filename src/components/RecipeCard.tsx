import Link from 'next/link'
import { RecipeCardProps } from '@/types'
import RecipeImage from './RecipeImage'

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-chang-orange-100 text-chang-orange-700',
    hard: 'bg-chang-orange-100 text-chang-orange-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[difficulty as keyof typeof colors]}`}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  )
}


export default function RecipeCard({ recipe, className = '', featured = false }: RecipeCardProps) {
  const isListView = className.includes('sm:flex')
  const cardClasses = featured
    ? `recipe-card ${className} transform hover:scale-[1.02]`
    : `recipe-card ${className}`

  return (
    <Link href={`/recipes/${recipe.slug || recipe.id}`} className={cardClasses}>
      {/* Recipe Image */}
      <div className={`overflow-hidden relative ${isListView ? 'sm:w-48 sm:flex-shrink-0 aspect-video sm:aspect-square' : 'aspect-video'}`}>
        <RecipeImage
          src={recipe.image}
          alt={recipe.title}
          width={400}
          height={225}
          className="object-cover group-hover:scale-105 transition-transform duration-300 w-full h-full"
        />
        
        {/* Featured Badge */}
        {recipe.featured && (
          <div className="absolute top-3 right-3">
            <span className="bg-chang-orange-400 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
              Featured
            </span>
          </div>
        )}

        {/* Quick Info Overlay for Featured Cards */}
        {featured && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center text-white text-sm space-x-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{recipe.totalTime} min</span>
                </div>
                <DifficultyBadge difficulty={recipe.difficulty} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recipe Content */}
      <div className={`${featured ? 'p-8' : 'p-6'} ${isListView ? 'sm:flex-1 sm:flex sm:flex-col sm:justify-between' : ''}`}>
        <div>
          <h3 className={`font-heading font-semibold text-chang-brown-900 mb-2 group-hover:text-chang-orange-400 transition-colors duration-200 ${featured ? 'text-2xl' : isListView ? 'text-lg sm:text-xl' : 'text-xl'}`}>
            {recipe.title}
          </h3>
          
          <p className={`text-chang-brown-700 font-body mb-4 line-clamp-2 leading-relaxed ${featured ? 'text-base' : 'text-sm'}`}>
            {recipe.description}
          </p>

          {/* Recipe Metadata */}
          <div className="flex items-center justify-between text-xs text-chang-brown-600 mb-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{recipe.totalTime} min</span>
              </div>
              <DifficultyBadge difficulty={recipe.difficulty} />
            </div>
          </div>
        </div>

        {/* Chef Info */}
        <div className="flex items-center pt-3 border-t border-chang-neutral-200 mt-auto">
          <div className="flex items-center text-xs text-chang-brown-600 font-body">
            <RecipeImage
              src={recipe.chef.avatar}
              alt={recipe.chef.name}
              width={24}
              height={24}
              className="rounded-full mr-2 border border-chang-neutral-200"
            />
            <span>{recipe.chef.name}</span>
          </div>
        </div>

        {/* Tags (for featured cards) */}
        {featured && recipe.tags.slice(0, 3).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-chang-orange-100 text-chang-orange-700 rounded-full text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}