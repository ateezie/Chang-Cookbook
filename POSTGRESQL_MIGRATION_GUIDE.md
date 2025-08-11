# 🐘 Chang Cookbook PostgreSQL Migration Guide

This guide will help you migrate from SQLite to Neon PostgreSQL in about 15 minutes.

## 🎯 Why PostgreSQL?

- ✅ No more file locking issues
- ✅ Better performance and scalability  
- ✅ Production-ready from day one
- ✅ Advanced features (full-text search, JSON columns)
- ✅ Free tier with Neon

## 📋 Step-by-Step Migration

### Step 1: Create Neon PostgreSQL Database

1. **Sign up at [neon.tech](https://neon.tech)** (free account)
2. **Create new project** called "chang-cookbook"
3. **Copy the connection string** (looks like this):
   ```
   postgresql://username:password@ep-cool-recipe-123456.us-east-1.aws.neon.tech/changcookbook?sslmode=require
   ```

### Step 2: Update Environment Variables

Update your `.env.local` file with the PostgreSQL connection string:

```bash
# Replace the DATABASE_URL line with your Neon connection string
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
```

**Note:** Your original SQLite settings are backed up in `.env.sqlite.backup`

### Step 3: Create PostgreSQL Migration

```bash
# Generate Prisma client for PostgreSQL
npx prisma generate

# Create initial PostgreSQL migration
npx prisma migrate dev --name init_postgresql
```

### Step 4: Migrate Data

```bash
# Run the migration script to move your recipes to PostgreSQL
node migrate-to-postgresql.js
```

### Step 5: Test Your Application

```bash
# Start the development server
npm run dev
```

Visit `http://localhost:3000` and verify:
- ✅ All recipes are visible
- ✅ Categories work correctly
- ✅ Recipe pages load properly
- ✅ Admin functions work
- ✅ Featured recipes display correctly

## 🚀 Production Deployment

### Update GitHub Secrets

Add your PostgreSQL connection string to GitHub repository secrets:

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Update `DATABASE_URL` with your Neon connection string

### Environment Variables for Production

Update your production environment with:

```bash
DATABASE_URL="postgresql://your-neon-connection-string"
JWT_SECRET="your-jwt-secret"
ADMIN_EMAIL="your-admin-email"
ADMIN_PASSWORD="your-secure-password"
```

## 📊 What Gets Migrated

- ✅ All 20+ recipes with ingredients and instructions
- ✅ All categories with correct counts
- ✅ Chef information and avatars
- ✅ Featured recipe settings
- ✅ Recipe metadata (prep time, difficulty, etc.)
- ✅ Recipe images and descriptions

## 🛠️ Troubleshooting

### Connection Issues
```bash
# Test your connection string
npx prisma db push
```

### Reset If Needed
```bash
# If something goes wrong, reset and try again
npx prisma migrate reset
node migrate-to-postgresql.js
```

### Rollback to SQLite
If you need to go back to SQLite:
```bash
# Restore the original environment
cp .env.sqlite.backup .env.local

# Update schema back to SQLite
# Change "postgresql" to "sqlite" in prisma/schema.prisma
# Then run: npx prisma db push
```

## 🎉 Benefits After Migration

- **No more file locking errors** during development
- **Better performance** for recipe searches and filtering
- **Scalable architecture** ready for thousands of recipes
- **Advanced features** like full-text search (future enhancement)
- **Production-ready** database that won't cause deployment issues
- **Easy backups** and database management through Neon console

## 📞 Need Help?

If you run into any issues during migration:
1. Check the error messages carefully
2. Verify your Neon connection string is correct
3. Make sure you've run `npx prisma generate` after updating the schema
4. Check that your Neon database is active (not sleeping)

---

**Estimated Migration Time:** 15-20 minutes  
**Downtime:** None (databases run in parallel during migration)