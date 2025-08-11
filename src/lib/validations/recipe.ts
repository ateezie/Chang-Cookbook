import { z } from 'zod'

export const IngredientSchema = z.object({
  item: z.string().min(1, 'Ingredient item is required'),
  amount: z.string()
})

export const InstructionSchema = z.object({
  step: z.string().min(1, 'Instruction step is required'),
  order: z.number().int().min(0)
})

export const ChefSchema = z.object({
  name: z.string().min(1, 'Chef name is required'),
  avatar: z.string().optional()
})

export const CreateRecipeSchema = z.object({
  id: z.string().min(1, 'Recipe ID is required'),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  prepTime: z.number().int().min(0, 'Prep time must be non-negative'),
  cookTime: z.number().int().min(0, 'Cook time must be non-negative'),
  totalTime: z.number().int().min(0, 'Total time must be non-negative'),
  servings: z.number().int().min(1, 'Servings must be at least 1'),
  image: z.string().optional(),
  imageCredit: z.string().optional(),
  unsplashId: z.string().optional(),
  featured: z.boolean().default(false),
  chef: ChefSchema,
  ingredients: z.array(IngredientSchema).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string()).min(1, 'At least one instruction is required'),
  tags: z.array(z.string()).default([])
})

export const UpdateRecipeSchema = CreateRecipeSchema.partial().extend({
  id: z.string().min(1, 'Recipe ID is required')
})

export const RecipeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  category: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  featured: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'rating', 'prepTime', 'title']).default('newest'),
  order: z.enum(['asc', 'desc']).default('desc')
})

export type CreateRecipeInput = z.infer<typeof CreateRecipeSchema>
export type UpdateRecipeInput = z.infer<typeof UpdateRecipeSchema>
export type RecipeQuery = z.infer<typeof RecipeQuerySchema>