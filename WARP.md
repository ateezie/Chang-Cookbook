# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking without emitting files
npm run type-check
```

### Database Commands
```bash
# Generate Prisma client after schema changes
npm run db:generate
# or: npx prisma generate

# Run database migrations
npm run db:migrate
# or: npx prisma migrate dev

# Open Prisma Studio database browser
npm run db:studio
# or: npx prisma studio

# Initialize database and migrate existing JSON data
npm run migrate:json
# or: node scripts/migrate-json-to-db.js

# Create admin user (for first-time setup)
npm run setup:admin
# or: node scripts/create-admin.js
```

### Recipe Management
```bash
# Import HTML recipes from recipes-html/ directory
node import-html-recipes.js

# Validate recipe data structure
node validate-recipe.js

# Check categories in database
node check-categories.js

# Update recipe images with Unsplash integration
node update-recipe-images.js
```

### Testing & Utilities
```bash
# Test database connection
node test-db.js

# Test API endpoints
node test-api.js

# Test authentication system
node test-login.js
```

### Production & Deployment
```bash
# Production database setup
node scripts/production-db-setup.js

# Database backup
./backup.sh

# Deploy to production (Docker)
./deploy.sh

# Production setup script
./production-setup.sh
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15.4.6 with React 19.1.1
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with custom Chang brand colors
- **TypeScript**: Full type safety throughout
- **Authentication**: JWT with bcryptjs
- **Deployment**: Docker with multi-stage builds

### Database Architecture
The application uses a PostgreSQL database with the following core models:

**Recipe System**:
- `Recipe` - Core recipe data with ingredients, instructions, and metadata
- `Ingredient` - Individual recipe ingredients with amounts and ordering
- `Instruction` - Ordered cooking steps
- `Category` - Recipe categorization system
- `Tag` - Many-to-many tagging system via `RecipeTag`

**User & Chef System**:
- `User` - Authentication and user accounts
- `Chef` - Chef profiles (one-to-one with users)
- `Invitation` - Chef invitation system with tokens

**Key Design Patterns**:
- Ordered relationships (ingredients, instructions use `order` field)
- Soft relationships (recipes can exist without users via `authorId?`)
- Hierarchical categories with counts
- Featured system (`featured` and `heroFeatured` flags)

### Frontend Architecture

**App Structure (Next.js 15 App Router)**:
- `/src/app/` - Next.js app directory with file-based routing
- `/src/components/` - Reusable React components
- `/src/lib/` - Business logic and utilities
- `/src/types/` - TypeScript type definitions

**Key Components**:
- `Header` - Navigation with logo auto-detection
- `Hero` - Dynamic hero section using hero-featured recipes
- `RecipeCard` - Recipe display with image fallbacks
- `ChangLogo` - Smart logo component with multiple fallback sources
- `RecipeImage` - Image component with category-based fallbacks

**Data Layer**:
- `src/lib/recipes.ts` - Recipe data operations with build-safe fallbacks
- `src/lib/build-safe-db.ts` - Build-time database operation safety
- `src/lib/prisma.ts` - Prisma client configuration

### Brand System Integration
The application features a complete brand identity system:

**Chang Color Palette**:
- Browns: `chang-brown-900` (#4a3429) to `chang-brown-300` (#8b6f52)
- Oranges: `chang-orange-500` (#ff9966) with variations
- Background: Warm cream/beige tones (#f5f1eb, #faf8f5)

**Logo System**:
- Logo files: `public/images/logo/chang-logo.svg` (preferred), `.png` variants
- Auto-detection with graceful fallbacks to animated placeholder
- Favicon integration via metadata system

**Typography**:
- Headings: Quicksand (warm, friendly)
- Body: Source Sans Pro (readable, approachable)

### Build & CI/CD System
The project includes sophisticated build optimization:

**Docker Build Strategy**:
- Multi-stage builds with dependency caching
- AMD64-optimized for production (5-10 minute builds)
- ARM64 builds on schedule/demand
- Advanced layer caching and npm cache mounts

**GitHub Actions Workflows**:
- `ci.yml` - Testing and validation
- `docker.yml` - Optimized production builds with deployment
- `deploy-fast.yml` - Emergency deploys (<3 minutes)
- `database.yml` - Database management automation

### Important Implementation Details

**Build-Time Safety**:
The application includes a sophisticated build-safe database system (`src/lib/build-safe-db.ts`) that provides JSON fallbacks during build time when the database is not available. This prevents build failures while maintaining functionality.

**Static File Handling**:
Custom static file handler at `src/app/images/[...path]/route.ts` handles all image requests in Next.js standalone mode, with security protections and caching headers.

**Recipe Import System**:
HTML recipes can be imported from `recipes-html/` directory using an intelligent parser that extracts ingredients, instructions, cooking times, and automatically categorizes recipes.

**Authentication Flow**:
JWT-based authentication with invitation system for chef onboarding. Admin users can invite new chefs via email tokens.

**Image Management**:
Comprehensive image fallback system with category-based placeholders, Unsplash integration, and proper Next.js image optimization.

## Project Context from CLAUDE.md

**Current Status**: Production-ready recipe website deployed at https://cook.alexthip.com

**Key Features Implemented**:
- Complete brand identity with Chang colors and typography
- Database-driven recipe system with admin panel
- HTML recipe import automation
- Dynamic hero section with featured recipes
- Mobile-responsive design with touch-friendly interfaces
- SEO optimization with structured data
- Docker containerization with optimized CI/CD

**Development Environment**:
- Currently configured for PostgreSQL (migrated from SQLite)
- Development server on port 3000
- Prisma Studio for database management
- Full TypeScript integration with strict type checking

**Recipe Collection**:
- 21+ imported recipes across multiple categories
- Featured recipe system for homepage highlights
- Category-based organization with counts
- Rating and review system ready for implementation

The codebase represents a complete, production-ready recipe website with modern web development practices, comprehensive branding, and robust deployment infrastructure.
