// Re-export all types for easy importing
export * from './recipe'

// Common utility types
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

// Common props types
export interface BaseProps {
  className?: string
  children?: React.ReactNode
}

export interface ClickableProps extends BaseProps {
  onClick?: () => void
  disabled?: boolean
}

export interface FormFieldProps extends BaseProps {
  label?: string
  error?: string
  required?: boolean
}

// API types
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code: number
  details?: unknown
}

// Event types
export type ChangeHandler<T = string> = (value: T) => void
export type SubmitHandler<T = unknown> = (data: T) => void | Promise<void>
export type ClickHandler = (event: React.MouseEvent) => void

// Size variants
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'

// Color variants
export type Color = 
  | 'orange'
  | 'red'
  | 'green'
  | 'blue'
  | 'gray'
  | 'slate'

// Status types
export type Status = 'success' | 'error' | 'warning' | 'info'

// Animation types
export type Animation = 'fade' | 'slide' | 'scale' | 'bounce'