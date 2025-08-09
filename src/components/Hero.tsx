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
  description = "Simple to Medium difficulty recipes that I've sourced from family and friends. Join me in exploring the world of cooking with these delicious recipes.",
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
  const recipeRating = featuredRecipe?.rating || 4.5
  const recipeLink = featuredRecipe ? `/recipes/${featuredRecipe.id}` : "/recipes"
  
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
                      <div className="flex items-center text-yellow-500">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-xs lg:text-sm font-medium text-chang-brown-900">{recipeRating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-8 sm:h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            opacity=".25" 
            className="fill-white"
          />
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            opacity=".5" 
            className="fill-white"
          />
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            className="fill-white"
          />
        </svg>
      </div>
    </section>
  )
}