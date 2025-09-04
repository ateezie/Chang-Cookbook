import Link from 'next/link'
import Image from 'next/image'
import { Recipe } from '@/types'

interface HeroProps {
  title?: string
  subtitle?: string
  description?: string
  primaryButtonText?: string
  primaryButtonHref?: string
  secondaryButtonText?: string
  secondaryButtonHref?: string
  backgroundImage?: string
  className?: string
  featuredRecipe?: Recipe
}

export default function Hero({
  title = "Cook with me and",
  subtitle = "\"Chang Your Life\"",
  description = "This serves as a repository of my favorite recipes that I've enjoyed cooking and sharing with friends.  My vision is to invite other chefs to contribute their own recipes, creating a collaborative space where we can all learn and grow together in our culinary journeys!",
  primaryButtonText = "Start Cooking",
  primaryButtonHref = "/recipes",
  secondaryButtonText = "Browse Recipes",
  secondaryButtonHref = "/recipes",
  backgroundImage = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
  className = "",
  featuredRecipe
}: HeroProps) {
  
  // Use featured recipe data if provided
  const heroImage = featuredRecipe?.image || backgroundImage
  const recipeName = featuredRecipe?.title || "Featured Recipe"
  const recipeLink = featuredRecipe ? `/recipes/${featuredRecipe.slug}` : "/recipes"
  
  // Hero section redesigned with cleaner bottom edge (wave SVG removed)
  
  // Check if this is a locally uploaded image
  const isLocalUpload = heroImage.startsWith('/images/recipes/') || heroImage.startsWith('/images/chefs/')
  return (
    <section className={`relative bg-gradient-to-r from-chang-orange-50 to-chang-orange-100 overflow-hidden ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
          <defs>
            <pattern id="hero-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-pattern)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="text-center lg:text-left animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-chang-brown-900 leading-tight mb-6">
              {title}
              <span className="text-chang-orange-400 block">{subtitle}</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-chang-brown-700 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {description}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                href={secondaryButtonHref}
                className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center"
              >
                {secondaryButtonText}
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-slide-up">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={heroImage}
                alt={featuredRecipe ? `${recipeName} - Featured Recipe` : "Delicious food spread"}
                width={600}
                height={400}
                className="w-full h-auto object-cover aspect-video"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                // Disable optimization for local uploads to prevent Next.js image optimization errors
                unoptimized={isLocalUpload}
              />
              
              {/* Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              
              {/* Floating Recipe Card */}
              <div className="absolute bottom-4 left-4 right-4 lg:bottom-6 lg:left-6 lg:right-6">
                <Link href={recipeLink} className="block">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:bg-white/95 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-heading font-semibold text-chang-brown-900 text-sm lg:text-base">
                          Featured Recipe
                        </h3>
                        <p className="text-chang-brown-700 text-xs lg:text-sm font-body">
                          {recipeName}
                        </p>
                        {featuredRecipe && (
                          <p className="text-chang-orange-600 text-xs font-body mt-1">
                            {featuredRecipe.prepTime + featuredRecipe.cookTime} min • {featuredRecipe.difficulty}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center text-chang-orange-600">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="ml-1 text-xs lg:text-sm font-medium text-chang-brown-900">Featured</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

    </section>
  )
}