import { Metadata } from 'next'
import { Recipe, Category } from '@/types'

const siteConfig = {
  name: 'Chang Cookbook',
  description: 'Discover delicious recipes for every occasion. From quick weeknight dinners to special treats, find your next favorite dish with our tested and loved recipes.',
  url: 'http://localhost:3000',
  ogImage: '/og-image.jpg',
  creator: '@changcookbook',
  keywords: ['recipes', 'cooking', 'food', 'dinner', 'desserts', 'healthy', 'quick meals', 'italian', 'asian', 'mediterranean']
}

export function generateSiteMetadata(): Metadata {
  return {
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: 'Chang Cookbook Team' }],
    creator: 'Chang Cookbook',
    publisher: 'Chang Cookbook',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: '/'
    },
    icons: {
      icon: [
        { url: '/images/logo/chang-logo-favicon.png', sizes: '32x32' },
        { url: '/images/logo/chang-logo.svg', type: 'image/svg+xml' }
      ],
      shortcut: '/images/logo/chang-logo-favicon.png',
      apple: [
        { url: '/images/logo/chang-logo.png', sizes: '180x180', type: 'image/png' }
      ],
      other: [
        {
          rel: 'mask-icon',
          url: '/images/logo/chang-logo.svg',
          color: '#ff9966'
        }
      ]
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: siteConfig.name,
      description: siteConfig.description,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} - Delicious Recipes`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.name,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
      creator: siteConfig.creator,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
      // Add other verification codes as needed
    }
  }
}

export function generateRecipeMetadata(recipe: Recipe): Metadata {
  const title = `${recipe.title} - ${siteConfig.name}`
  const description = recipe.description.length > 155 
    ? `${recipe.description.substring(0, 152)}...`
    : recipe.description
  
  const url = `${siteConfig.url}/recipes/${recipe.id}`
  
  return {
    title,
    description,
    keywords: [
      ...siteConfig.keywords,
      recipe.category,
      recipe.difficulty,
      ...recipe.tags,
      recipe.chef.name
    ],
    alternates: {
      canonical: `/recipes/${recipe.id}`
    },
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: recipe.image,
          width: 1200,
          height: 630,
          alt: `${recipe.title} - Recipe Image`,
        },
      ],
      authors: [recipe.chef.name],
      publishedTime: recipe.createdAt,
      section: 'Recipe',
      tags: recipe.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [recipe.image],
      creator: siteConfig.creator,
    },
    // Recipe-specific structured data
    other: {
      // JSON-LD structured data for recipes
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: recipe.title,
        description: recipe.description,
        image: recipe.image,
        author: {
          '@type': 'Person',
          name: recipe.chef.name,
          image: recipe.chef.avatar
        },
        datePublished: recipe.createdAt,
        prepTime: `PT${recipe.prepTime}M`,
        cookTime: `PT${recipe.cookTime}M`,
        totalTime: `PT${recipe.totalTime}M`,
        recipeYield: recipe.servings.toString(),
        recipeCategory: recipe.category,
        recipeCuisine: recipe.tags.find(tag => ['italian', 'asian', 'mexican', 'mediterranean'].includes(tag)) || 'International',
        difficulty: recipe.difficulty,
        keywords: recipe.tags.join(', '),
        nutrition: {
          '@type': 'NutritionInformation',
          calories: `${recipe.nutrition.calories} calories`,
          proteinContent: recipe.nutrition.protein,
          carbohydrateContent: recipe.nutrition.carbs,
          fatContent: recipe.nutrition.fat
        },
        recipeIngredient: recipe.ingredients.map(ing => `${ing.amount} ${ing.item}`),
        recipeInstructions: recipe.instructions.map((instruction, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          text: instruction
        })),
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: recipe.rating,
          reviewCount: recipe.reviewCount,
          bestRating: 5,
          worstRating: 1
        },
        video: recipe.tags.includes('video') ? {
          '@type': 'VideoObject',
          name: `How to make ${recipe.title}`,
          description: `Step-by-step video guide for making ${recipe.title}`,
          thumbnailUrl: recipe.image,
          contentUrl: `${siteConfig.url}/videos/${recipe.id}`,
          uploadDate: recipe.createdAt
        } : undefined
      })
    }
  }
}

export function generateRecipesPageMetadata(
  category?: string, 
  difficulty?: string,
  featured?: boolean
): Metadata {
  let title = 'All Recipes'
  let description = 'Browse our complete collection of delicious recipes.'
  
  if (featured) {
    title = 'Featured Recipes'
    description = 'Discover our most popular and highest-rated recipes, tested and loved by home cooks everywhere.'
  } else if (category && category !== 'all') {
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')
    title = `${categoryName} Recipes`
    description = `Delicious ${categoryName.toLowerCase()} recipes for every occasion.`
  }
  
  if (difficulty && difficulty !== 'all') {
    title += ` - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level`
    description += ` Perfect for ${difficulty} level cooks.`
  }
  
  const keywords = [
    ...siteConfig.keywords,
    ...(category ? [category] : []),
    ...(difficulty ? [difficulty] : []),
    ...(featured ? ['featured', 'popular'] : [])
  ]
  
  return {
    title: `${title} | ${siteConfig.name}`,
    description,
    keywords,
    alternates: {
      canonical: '/recipes'
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${siteConfig.url}/recipes`,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${title} - ${siteConfig.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [siteConfig.ogImage],
      creator: siteConfig.creator,
    },
  }
}

export function generateSearchMetadata(query?: string): Metadata {
  const title = query 
    ? `Search Results for "${query}"`
    : 'Search Recipes'
  
  const description = query
    ? `Find recipes matching "${query}". Search our complete collection of tested recipes.`
    : 'Search our complete collection of delicious recipes by name, ingredients, or cooking method.'
  
  return {
    title: `${title} | ${siteConfig.name}`,
    description,
    keywords: [
      ...siteConfig.keywords,
      'search',
      'find recipes',
      ...(query ? [query] : [])
    ],
    alternates: {
      canonical: '/search'
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${siteConfig.url}/search`,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${title} - ${siteConfig.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [siteConfig.ogImage],
      creator: siteConfig.creator,
    },
    robots: {
      index: !query, // Don't index specific search result pages
      follow: true
    }
  }
}

export function generateCategoryMetadata(category: Category): Metadata {
  const title = `${category.name} Recipes`
  const description = `${category.description} Browse ${category.count} delicious ${category.name.toLowerCase()} recipes.`
  
  return {
    title: `${title} | ${siteConfig.name}`,
    description,
    keywords: [
      ...siteConfig.keywords,
      category.name.toLowerCase(),
      category.id
    ],
    alternates: {
      canonical: `/categories/${category.id}`
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${siteConfig.url}/categories/${category.id}`,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${title} - ${siteConfig.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [siteConfig.ogImage],
      creator: siteConfig.creator,
    },
  }
}

// Utility function to generate breadcrumb structured data
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string, url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url
    }))
  }
}

export { siteConfig }