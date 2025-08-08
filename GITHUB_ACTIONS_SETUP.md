# ⚡ GitHub Actions Setup Guide for Chang Cookbook

Complete CI/CD automation with GitHub Actions for testing, building, and deploying your Chang Cookbook.

## 🚀 What's Included

Your repository now includes **4 comprehensive GitHub Actions workflows**:

1. **🧪 CI Workflow** (`ci.yml`) - Testing, linting, and building
2. **🚀 Deployment Workflow** (`deploy.yml`) - Automated Digital Ocean deployment
3. **🐳 Docker Workflow** (`docker.yml`) - Container building and registry management
4. **🗄️ Database Workflow** (`database.yml`) - Database operations and migrations

## 🔐 Required GitHub Secrets

Before the workflows can run, you need to configure these secrets in your GitHub repository:

### Navigate to Repository Settings
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each secret below

### 🌐 Deployment Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `DEPLOY_SSH_KEY` | Private SSH key for server access | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DEPLOY_USER` | Server username | `root` or `your-username` |
| `DEPLOY_HOST` | Server IP address | `157.230.61.225` |
| `DEPLOY_PATH` | Deployment directory path | `/opt/chang-cookbook` |
| `DEPLOYMENT_URL` | Your website URL | `https://cook.alexthip.com` |

### 🔒 Application Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `DATABASE_URL` | Production database URL | `file:./production.db` |
| `JWT_SECRET` | Secure JWT signing key | `DFfbtoXcDf*IV9M6@c5S%OK4etWHaaOD` |
| `ADMIN_EMAIL` | Admin login email | `hello@alexthip.com` |
| `ADMIN_PASSWORD` | Admin login password | `cAEj05d7TtCf*@zD` |
| `NEXTAUTH_URL` | Full application URL | `https://cook.alexthip.com` |

## 🔑 SSH Key Setup for Deployment

### 1. Generate SSH Key Pair

On your local machine:

```bash
# Generate new SSH key pair
ssh-keygen -t ed25519 -f ~/.ssh/chang-cookbook-deploy -N ""

# Copy public key to server
ssh-copy-id -i ~/.ssh/chang-cookbook-deploy.pub root@YOUR_SERVER_IP

# Test connection
ssh -i ~/.ssh/chang-cookbook-deploy root@YOUR_SERVER_IP "echo 'SSH connection successful'"
```

### 2. Add Private Key to GitHub Secrets

```bash
# Display private key
cat ~/.ssh/chang-cookbook-deploy

# Copy the entire output (including BEGIN/END lines) to DEPLOY_SSH_KEY secret
```

## 🎯 Workflow Triggers and Usage

