'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SearchBar from './SearchBar'
import ChangLogo from './ChangLogo'

interface NavItemProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

function NavItem({ href, children, className = '', onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`nav-link ${className}`}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileSearchQuery, setMobileSearchQuery] = useState('')
  const router = useRouter()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen)
  }

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false)
    setMobileSearchQuery('')
  }

  const handleMobileSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      closeMobileSearch()
    }
  }

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setSearchQuery('')
    }
  }

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/recipes', label: 'Recipes' },
    { href: '/categories', label: 'Categories' },
    { href: '/about', label: 'About' },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-chang-neutral-200 sticky top-0 z-50 relative overflow-visible">      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and title positioned together */}
          <div className="flex items-center relative">
            {/* Absolute positioned logo that can expand outside header */}
            <div className="absolute w-24 h-24 z-20" style={{ top: '-18px', left: '0' }}>
              <Link href="/" className="block">
                <ChangLogo size="large" className="w-full h-full drop-shadow-lg hover:scale-110 transition-transform duration-200" />
              </Link>
            </div>
            
            {/* Title with proper spacing for logo */}
            <div className="pl-24">
              <Link href="/">
                <h1 className="text-lg sm:text-2xl font-heading font-bold text-chang-brown-900 hover:text-chang-orange-600 transition-colors duration-200 whitespace-nowrap">
                  Chang Cookbook
                </h1>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <NavItem key={item.href} href={item.href}>
                {item.label}
              </NavItem>
            ))}
          </nav>

          {/* Desktop Search & Profile */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="w-64">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={handleSearch}
                placeholder="Search recipes..."
              />
            </div>
            <button 
              className="text-chang-brown-800 hover:text-chang-orange-400 transition-colors duration-200 p-2"
              aria-label="User profile"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button 
              className="text-chang-brown-800 hover:text-chang-orange-400 transition-colors duration-200 p-2"
              aria-label="Search"
              onClick={toggleMobileSearch}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              className="text-chang-brown-800 hover:text-chang-orange-400 transition-colors duration-200 p-2"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Interface */}
        {isMobileSearchOpen && (
          <div className="md:hidden border-t border-chang-neutral-200 bg-white animate-fade-in">
            <div className="px-4 py-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <SearchBar
                    value={mobileSearchQuery}
                    onChange={setMobileSearchQuery}
                    onSubmit={handleMobileSearch}
                    placeholder="Search recipes..."
                    autoFocus
                  />
                </div>
                <button
                  onClick={closeMobileSearch}
                  className="text-chang-brown-800 hover:text-chang-orange-400 transition-colors duration-200 p-2"
                  aria-label="Close search"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-chang-neutral-200 py-4 animate-fade-in gradient-chang-warm">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <NavItem 
                  key={item.href} 
                  href={item.href}
                  onClick={closeMenu}
                  className="block px-4 py-2 text-base"
                >
                  {item.label}
                </NavItem>
              ))}
              <div className="px-4 py-2">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSubmit={(query) => {
                    handleSearch(query)
                    closeMenu()
                  }}
                  placeholder="Search recipes..."
                />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}