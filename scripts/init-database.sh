#!/bin/bash
set -e

echo "🗃️ Initializing Chang Cookbook database..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${GREEN}[DB-INIT]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[DB-INIT]${NC} $1"
}

print_error() {
    echo -e "${RED}[DB-INIT]${NC} $1"
}

# Check if database directory exists
if [ ! -d "/app/data" ]; then
    print_status "Creating database directory..."
    mkdir -p /app/data
    chown -R nextjs:nodejs /app/data
fi

# Set database path
export DATABASE_URL="file:/app/data/production.db"
print_status "Database URL: $DATABASE_URL"

# Check if database file exists and has data
if [ ! -f "/app/data/production.db" ]; then
    print_warning "Database file doesn't exist. Creating new database..."
    
    # Generate Prisma client (ensure it's available)
    print_status "Generating Prisma client..."
    npx prisma generate

    # Run migrations to create tables
    print_status "Running database migrations..."
    npx prisma migrate deploy

    # Migrate data from JSON
    if [ -f "/app/src/data/recipes.json" ]; then
        print_status "Migrating recipe data from JSON..."
        node /app/scripts/migrate-json-to-db.js
    else
        print_warning "No recipes.json found - database will be empty"
    fi

else
    print_status "Database file exists. Checking if setup is needed..."
    
    # Just ensure Prisma client is generated and migrations are applied
    npx prisma generate
    npx prisma migrate deploy
    
    # Check if we have any recipes (basic health check)
    RECIPE_COUNT=$(echo "SELECT COUNT(*) FROM recipes;" | sqlite3 /app/data/production.db 2>/dev/null || echo "0")
    
    if [ "$RECIPE_COUNT" = "0" ]; then
        print_warning "Database exists but has no recipes. Re-running migration..."
        if [ -f "/app/src/data/recipes.json" ]; then
            node /app/scripts/migrate-json-to-db.js
        fi
    else
        print_status "Database has $RECIPE_COUNT recipes - looks good!"
    fi
fi

# Ensure proper permissions
chown -R nextjs:nodejs /app/data/
chmod 664 /app/data/production.db 2>/dev/null || true

print_status "✅ Database initialization complete!"