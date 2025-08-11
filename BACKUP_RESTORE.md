# Chang Cookbook - Database Backup & Restore Guide

## 📋 Quick Reference

**Production Server**: `root@157.230.61.255`  
**Database Location**: `/opt/chang-cookbook/data/database/production.db`  
**Backup Directory**: `/opt/chang-cookbook/backups/`

## 🗄️ Creating Backups

### On Production Server (Digital Ocean)

```bash
# Navigate to project directory
cd /opt/chang-cookbook

# Create timestamped backup
BACKUP_NAME="production_$(date +%Y%m%d_%H%M%S).db"
cp ./data/database/production.db "./backups/$BACKUP_NAME"

# Create organized backup directory
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)_manual_backup"
mkdir -p "$BACKUP_DIR"
cp ./data/database/production.db "$BACKUP_DIR/production.db"

# List backups
ls -la ./backups/
```

### Download to Local Machine

```powershell
# From Windows PowerShell
scp "root@157.230.61.255:/opt/chang-cookbook/backups/production_YYYYMMDD_HHMMSS.db" "E:\Projects\chang-cookbook\data\production.db"
```

## 🔄 Restoring Database

### Method 1: Replace Production Database (DANGEROUS - Always backup first!)

```bash
# On production server
cd /opt/chang-cookbook

# Stop container
docker compose down

# Backup current database before restore
cp ./data/database/production.db "./backups/pre-restore_$(date +%Y%m%d_%H%M%S).db"

# Restore from backup
cp "./backups/YOUR_BACKUP_FILE.db" "./data/database/production.db"

# Fix permissions
sudo chown 1001:1001 ./data/database/production.db
sudo chmod 664 ./data/database/production.db

# Restart container
docker compose up -d
```

### Method 2: Local Development Setup

```powershell
# Windows PowerShell
# Download production database
scp "root@157.230.61.255:/opt/chang-cookbook/backups/BACKUP_FILE.db" "E:\Projects\chang-cookbook\data\production.db"

# Update .env.local
DATABASE_URL="file:./data/production.db"
NODE_ENV="development"
```

```bash
# Start local development
npm run dev
```

## 🚨 Emergency Restore Procedure

If the production database becomes corrupted:

1. **Immediate Backup**: Always backup corrupted database first
2. **Stop Container**: `docker compose down`
3. **Restore**: Copy known good backup to production.db
4. **Fix Permissions**: `sudo chown 1001:1001` and `chmod 664`
5. **Restart**: `docker compose up -d`
6. **Test**: Verify login and recipe access

## 📁 Local Development Database

### Setup with Production Data

1. **Download Database**: Use scp command above
2. **Update .env.local**:
   ```env
   DATABASE_URL="file:./data/production.db"
   JWT_SECRET="DFfbtoXcDf*IV9M6@c5S%OK4etWHaaOD"
   ADMIN_EMAIL="hello@alexthip.com"
   ADMIN_PASSWORD="cAEj05d7TtCf*@zD"
   NODE_ENV="development"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Start Development Server**: `npm run dev`

### Sync Local Changes to Production

⚠️ **WARNING**: This will overwrite production data!

```bash
# Upload local database to production
scp "E:\Projects\chang-cookbook\data\production.db" "root@157.230.61.255:/opt/chang-cookbook/backups/local_upload_$(date +%Y%m%d_%H%M%S).db"

# Then restore on production server using Method 1 above
```

## 🔍 Database Troubleshooting

### Common Issues & Solutions

**Error: "Unable to open database file"**
```bash
# Check file exists
ls -la /opt/chang-cookbook/data/database/production.db

# Fix permissions
sudo chown 1001:1001 /opt/chang-cookbook/data/database/production.db
sudo chmod 664 /opt/chang-cookbook/data/database/production.db

# Restart container with docker compose
docker compose down && docker compose up -d
```

**Environment Variable Issues**
```bash
# Check DATABASE_URL is loaded
docker exec chang-cookbook-chang-cookbook-1 env | grep DATABASE_URL

# Should show: DATABASE_URL=file:/app/data/production.db
```

**Container Not Loading Environment**
```bash
# Must use docker compose (not docker run) to load .env.local
docker compose down
docker compose up -d
```

## 🎯 Best Practices

1. **Regular Backups**: Create backups before major updates
2. **Test Restores**: Verify backups work on local development
3. **Document Changes**: Note what changed when creating backups
4. **Backup Before Deploy**: Always backup before CI/CD deployments
5. **Use Absolute Paths**: DATABASE_URL="file:/app/data/production.db" in production

## 📊 Backup Locations

- **Production**: `/opt/chang-cookbook/backups/`
- **Local**: `E:\Projects\chang-cookbook\data\`
- **Working Backups**: 
  - `production_20250811_004831.db` (with recipe/image updates)
  - `20250810_052035/production.db` (original working state)

---

**Last Updated**: August 11, 2025  
**Status**: ✅ Production database working with absolute path fix