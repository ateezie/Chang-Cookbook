// Logo utility functions for Chang Cookbook

export const LOGO_PATHS = {
  // Primary logo files (in order of preference)
  svg: '/images/logo/chang-logo.svg',
  png: '/images/logo/chang-logo.png',
  small: '/images/logo/chang-logo-small.png',
  favicon: '/images/logo/chang-logo-favicon.png',
}

export const LOGO_SIZES = {
  small: { width: 32, height: 32 },
  medium: { width: 48, height: 48 },
  large: { width: 64, height: 64 },
  favicon: { width: 32, height: 32 },
  social: { width: 400, height: 400 },
} as const

export type LogoSize = keyof typeof LOGO_SIZES

// Get the best logo path based on size and availability
export function getLogoPath(size: LogoSize): string {
  // For small sizes, prefer optimized small versions
  if (size === 'small' || size === 'favicon') {
    return LOGO_PATHS.small
  }
  
  // For medium and large, prefer SVG first, then high-res PNG
  return LOGO_PATHS.svg
}

// Get fallback logo paths in order of preference
export function getLogoFallbacks(size: LogoSize): string[] {
  const fallbacks = []
  
  switch (size) {
    case 'small':
    case 'favicon':
      fallbacks.push(LOGO_PATHS.small, LOGO_PATHS.favicon, LOGO_PATHS.png, LOGO_PATHS.svg)
      break
    case 'medium':
    case 'large':
      fallbacks.push(LOGO_PATHS.svg, LOGO_PATHS.png, LOGO_PATHS.small)
      break
    default:
      fallbacks.push(LOGO_PATHS.svg, LOGO_PATHS.png, LOGO_PATHS.small, LOGO_PATHS.favicon)
  }
  
  return fallbacks
}