import './globals.css'
import { generateSiteMetadata } from '@/lib/metadata'

export const metadata = generateSiteMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased bg-white text-chang-brown-700">
        {children}
      </body>
    </html>
  )
}