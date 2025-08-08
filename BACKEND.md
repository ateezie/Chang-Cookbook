I want to add a backend to my existing Chang Cookbook Next.js project so admins can upload recipes through a web form instead of editing JSON files.

Requirements:
- Extend existing Next.js project with API routes
- SQLite database with Prisma ORM
- JWT authentication for admin users only
- Local image upload storage
- Recipe CRUD operations via web forms
- Migrate existing JSON recipes to database
- Admin dashboard for recipe management

Current project structure is in src/app/ with recipes stored in src/data/recipes.json.

Please start by:
1. Setting up Prisma with SQLite
2. Creating database schema for users and recipes
3. Installing required dependencies
4. Creating migration script from JSON to database

Please analyze my existing code first to understand the current recipe structure.