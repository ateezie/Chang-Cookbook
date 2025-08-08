# 🚀 Chang Cookbook - Digital Ocean Deployment Guide

This guide will help you deploy Chang Cookbook to a Digital Ocean droplet with Docker, SSL, and a custom domain.

## 📋 Prerequisites

- Digital Ocean account
- Domain name (optional but recommended)
- Local copy of Chang Cookbook project
- Basic Linux/terminal knowledge

## 🏗️ Step 1: Create Digital Ocean Droplet

1. **Create Droplet**
   - Go to Digital Ocean Control Panel
   - Click "Create" → "Droplets"
   - Choose **Ubuntu 22.04 LTS**
   - Select droplet size (minimum **2GB RAM** recommended)
   - Choose a datacenter region close to your users
   - Add your SSH key for secure access
   - Name your droplet (e.g., "chang-cookbook-prod")

2. **Note Your Server IP**
   - After creation, note the server's IP address
   - You'll use this to connect and configure your domain

## 🔧 Step 2: Initial Server Setup

1. **Connect to Your Server**
   ```bash
   ssh root@157.230.61.225
   ```

2. **Upload Setup Script**
   Copy the `production-setup.sh` script to your server:
   ```bash
   # From your local machine
   scp production-setup.sh root@157.230.61.225:/root/
   ```

3. **Run Server Setup**
   ```bash
   # On your server
   chmod +x production-setup.sh
   ./production-setup.sh
   ```

   This script will:
   - Install Docker and Docker Compose
   - Configure firewall (UFW)
   - Install Nginx and Certbot
   - Create application directory at `/opt/chang-cookbook`
   - Set up systemd service

## 📁 Step 3: Deploy Application

1. **Upload Your Application**
   ```bash
   # From your local machine (in chang-cookbook directory)
   scp -r . root@157.230.61.225:/opt/chang-cookbook/
   ```

2. **Configure Environment**
   ```bash
   # On your server
   cd /opt/chang-cookbook
   cp .env.production .env.local
   nano .env.local
   ```

   **Important: Update these values in .env.local:**
   ```env
   DATABASE_URL="file:./production.db"
   JWT_SECRET="DFfbtoXcDf*IV9M6@c5S%OK4etWHaaOD"
   ADMIN_EMAIL="hello@alexthip.com"
   ADMIN_PASSWORD="cAEj05d7TtCf*@zD"
   NEXTAUTH_URL="https://cook.alexthip.com"
   NODE_ENV="production"
   ```

3. **Make Scripts Executable**
   ```bash
   chmod +x deploy.sh backup.sh
   ```

4. **Run Deployment**
   ```bash
   ./deploy.sh
   ```

   This will:
   - Create necessary directories
   - Build Docker container
   - Start the application
   - Set up database and import recipes
   - Verify deployment

## 🌐 Step 4: Domain Configuration (Optional but Recommended)

1. **Configure DNS**
   - Point your domain's A record to your server IP
   - Wait for DNS propagation (can take up to 24 hours)

2. **Update Nginx Configuration**
   ```bash
   nano /etc/nginx/sites-available/chang-cookbook
   ```
   
   Replace `your-domain.com` with your actual domain:
   ```nginx
   server_name cook.alexthip.com;
   ```

3. **Enable Nginx Site**
   ```bash
   ln -sf /etc/nginx/sites-available/chang-cookbook /etc/nginx/sites-enabled/
   nginx -t  # Test configuration
   systemctl reload nginx
   ```

4. **Set Up SSL with Let's Encrypt**
   ```bash
   certbot --nginx -d cook.alexthip.com
   ```

## 🔒 Step 5: Security & Final Configuration

1. **Update Environment Variables**
   ```bash
   cd /opt/chang-cookbook
   nano .env.local
   ```
   Update `NEXTAUTH_URL` to your domain:
   ```env
   NEXTAUTH_URL="https://cook.alexthip.com"
   ```

2. **Restart Application**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

3. **Verify Deployment**
   - Visit your domain: `https://cook.alexthip.com`
   - Test admin panel: `https://cook.alexthip.com/admin`
   - Check recipes page: `https://cook.alexthip.com/recipes`

## 🛠️ Management Commands

### Application Management
```bash
# View application logs
docker-compose logs -f chang-cookbook

# Restart application
docker-compose restart chang-cookbook

# Update application (after code changes)
git pull  # if using git
docker-compose up --build -d

# Check application status
docker-compose ps
```

### Database Management
```bash
# Run database migrations
docker-compose exec chang-cookbook npx prisma migrate deploy

# Access database shell (SQLite)
docker-compose exec chang-cookbook sqlite3 /app/prisma/production.db

# Import new recipes
docker-compose exec chang-cookbook node scripts/migrate-json-to-db.js
```

### Backup Management
```bash
# Create backup
./backup.sh

# View backups
ls -la backups/

# Restore from backup (example)
tar -xzf backups/chang-cookbook-backup-TIMESTAMP.tar.gz
# Follow instructions in backup-info.txt
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check if application is responding
curl -I https://cook.alexthip.com

# Check API endpoints
curl https://cook.alexthip.com/api/recipes

# Monitor resource usage
htop
df -h  # Check disk space
```

### Regular Maintenance
1. **Weekly backups**: Set up a cron job to run `./backup.sh`
2. **System updates**: `apt update && apt upgrade`
3. **SSL renewal**: Certbot auto-renews, but check with `certbot certificates`
4. **Log rotation**: Docker handles this automatically
5. **Database cleanup**: Monitor database size and optimize if needed

## 🔧 Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   docker-compose logs chang-cookbook
   # Check environment file
   cat .env.local
   # Rebuild container
   docker-compose up --build -d
   ```

2. **Database errors**
   ```bash
   # Check database file permissions
   ls -la data/database/
   # Reset database (WARNING: This deletes all data)
   rm data/database/production.db
   docker-compose exec chang-cookbook npx prisma migrate deploy
   docker-compose exec chang-cookbook node scripts/migrate-json-to-db.js
   ```

3. **SSL/HTTPS issues**
   ```bash
   # Check nginx status
   systemctl status nginx
   # Test nginx config
   nginx -t
   # Check SSL certificate
   certbot certificates
   ```

4. **Out of disk space**
   ```bash
   # Check disk usage
   df -h
   # Clean Docker images
   docker system prune -a
   # Remove old backups
   rm backups/chang-cookbook-backup-old*.tar.gz
   ```

### Getting Help

- Check application logs: `docker-compose logs -f`
- View nginx logs: `tail -f /var/log/nginx/error.log`
- Check system resources: `htop`
- Monitor network: `netstat -tulpn`

## 🎉 Success!

Your Chang Cookbook should now be running on Digital Ocean!

**🔗 Access Points:**
- **Website**: https://cook.alexthip.com
- **Admin Panel**: https://cook.alexthip.com/admin
- **API**: https://cook.alexthip.com/api/recipes

**🔑 Default Admin Credentials:**
- Email: From your `.env.local` file
- Password: From your `.env.local` file

**⚠️ Important Next Steps:**
1. Change admin password after first login
2. Set up automated backups
3. Monitor application performance
4. Consider setting up a CDN for better performance

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review application logs
3. Ensure all environment variables are correct
4. Verify domain DNS settings
5. Check firewall and security group settings

---

*Happy cooking with Chang Cookbook! 🍳✨*