# ✅ Chang Cookbook - Deployment Checklist

Use this checklist to ensure a smooth deployment to Digital Ocean.

## 📋 Pre-Deployment Checklist

### Local Preparation
- [ ] Application is working locally (`npm run dev`)
- [ ] All environment variables are documented in `.env.production`
- [ ] Database has test data and migrations are up to date
- [ ] All deployment files are present:
  - [ ] `Dockerfile`
  - [ ] `docker-compose.yml`
  - [ ] `.env.production`
  - [ ] `deploy.sh`
  - [ ] `production-setup.sh`
  - [ ] `backup.sh`
  - [ ] `DIGITAL_OCEAN_DEPLOYMENT.md`

### Digital Ocean Setup
- [ ] Droplet created (minimum 2GB RAM)
- [ ] SSH key added to droplet
- [ ] Server IP address noted
- [ ] Domain DNS configured (if using custom domain)

## 🚀 Deployment Steps

### 1. Server Setup
- [ ] Connected to server via SSH
- [ ] Uploaded `production-setup.sh` to server
- [ ] Run setup script: `sudo ./production-setup.sh`
- [ ] Verified Docker and Docker Compose installation

### 2. Application Deployment
- [ ] Uploaded application files to `/opt/chang-cookbook`
- [ ] Created `.env.local` from `.env.production`
- [ ] Updated environment variables in `.env.local`:
  - [ ] `JWT_SECRET` (secure random string)
  - [ ] `ADMIN_EMAIL` (your admin email)
  - [ ] `ADMIN_PASSWORD` (secure password)
  - [ ] `NEXTAUTH_URL` (your domain or IP)
- [ ] Made scripts executable: `chmod +x *.sh`
- [ ] Run deployment: `./deploy.sh`

### 3. Domain & SSL (Optional)
- [ ] Domain DNS propagated to server IP
- [ ] Updated nginx configuration with domain
- [ ] Enabled nginx site
- [ ] Obtained SSL certificate with Let's Encrypt
- [ ] Updated `NEXTAUTH_URL` in `.env.local`
- [ ] Restarted application

## ✅ Post-Deployment Verification

### Application Testing
- [ ] Website loads: `https://yourdomain.com`
- [ ] Homepage displays correctly
- [ ] Recipes page works: `https://yourdomain.com/recipes`
- [ ] Individual recipe pages load
- [ ] Admin panel accessible: `https://yourdomain.com/admin`
- [ ] Admin login works
- [ ] Recipe editing works in admin panel
- [ ] API endpoints respond: `https://yourdomain.com/api/recipes`

### Technical Verification
- [ ] SSL certificate valid and auto-renewing
- [ ] Firewall configured (ports 80, 443, 22 open)
- [ ] Application auto-starts with system
- [ ] Logs are accessible: `docker-compose logs -f`
- [ ] Health checks passing
- [ ] Database persists across restarts

### Security Check
- [ ] Changed admin password from default
- [ ] JWT_SECRET is unique and secure
- [ ] No sensitive data in environment files
- [ ] SSH key-based authentication only
- [ ] UFW firewall enabled and configured
- [ ] SSL/HTTPS enforced

## 🔄 Ongoing Maintenance Setup

### Backups
- [ ] Test backup script: `./backup.sh`
- [ ] Set up automated backups (cron job)
- [ ] Test restore procedure
- [ ] Configure off-site backup storage (optional)

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure log monitoring
- [ ] Monitor disk space usage
- [ ] Monitor application performance

### Documentation
- [ ] Document server access credentials
- [ ] Note all configuration changes
- [ ] Update team on deployment details
- [ ] Create incident response plan

## 📞 Emergency Contacts & Resources

### Important Files Location
- Application: `/opt/chang-cookbook`
- Nginx config: `/etc/nginx/sites-available/chang-cookbook`
- SSL certificates: `/etc/letsencrypt/live/yourdomain.com/`
- Backups: `/opt/chang-cookbook/backups/`

### Key Commands
```bash
# Application status
docker-compose ps

# View logs
docker-compose logs -f chang-cookbook

# Restart application
systemctl restart chang-cookbook

# Backup
./backup.sh

# SSL renewal
certbot renew
```

### Troubleshooting Resources
- Deployment guide: `DIGITAL_OCEAN_DEPLOYMENT.md`
- Application logs: `docker-compose logs -f`
- System logs: `/var/log/nginx/error.log`
- Health check: `curl -I https://yourdomain.com`

## 🎉 Deployment Complete!

Once all items are checked, your Chang Cookbook is successfully deployed!

**Next Steps:**
1. Share the URL with your team
2. Set up monitoring and alerts
3. Schedule regular maintenance
4. Plan for scaling if needed

---

*Deployment Date: ___________*  
*Deployed By: ___________*  
*Domain: ___________*  
*Server IP: ___________*