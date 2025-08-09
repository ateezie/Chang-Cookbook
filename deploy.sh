#!/bin/bash
set -e

# Chang Cookbook - Deployment Script for Digital Ocean Droplet
echo "🚀 Starting Chang Cookbook deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="chang-cookbook"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.local exists
if [ ! -f .env.local ]; then
    print_error ".env.local file not found!"
    print_warning "Please copy .env.production to .env.local and update the values:"
    print_warning "cp .env.production .env.local"
    print_warning "nano .env.local  # Edit with your production values"
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p data/database
mkdir -p data/uploads  
mkdir -p data/logs
mkdir -p backups

# Backup existing database if it exists
if [ -f "data/database/production.db" ]; then
    print_status "Backing up existing database..."
    mkdir -p $BACKUP_DIR
    cp data/database/production.db $BACKUP_DIR/
    print_status "Database backed up to $BACKUP_DIR"
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker compose down || true

# Build and start the application
print_status "Building and starting Chang Cookbook..."
docker compose up --build -d

# Wait for the application to be ready
print_status "Waiting for application to be ready..."
sleep 10

# Database initialization is now handled automatically in the container startup
print_status "Database will initialize automatically on startup..."

# Check if the application is running
print_status "Checking application health..."
if curl -f http://localhost:3000/api/recipes > /dev/null 2>&1; then
    print_status "✅ Chang Cookbook is running successfully!"
    print_status "🌐 Your application is available at: http://your-server-ip:3000"
    print_status "👨‍💼 Admin panel: http://your-server-ip:3000/admin"
    print_status ""
    print_status "📋 Next steps:"
    print_status "1. Set up a reverse proxy (nginx) for SSL and domain"
    print_status "2. Configure your domain DNS to point to this server"
    print_status "3. Set up automated backups"
else
    print_error "❌ Application health check failed"
    print_warning "Check logs with: docker compose logs chang-cookbook"
    exit 1
fi

print_status "🎉 Deployment completed successfully!"