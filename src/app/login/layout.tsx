// Force all auth pages to be dynamic
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}