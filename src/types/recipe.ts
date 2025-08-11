export interface Recipe {
  id: string
  title: string
  slug: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  prepTime: number // in minutes
  cookTime: number // in minutes
  totalTime: number // in minutes
  servings: number
  rating: number
  reviewCount: number
  image: string
  chef: Chef
  tags: string[]
  ingredients: Ingredient[]
  instructions: string[]
  equipment?: string[]
  notes?: string
  featured: boolean
  heroFeatured?: boolean
  createdAt: string
}

export interface Chef {
  name: string
  avatar: string
}

export interface Ingredient {
  item: string
  amount: string
}

export interface Category {
  id: string
  name: string
  description: string
  emoji: string
  count: number
}

export interface RecipeData {
  recipes: Recipe[]
  categories: Category[]
}

// Filter and search types
export interface FilterOptions {
  category?: string
  difficulty?: string
  maxTime?: number
  tags?: string[]
  searchQuery?: string
}

export interface SortOptions {
  sortBy: 'newest' | 'oldest' | 'rating' | 'prepTime' | 'popularity'
  order: 'asc' | 'desc'
}

// Component prop types
export interface RecipeCardProps {
  recipe: Recipe
  className?: string
  featured?: boolean
}

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

export interface CategoryFilterProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (categoryId: string) => void
  className?: string
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

// API response types
export interface SearchResult {
  recipes: Recipe[]
  totalCount: number
  currentPage: number
  totalPages: number
  filters: FilterOptions
}

// Layout types
export interface LayoutProps {
  children: React.ReactNode
}

export interface SEOProps {
  title: string
  description: string
  image?: string
  canonical?: string
}

// Form types
export interface ContactFormData {
  name: string
  email: string
  message: string
}

export interface ReviewFormData {
  rating: number
  title: string
  comment: string
  author: string
}

// Navigation types
export interface NavItem {
  href: string
  label: string
  active?: boolean
}

export interface BreadcrumbItem {
  href?: string
  label: string
  active?: boolean
}

// Error types
export interface ErrorState {
  message: string
  code?: number
  retry?: () => void
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Theme types
export type Theme = 'light' | 'dark'

export interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

// Utility types
export type Difficulty = Recipe['difficulty']
export type RecipeId = Recipe['id']
export type CategoryId = Category['id']