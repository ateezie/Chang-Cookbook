// Force all auth pages to be dynamic
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}