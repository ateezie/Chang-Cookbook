/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Build configuration for PostgreSQL migration
  trailingSlash: false,
  experimental: {
    appDir: true,
  },
  // Disable static generation for auth pages to prevent build-time database calls
  async generateBuildId() {
    return 'build-' + Date.now()
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cook.alexthip.com',
        port: '',
        pathname: '/images/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Disable optimization for local uploads to avoid issues
    unoptimized: false,
    // Configure loader for better handling
    loader: 'default',
  },
}

module.exports = nextConfig