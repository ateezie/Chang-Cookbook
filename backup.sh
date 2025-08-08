#!/bin/bash
set -e

# Chang Cookbook - Backup Script
echo "💾 Starting Chang Cookbook backup..."

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="chang-cookbook-backup-$TIMESTAMP"
FULL_BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[BACKUP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
mkdir -p $BACKUP_DIR

# Create timestamped backup directory
mkdir -p $FULL_BACKUP_PATH

print_status "Creating backup in: $FULL_BACKUP_PATH"

# 1. Backup database
if [ -f "data/database/production.db" ]; then
    print_status "Backing up database..."
    cp data/database/production.db $FULL_BACKUP_PATH/
    print_status "Database backup completed"
else
    print_warning "No production database found to backup"
fi

# 2. Backup uploaded images
if [ -d "data/uploads" ]; then
    print_status "Backing up uploaded images..."
    cp -r data/uploads $FULL_BACKUP_PATH/
    print_status "Uploads backup completed"
else
    print_warning "No uploads directory found"
fi

# 3. Backup environment configuration
if [ -f ".env.local" ]; then
    print_status "Backing up environment configuration..."
    cp .env.local $FULL_BACKUP_PATH/env.local.backup
    print_status "Environment backup completed"
else
    print_warning "No .env.local found to backup"
fi

# 4. Create backup manifest
print_status "Creating backup manifest..."
cat > $FULL_BACKUP_PATH/backup-info.txt << EOF
Chang Cookbook Backup
Created: $(date)
Hostname: $(hostname)
Backup Contents:
- Database: $([ -f "$FULL_BACKUP_PATH/production.db" ] && echo "✓ Included" || echo "✗ Not found")
- Uploads: $([ -d "$FULL_BACKUP_PATH/uploads" ] && echo "✓ Included" || echo "✗ Not found")  
- Environment: $([ -f "$FULL_BACKUP_PATH/env.local.backup" ] && echo "✓ Included" || echo "✗ Not found")

Restoration Instructions:
1. Stop the application: docker-compose down
2. Restore database: cp production.db ../data/database/
3. Restore uploads: cp -r uploads ../data/
4. Restore environment: cp env.local.backup ../.env.local
5. Start application: docker-compose up -d

Database Statistics (if available):
EOF

# Add database stats if possible
if command -v sqlite3 &> /dev/null && [ -f "$FULL_BACKUP_PATH/production.db" ]; then
    echo "- Recipes: $(sqlite3 $FULL_BACKUP_PATH/production.db 'SELECT COUNT(*) FROM recipes;')" >> $FULL_BACKUP_PATH/backup-info.txt
    echo "- Categories: $(sqlite3 $FULL_BACKUP_PATH/production.db 'SELECT COUNT(*) FROM categories;')" >> $FULL_BACKUP_PATH/backup-info.txt
    echo "- Users: $(sqlite3 $FULL_BACKUP_PATH/production.db 'SELECT COUNT(*) FROM User;')" >> $FULL_BACKUP_PATH/backup-info.txt
fi

# 5. Create compressed archive
print_status "Creating compressed archive..."
cd $BACKUP_DIR
tar -czf $BACKUP_NAME.tar.gz $BACKUP_NAME/
rm -rf $BACKUP_NAME/
cd ..

# 6. Cleanup old backups (keep last 10)
print_status "Cleaning up old backups..."
cd $BACKUP_DIR
ls -t *.tar.gz | tail -n +11 | xargs -r rm
cd ..

BACKUP_SIZE=$(du -h $BACKUP_DIR/$BACKUP_NAME.tar.gz | cut -f1)
print_status "✅ Backup completed successfully!"
print_status "📦 Backup file: $BACKUP_DIR/$BACKUP_NAME.tar.gz ($BACKUP_SIZE)"
print_status "📋 To restore: tar -xzf $BACKUP_NAME.tar.gz && follow instructions in backup-info.txt"

# Optional: Upload to cloud storage
# Uncomment and configure for your cloud provider
# print_status "Uploading to cloud storage..."
# aws s3 cp $BACKUP_DIR/$BACKUP_NAME.tar.gz s3://your-bucket/chang-cookbook-backups/
# print_status "Cloud upload completed"

echo "💾 Backup process completed!"