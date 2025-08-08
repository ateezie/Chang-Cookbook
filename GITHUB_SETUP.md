# 🚀 GitHub Setup Guide for Chang Cookbook

This guide will help you deploy your Chang Cookbook project to GitHub and set up version control.

## 📋 Prerequisites

- Git installed on your machine
- GitHub account created
- Chang Cookbook project ready locally

## 🔧 Step 1: Prepare Your Local Repository

Your repository is already initialized! The following steps were completed:

1. ✅ **Git repository initialized** (`git init`)
2. ✅ **Comprehensive .gitignore created** (excludes sensitive files)
3. ✅ **README.md updated** with project documentation

## 🌐 Step 2: Create GitHub Repository

### Option A: Using GitHub Web Interface (Recommended)

1. **Go to GitHub**
   - Visit [github.com](https://github.com)
   - Click the "+" button in top right corner
   - Select "New repository"

2. **Repository Settings**
   ```
   Repository name: chang-cookbook
   Description: A modern React/Next.js recipe website with warm, personal brand identity
   Visibility: Public (recommended) or Private
   
   ❌ Do NOT initialize with:
   - README (we already have one)
   - .gitignore (we already have one)  
   - License (can add later)
   ```

3. **Create Repository**
   - Click "Create repository"
   - Copy the repository URL (e.g., `https://github.com/yourusername/chang-cookbook.git`)

### Option B: Using GitHub CLI (Alternative)

```bash
# Install GitHub CLI if not already installed
# Windows: winget install GitHub.cli
# Mac: brew install gh

# Login to GitHub
gh auth login

# Create repository directly from terminal
gh repo create chang-cookbook --public --description "A modern React/Next.js recipe website"
```

## 📤 Step 3: Connect Local Repository to GitHub

```bash
# Add GitHub remote (replace with your actual repository URL)
git remote add origin https://github.com/yourusername/chang-cookbook.git

# Verify remote was added
git remote -v
```

## 💾 Step 4: Make Initial Commit

```bash
# Add all files to staging
git add .

# Check what will be committed (review the list)
git status

# Create initial commit
git commit -m "Initial commit: Chang Cookbook with complete brand identity and admin system

🍳 Features included:
- Complete recipe management system with admin panel
- 21+ imported recipes with categories and search
- Warm Chang brand identity (colors, typography, logos)
- Database-driven with Prisma ORM
- Docker deployment configuration
- Responsive design with Tailwind CSS
- SEO optimization and structured data

🚀 Generated with Claude Code (https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## 🚀 Step 5: Push to GitHub

```bash
# Push to GitHub (first time)
git push -u origin main

# For future pushes, just use:
# git push
```

## ✅ Step 6: Verify Deployment

1. **Visit Your Repository**
   - Go to `https://github.com/yourusername/chang-cookbook`
   - Verify all files are uploaded correctly
   - Check that README.md displays properly

2. **Repository Should Include:**
   - ✅ Complete source code
   - ✅ Database schema and migrations  
   - ✅ Docker deployment configuration
   - ✅ Comprehensive documentation
   - ✅ Recipe data and import scripts
   - ✅ Admin panel and authentication

## 🔒 Security Check

Your repository is configured to **exclude** sensitive information:

- ✅ Environment variables (`.env*` files)
- ✅ Database files (`*.db`)
- ✅ User uploads and data
- ✅ Node modules and build artifacts
- ✅ Backup files

The `.env.production` template is included but contains only placeholders.

## 🌟 Optional Enhancements

### 1. Add Repository Topics

On your GitHub repository page:
1. Click the gear icon next to "About"
2. Add topics: `nextjs`, `react`, `recipe-website`, `tailwind-css`, `prisma`, `typescript`, `docker`

### 2. Create Repository Description

Update your repository description:
```
A production-ready recipe website with admin panel, brand identity, and Docker deployment. Built with Next.js, React, TypeScript, and Tailwind CSS.
```

### 3. Set Up Repository Settings

**Recommended settings:**
- ✅ Enable Issues (for bug reports and feature requests)
- ✅ Enable Discussions (for community interaction)
- ✅ Allow squash merging (clean commit history)
- ✅ Enable automatic deletion of head branches

### 4. Add License

Create a `LICENSE` file if you want to make it clear how others can use your code:
```bash
# Add MIT License (popular choice for open source)
curl -s https://api.github.com/licenses/mit | jq -r .body > LICENSE
git add LICENSE
git commit -m "Add MIT License"
git push
```

## 🔄 Daily Workflow

### Making Changes

```bash
# Check current status
git status

# Add specific files or all changes
git add filename.js
# or
git add .

# Commit with descriptive message
git commit -m "Add new recipe: Thai Green Curry

- Add complete recipe data with ingredients and instructions
- Update category filtering to include Thai cuisine
- Add recipe image and SEO metadata"

# Push to GitHub
git push
```

### Keeping Repository Clean

```bash
# Check what's being tracked
git ls-files

# Remove accidentally committed files
git rm --cached filename.log
echo "filename.log" >> .gitignore
git commit -m "Remove accidentally committed log file"
```

## 🚀 Deployment from GitHub

### Deploy to Digital Ocean from GitHub

```bash
# On your server, clone from GitHub instead of uploading files
git clone https://github.com/yourusername/chang-cookbook.git /opt/chang-cookbook
cd /opt/chang-cookbook

# Continue with normal deployment
cp .env.production .env.local
nano .env.local
./deploy.sh
```

### Set Up Continuous Deployment (Advanced)

Create `.github/workflows/deploy.yml` for automatic deployment:
```yaml
name: Deploy to Digital Ocean
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            cd /opt/chang-cookbook
            git pull origin main
            ./deploy.sh
```

## 🎉 Success!

Your Chang Cookbook is now on GitHub! 

**🔗 Repository URL:** `https://github.com/yourusername/chang-cookbook`

**Next Steps:**
1. ⭐ Star your own repository
2. 📝 Create your first Issue or Discussion
3. 🚀 Deploy directly from GitHub to your server
4. 👥 Invite collaborators if working with a team
5. 📊 Set up GitHub Pages for documentation (optional)

## 📞 Troubleshooting

### Common Issues

**"Repository already exists"**
```bash
# If you need to change the remote URL
git remote set-url origin https://github.com/yourusername/new-repo-name.git
```

**"Permission denied"**
```bash
# Check your SSH keys or use HTTPS authentication
git remote set-url origin https://github.com/yourusername/chang-cookbook.git
```

**"Working tree has changes"**
```bash
# Commit or stash changes before pushing
git status
git add .
git commit -m "Save current work"
git push
```

### Getting Help

- 📖 [GitHub Docs](https://docs.github.com)
- 💬 [GitHub Community](https://github.community)
- 🔍 [Git Documentation](https://git-scm.com/doc)

---

**Happy coding and cooking! 🍳✨**

*Your Chang Cookbook is now ready to share with the world!*