### 🧪 CI Workflow (`ci.yml`)
**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main`

**What it does:**
- ✅ TypeScript type checking
- ✅ ESLint code linting
- ✅ Next.js application build
- ✅ Security dependency audit
- ✅ Secret scanning with TruffleHog

### 🚀 Deployment Workflow (`deploy.yml`)
**Triggers:**
- Push to `main` branch (automatic)
- Manual trigger with environment selection

**What it does:**
- 🔐 Connects to your Digital Ocean server
- 📤 Syncs code files (excluding sensitive data)
- 🔧 Creates environment configuration
- 🚀 Runs deployment script
- 🔍 Verifies deployment health
- 💾 Creates post-deployment backup

**Manual deployment:**
1. Go to **Actions** → **Deploy to Digital Ocean**
2. Click **Run workflow**
3. Select environment (production/staging)
4. Click **Run workflow**

### 🐳 Docker Workflow (`docker.yml`)
**Triggers:**
- Push to `main` branch
- Version tags (`v*`)
- Manual trigger

**What it does:**
- 🏗️ Builds multi-platform Docker images
- 📦 Pushes to GitHub Container Registry
- 🔒 Runs security vulnerability scanning
- 🚀 Deploys container to production

**Container registry:** `ghcr.io/yourusername/chang-cookbook`

### 🗄️ Database Workflow (`database.yml`)
**Manual operations only:**

1. Go to **Actions** → **Database Operations**
2. Click **Run workflow**
3. Select operation:
   - **migrate** - Run database migrations
   - **backup** - Create database backup
   - **restore** - Restore from backup file
   - **seed** - Import recipe data
4. Enter backup filename (if restoring)
5. Click **Run workflow**

## 🛡️ Environment Protection

### Set Up Production Environment

1. Go to **Settings** → **Environments**
2. Click **New environment**
3. Name: `production`
4. Configure protection rules:
   - ✅ Required reviewers (optional)
   - ✅ Wait timer (optional)
   - ✅ Environment secrets

### Environment-Specific Secrets

You can override repository secrets with environment-specific ones:
- Same secret names as above
- Environment secrets take precedence
- Useful for staging vs production differences

## 📊 Workflow Status and Monitoring

### Monitoring Your Workflows

1. **Actions Tab**: View all workflow runs
2. **Status Badges**: Add to README.md
3. **Email Notifications**: GitHub sends failure notifications
4. **Slack Integration**: Set up workflow notifications

### Status Badges for README

Add these badges to your README.md:

```markdown
![CI](https://github.com/yourusername/chang-cookbook/workflows/CI/badge.svg)
![Deploy](https://github.com/yourusername/chang-cookbook/workflows/Deploy%20to%20Digital%20Ocean/badge.svg)
![Docker](https://github.com/yourusername/chang-cookbook/workflows/Docker%20Build%20and%20Push/badge.svg)
```

## 🔧 Workflow Customization

### Modify Deployment Path

Edit `.github/workflows/deploy.yml`:

```yaml
# Change deployment directory
DEPLOY_PATH: "/home/yourusername/chang-cookbook"  # Your custom path
```

### Add Staging Environment

Create staging-specific secrets and modify workflows:

```yaml
# Add staging trigger
on:
  push:
    branches: [ main, staging ]  # Add staging branch
```

### Custom Build Steps

Edit `.github/workflows/ci.yml` to add:

```yaml
- name: 🧪 Run custom tests
  run: npm run test:custom
  
- name: 📊 Generate coverage report
  run: npm run test:coverage
```

## 🚨 Security Best Practices

### Secret Management
- ✅ Never commit secrets to repository
- ✅ Use environment-specific secrets
- ✅ Rotate secrets regularly
- ✅ Use minimal permissions for SSH keys

### Docker Security
- ✅ Vulnerability scanning enabled
- ✅ Multi-platform builds for compatibility
- ✅ Image signing with Cosign (optional)
- ✅ Regular base image updates

### Deployment Security
- ✅ SSH key-based authentication only
- ✅ Firewall restrictions on server
- ✅ HTTPS enforced for all connections
- ✅ Health checks after deployment

## 🔄 Development Workflow

### Typical Development Flow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-recipe-import
   ```

2. **Make Changes and Push**
   ```bash
   git add .
   git commit -m "Add bulk recipe import feature"
   git push origin feature/new-recipe-import
   ```

3. **Create Pull Request**
   - CI workflow automatically runs
   - Code review and approval
   - Merge to `main`

4. **Automatic Deployment**
   - Deployment workflow triggers
   - Application deployed to production
   - Health checks verify success

### Rollback Process

If deployment fails:

1. **Revert Changes**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Manual Rollback**
   - Use Database workflow to restore backup
   - Restart services if needed

## 🎉 Success! 

Your Chang Cookbook now has **enterprise-grade CI/CD automation**:

- ✅ **Automated Testing** - Every code change is tested
- ✅ **Security Scanning** - Dependencies and secrets monitored  
- ✅ **Zero-Downtime Deployment** - Push to deploy automatically
- ✅ **Database Management** - Migration and backup automation
- ✅ **Container Registry** - Docker images automatically built
- ✅ **Health Monitoring** - Deployment verification built-in

## 📞 Troubleshooting

### Common Issues

**"Permission denied" for SSH**
- Verify SSH key is correct format
- Ensure public key is on server
- Check server firewall rules

**"Secrets not found"**
- Double-check secret names (case-sensitive)
- Verify secrets are set in correct environment
- Ensure repository has access to secrets

**"Docker build failed"**
- Check Dockerfile syntax
- Verify base image availability
- Review build logs for specific errors

**"Database operation failed"**
- Ensure application is running
- Check database file permissions
- Verify backup file exists for restore

### Getting Help

- 📖 [GitHub Actions Documentation](https://docs.github.com/en/actions)
- 🔍 Check workflow logs in Actions tab
- 💬 Review error messages in failed steps
- 🛠️ Test SSH connection manually first

---

**🚀 Your Chang Cookbook is now fully automated with professional DevOps practices!**

*Every push to main will automatically test, build, and deploy your application with zero manual intervention.*