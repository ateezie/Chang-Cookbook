# 🍳 Chang Cookbook

A modern React/Next.js recipe website with a warm, personal brand identity. Features a comprehensive recipe management system, responsive design, and complete branding integration.

![Chang Cookbook](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black) ![React](https://img.shields.io/badge/React-19.1.1-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)

## ✨ Features

- **🎨 Complete Brand Identity** - Warm Chang color palette and typography
- **📱 Responsive Design** - Mobile-first approach with Tailwind CSS
- **🗄️ Database-Driven** - Prisma ORM with SQLite for production
- **👥 Admin Panel** - Full recipe management system
- **🔍 Smart Search** - Filter by categories, difficulty, ingredients
- **📊 SEO Optimized** - Meta tags, structured data, performance optimized
- **🐳 Docker Ready** - Complete containerization for easy deployment
- **🔒 Security Built-in** - Authentication, validation, secure defaults

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/chang-cookbook.git
cd chang-cookbook

# Install dependencies
npm install

# Set up the database
npx prisma generate
npx prisma migrate dev
node scripts/migrate-json-to-db.js

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your Chang Cookbook!

## 📁 Project Structure

```
chang-cookbook/
├── src/
│   ├── app/                 # Next.js 15 app directory
│   ├── components/          # Reusable React components
│   ├── data/               # Recipe data and assets
│   ├── lib/                # Utilities and configurations
│   └── types/              # TypeScript type definitions
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── scripts/                # Database and import utilities
└── deployment/             # Docker and deployment configs
```

## 🎨 Brand System

Chang Cookbook features a complete brand identity with:

- **Color Palette**: Warm browns (#4a3429 to #8b6f52) and vibrant oranges (#ff9966)
- **Typography**: Quicksand for headings, Source Sans Pro for body text
- **Logo System**: Automatic detection with graceful fallbacks
- **Custom Tailwind Classes**: `chang-brown-*`, `chang-orange-*`, `chang-neutral-*`

## 📚 Recipe Management

### Adding Recipes

**Method 1: Admin Panel** (Recommended)
1. Visit `/admin` in your browser
2. Login with admin credentials
3. Use the visual recipe editor

**Method 2: HTML Import**
1. Place HTML recipe files in `recipes-html/`
2. Run `node import-html-recipes.js`
3. Recipes are automatically parsed and imported

**Method 3: JSON Direct Edit**
1. Edit `src/data/recipes.json`
2. Run `node scripts/migrate-json-to-db.js`
3. Validate with `node validate-recipe.js`

### Recipe Structure

```json
{
  "id": "recipe-slug",
  "title": "Recipe Name",
  "slug": "recipe-name",
  "description": "Brief description",
  "category": "main-course",
  "difficulty": "easy",
  "prepTime": 15,
  "cookTime": 30,
  "servings": 4,
  "featured": false,
  "ingredients": [{"item": "ingredient", "amount": "1 cup"}],
  "instructions": ["Step 1", "Step 2"],
  "nutrition": {"calories": 350, "protein": "25g"}
}
```

## 🚀 Deployment

### Digital Ocean Deployment

Complete deployment setup with Docker, SSL, and domain configuration:

```bash
# Upload to your server
scp -r . root@your-server-ip:/opt/chang-cookbook/

# Run deployment script
./deploy.sh
```

See `DIGITAL_OCEAN_DEPLOYMENT.md` for detailed instructions.

### Environment Configuration

Copy `.env.production` to `.env.local` and update:

```env
DATABASE_URL="file:./production.db"
JWT_SECRET="your-secure-secret-key"
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="your-secure-password"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

### Database Commands

- `npx prisma studio` - Open database browser
- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate dev` - Run development migrations
- `node scripts/migrate-json-to-db.js` - Import JSON recipes

## 📊 Current Status

- **✅ Production Ready** - Fully functional recipe website
- **21 Recipes** - Imported and categorized
- **Brand Complete** - Logo system, colors, typography
- **Database Driven** - Full admin panel and API
- **Docker Ready** - Complete deployment setup
- **SEO Optimized** - Meta tags and structured data

## 🔧 Customization

### Brand Colors

Update `tailwind.config.js` to modify the Chang color system:

```js
colors: {
  'chang-brown': {
    900: '#4a3429', // Dark brown
    500: '#6b4f3a', // Medium brown  
    300: '#8b6f52'  // Light brown
  }
}
```

### Logo Integration

1. Place logo files in `public/images/logo/`:
   - `chang-logo.svg` (preferred)
   - `chang-logo.png` (512x512px)
   - `chang-logo-small.png` (96x96px)
   - `chang-logo-favicon.png` (32x32px)

2. Restart the server - logos appear automatically!

## 📝 Documentation

- `CLAUDE.md` - Complete project memory and instructions
- `DIGITAL_OCEAN_DEPLOYMENT.md` - Production deployment guide
- `ADD_YOUR_RECIPES.md` - Recipe addition instructions
- `LOGO_INTEGRATION_GUIDE.md` - Brand customization guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🍳 About Chang Cookbook

Chang Cookbook combines modern web technology with warm, personal branding to create a delightful recipe sharing experience. Built with performance, accessibility, and user experience in mind.

**Perfect for:**
- Personal recipe websites
- Family cookbook projects  
- Restaurant recipe showcases
- Cooking blog platforms
- Community recipe sharing

---

**Happy cooking! 🍳✨**

Made with ❤️ using Next.js, React, and Tailwind CSS