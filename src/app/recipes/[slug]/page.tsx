import { Metadata } from 'next'
import RecipePageContent from './RecipePageContent'
import { getRecipeById } from '@/lib/recipes'
import { generateRecipeMetadata } from '@/lib/metadata'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const recipe = getRecipeById(slug)
  
  if (!recipe) {
    return {
      title: 'Recipe Not Found | Chang Cookbook',
      description: 'The recipe you are looking for could not be found.',
    }
  }
  
  return generateRecipeMetadata(recipe)
}

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params
  return <RecipePageContent slug={slug} />
}