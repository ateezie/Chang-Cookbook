'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ChangLogoProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export default function ChangLogo({ size = 'medium', className = '' }: ChangLogoProps) {
  const [hasError, setHasError] = useState(false)
  
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  }

  const sizePixels = {
    small: 32,
    medium: 48,
    large: 64
  }

  // Fallback placeholder logo
  const PlaceholderLogo = () => (
    <div className="w-full h-full rounded-full bg-gradient-to-br from-chang-orange-400 to-chang-orange-600 border-2 border-chang-brown-700 flex items-center justify-center shadow-lg">
      <span className="text-white font-bold text-xl">👨‍🍳</span>
    </div>
  )

  // Try to load your uploaded logo first, fallback to placeholder
  if (hasError) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <PlaceholderLogo />
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {/* Your logo - will automatically use your uploaded file */}
      <Image
        src="/images/logo/chang-logo.svg"
        alt="Chang Cookbook"
        width={sizePixels[size]}
        height={sizePixels[size]}
        className="w-full h-full object-contain"
        onError={() => setHasError(true)}
        priority={size === 'medium'} // Prioritize header logo
      />
    </div>
  )
}

// Alternative SVG version for when you upload your logo
export function ChangLogoSVG({ size = 'medium', className = '' }: ChangLogoProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12', 
    large: 'w-16 h-16'
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {/* This is where your actual logo will go */}
      {/* Replace with: <Image src="/logo.svg" alt="Chang Cookbook" width={48} height={48} /> */}
      
      {/* Placeholder SVG logo */}
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff9966" />
            <stop offset="100%" stopColor="#e6824e" />
          </linearGradient>
        </defs>
        <circle 
          cx="24" 
          cy="24" 
          r="22" 
          fill="url(#logoGradient)"
          stroke="#4a3429"
          strokeWidth="2"
        />
        <text 
          x="24" 
          y="30" 
          textAnchor="middle" 
          fontSize="20"
          fill="white"
        >
          👨‍🍳
        </text>
      </svg>
    </div>
  )
}