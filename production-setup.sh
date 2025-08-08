#!/bin/bash
set -e

# Chang Cookbook - Production Server Setup Script for Digital Ocean
echo "🏗️ Setting up Chang Cookbook production environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

print_header "Installing system dependencies..."

# Update system packages
apt update && apt upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    # Add current user to docker group
    usermod -aG docker $SUDO_USER
    print_status "Docker installed successfully"
else
    print_status "Docker already installed"
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_status "Docker Compose installed successfully"
else
    print_status "Docker Compose already installed"
fi

# Install other useful tools
print_status "Installing additional tools..."
apt install -y curl wget git nginx certbot python3-certbot-nginx ufw htop

# Configure UFW firewall
print_status "Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000  # For direct access during setup
print_status "Firewall configured"

# Create application directory
APP_DIR="/opt/chang-cookbook"
print_status "Creating application directory at $APP_DIR"
mkdir -p $APP_DIR
chown -R $SUDO_USER:$SUDO_USER $APP_DIR

print_header "Setting up Chang Cookbook application..."

# Switch to application user
sudo -u $SUDO_USER bash << EOF
cd $APP_DIR

# Clone or copy your application here
print_status "Application directory ready at $APP_DIR"
print_status "Next steps:"
print_status "1. Copy your Chang Cookbook files to $APP_DIR"
print_status "2. Copy .env.production to .env.local and update the values"
print_status "3. Run the deployment script: ./deploy.sh"
EOF

# Create systemd service for auto-start
print_status "Creating systemd service..."
cat > /etc/systemd/system/chang-cookbook.service << EOF
[Unit]
Description=Chang Cookbook
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
User=$SUDO_USER

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable chang-cookbook
print_status "Systemd service created and enabled"

print_header "Basic Nginx configuration..."
# Create basic nginx config
cat > /etc/nginx/sites-available/chang-cookbook << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

# Enable the site (commented out until domain is configured)
# ln -sf /etc/nginx/sites-available/chang-cookbook /etc/nginx/sites-enabled/
# systemctl reload nginx

print_status "✅ Production server setup completed!"
print_status ""
print_status "📋 Next steps:"
print_status "1. Copy your Chang Cookbook application to: $APP_DIR"
print_status "2. Configure your environment: cp .env.production .env.local && nano .env.local"
print_status "3. Update domain in nginx config: /etc/nginx/sites-available/chang-cookbook"
print_status "4. Enable nginx site: ln -sf /etc/nginx/sites-available/chang-cookbook /etc/nginx/sites-enabled/"
print_status "5. Reload nginx: systemctl reload nginx"
print_status "6. Run deployment: ./deploy.sh"
print_status "7. Set up SSL with: certbot --nginx -d your-domain.com"
print_status ""
print_status "🔧 Useful commands:"
print_status "- View logs: docker-compose logs -f chang-cookbook"
print_status "- Restart app: systemctl restart chang-cookbook"
print_status "- Check status: docker-compose ps"