'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import ChangLogo from './ChangLogo'

interface FooterLinkProps {
  href: string
  children: React.ReactNode
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <Link 
      href={href} 
      className="hover:text-white transition-colors duration-200 text-sm"
    >
      {children}
    </Link>
  )
}

interface FooterSectionProps {
  title: string
  children: React.ReactNode
}

function FooterSection({ title, children }: FooterSectionProps) {
  return (
    <div>
      <h4 className="font-heading font-semibold mb-4 text-white">{title}</h4>
      <ul className="space-y-2 text-chang-neutral-200 font-body">
        {children}
      </ul>
    </div>
  )
}

interface Category {
  id: string
  name: string
  emoji: string
}

export default function Footer() {
  // Use a static year to avoid hydration mismatch
  const currentYear = 2025
  const [categories, setCategories] = useState<Category[]>([])
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Fallback to basic categories if API fails
        setCategories([
          { id: 'main-course', name: 'Main Course', emoji: '🍽️' },
          { id: 'appetizers', name: 'Appetizers', emoji: '🥗' },
          { id: 'desserts', name: 'Desserts', emoji: '🍰' },
          { id: 'quick-meals', name: 'Quick Meals', emoji: '⚡' },
        ])
      }
    }
    
    fetchCategories()
  }, [])

  return (
    <footer className="bg-chang-brown-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <ChangLogo size="small" />
              <h3 className="text-xl font-heading font-bold">Chang Cookbook</h3>
            </div>
            <p className="text-chang-neutral-200 font-body text-sm leading-relaxed">
              Discover delicious recipes for every occasion. From quick weeknight 
              dinners to special treats, find your next favorite dish.
            </p>
            <div className="flex space-x-4 mt-6">
              {/* Social Media Links */}
              <a 
                href="#" 
                className="text-chang-neutral-400 hover:text-chang-orange-400 transition-colors duration-200"
                aria-label="Follow us on Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="#" 
                className="text-chang-neutral-400 hover:text-chang-orange-400 transition-colors duration-200"
                aria-label="Follow us on Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm5 10c0 2.761-2.239 5-5 5s-5-2.239-5-5 2.239-5 5-5 5 2.239 5 5z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="#" 
                className="text-chang-neutral-400 hover:text-chang-orange-400 transition-colors duration-200"
                aria-label="Follow us on Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a 
                href="#" 
                className="text-chang-neutral-400 hover:text-chang-orange-400 transition-colors duration-200"
                aria-label="Subscribe to our YouTube channel"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Recipes Section */}
          <FooterSection title="Recipes">
            <li><FooterLink href="/recipes">All Recipes</FooterLink></li>
            <li><FooterLink href="/recipes?category=quick-meals">Quick & Easy</FooterLink></li>
            <li><FooterLink href="/recipes?difficulty=easy">Beginner Friendly</FooterLink></li>
            <li><FooterLink href="/recipes?featured=true">Featured Recipes</FooterLink></li>
            <li><FooterLink href="/search">Search Recipes</FooterLink></li>
          </FooterSection>
          
          {/* Dynamic Categories Section */}
          <FooterSection title="Categories">
            {categories.slice(0, 6).map((category) => (
              <li key={category.id}>
                <FooterLink href={`/recipes?category=${category.id}`}>
                  {category.emoji} {category.name}
                </FooterLink>
              </li>
            ))}
            {categories.length > 6 && (
              <li>
                <FooterLink href="/recipes">View All Categories</FooterLink>
              </li>
            )}
          </FooterSection>
        </div>
        
        {/* Newsletter Signup 
        <div className="border-t border-chang-brown-800 mt-8 pt-8">
          <div className="max-w-md">
            <h4 className="font-heading font-semibold mb-2 text-white">Subscribe to Our Newsletter</h4>
            <p className="text-chang-neutral-200 font-body text-sm mb-4">
              Get the latest recipes and cooking tips delivered to your inbox.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-l-lg border border-chang-brown-700 bg-chang-brown-800 text-white font-body placeholder-chang-neutral-400 focus:outline-none focus:ring-2 focus:ring-chang-orange-400 focus:border-chang-orange-400"
              />
              <button className="btn-primary rounded-l-none">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        */}
        
        {/* Copyright */}
        <div className="border-t border-chang-brown-800 mt-8 pt-8 text-center">
          <p className="text-chang-neutral-400 font-body text-sm">
            &copy; {currentYear} Chang Cookbook. All rights reserved. Made with ❤️ for food lovers.
          </p>
        </div>
      </div>
    </footer>
  )
}