// Force my-recipes pages to be dynamic
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

export default function MyRecipesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}