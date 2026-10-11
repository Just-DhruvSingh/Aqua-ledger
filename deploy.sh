#!/usr/bin/env bash
# ==============================================================================
# AquaLedger - Production EC2 Deployment & Provisioning Script (Ubuntu 22.04/24.04)
# ==============================================================================
# Configures a fresh AWS EC2 Ubuntu instance from scratch:
# 1. Updates apt repositories and installs system dependencies (Git, curl, build tools, Nginx).
# 2. Installs Node.js v20.x LTS via NodeSource and npm.
# 3. Installs PM2 process manager globally.
# 4. Sets up environment variables and installs root, backend, and frontend dependencies.
# 5. Compiles React frontend into backend/dist for single-server production serving.
# 6. Deploys Node.js Express backend under PM2 with systemd persistence.
# 7. Configures Nginx reverse proxy with WebSocket support for Socket.IO on Port 80.
# ==============================================================================

set -euo pipefail

# Visual terminal output helpers
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_PORT="${PORT:-3000}"

log_info "Starting AquaLedger deployment from directory: ${PROJECT_DIR}"
log_info "Target Node.js internal port: ${APP_PORT}"

# ------------------------------------------------------------------------------
# STEP 1: Update System Packages & Install Base Tools
# ------------------------------------------------------------------------------
log_info "Updating system packages and installing core dependencies..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl git build-essential nginx ufw

# ------------------------------------------------------------------------------
# STEP 2: Install Node.js v20.x LTS from NodeSource
# ------------------------------------------------------------------------------
if ! command -v node >/dev/null 2>&1 || [[ $(node -v | cut -d'.' -f1) != "v20" ]]; then
    log_info "Installing Node.js 20.x LTS from NodeSource repository..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    log_info "Node.js 20.x is already installed: $(node -v)"
fi

log_success "Node.js version: $(node -v)"
log_success "npm version:     $(npm -v)"

# ------------------------------------------------------------------------------
# STEP 3: Install PM2 Process Manager Globally
# ------------------------------------------------------------------------------
if ! command -v pm2 >/dev/null 2>&1; then
    log_info "Installing PM2 globally..."
    sudo npm install -g pm2
else
    log_info "PM2 is already installed: $(pm2 -v)"
fi

# ------------------------------------------------------------------------------
# STEP 4: Environment File Verification
# ------------------------------------------------------------------------------
cd "${PROJECT_DIR}"

# Ensure backend .env exists
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        log_warning "backend/.env not found! Creating from backend/.env.example..."
        cp backend/.env.example backend/.env
        log_warning "IMPORTANT: Edit ${PROJECT_DIR}/backend/.env with real MongoDB & AWS keys!"
    elif [ -f ".env.example" ]; then
        cp .env.example backend/.env
    fi
fi

# Ensure frontend .env exists
if [ -d "frontend" ] && [ ! -f "frontend/.env" ]; then
    if [ -f "frontend/.env.example" ]; then
        cp frontend/.env.example frontend/.env
    fi
fi

export NODE_ENV=production
export PORT="${APP_PORT}"

# ------------------------------------------------------------------------------
# STEP 5: Install Dependencies & Build Single-Server Production Bundle
# ------------------------------------------------------------------------------
log_info "Installing root orchestrator dependencies..."
npm install

log_info "Installing backend dependencies..."
cd "${PROJECT_DIR}/backend"
npm install
cd "${PROJECT_DIR}"

if [ -d "frontend" ]; then
    log_info "Installing frontend dependencies..."
    cd "${PROJECT_DIR}/frontend"
    npm install --legacy-peer-deps
    cd "${PROJECT_DIR}"

    log_info "Building frontend production bundle..."
    npm run build
    log_success "Production frontend build completed and placed in backend/dist"
fi

# ------------------------------------------------------------------------------
# STEP 6: Configure PM2 Daemon & System Startup
# ------------------------------------------------------------------------------
log_info "Configuring PM2 application process..."

# Navigate into backend to run server.js
cd "${PROJECT_DIR}/backend"

pm2 delete aqualedger 2>/dev/null || true

NODE_ENV=production PORT="${APP_PORT}" pm2 start server.js \
    --name "aqualedger" \
    --time \
    --max-memory-restart 500M

pm2 save

log_info "Configuring PM2 startup script for systemd..."
STARTUP_CMD=$(pm2 startup systemd -u "$USER" --hp "$HOME" | grep "sudo env" || true)
if [ -n "${STARTUP_CMD}" ]; then
    eval "${STARTUP_CMD}"
fi

cd "${PROJECT_DIR}"

# ------------------------------------------------------------------------------
# STEP 7: Configure Nginx Reverse Proxy with Socket.IO Support
# ------------------------------------------------------------------------------
log_info "Setting up Nginx reverse proxy configuration on Port 80..."

NGINX_CONF="/etc/nginx/sites-available/aqualedger"

sudo bash -c "cat > ${NGINX_CONF}" <<EOF
# AquaLedger Nginx Reverse Proxy Configuration
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 25M;

    # Gzip Compression for static React assets
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;

    # Standard REST API and React SPA route forwarding
    location / {
        proxy_pass http://127.0.0.1:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Dedicated Socket.IO WebSocket reverse proxy block
    location /socket.io/ {
        proxy_pass http://127.0.0.1:${APP_PORT}/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket connection keep-alive timeout
        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
EOF

sudo ln -sf "${NGINX_CONF}" /etc/nginx/sites-enabled/aqualedger
sudo rm -f /etc/nginx/sites-enabled/default

log_info "Testing Nginx configuration syntax..."
sudo nginx -t

log_info "Restarting Nginx service..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# ------------------------------------------------------------------------------
# STEP 8: Firewall Configuration & Health Verification
# ------------------------------------------------------------------------------
log_info "Configuring UFW Firewall (allowing SSH and HTTP)..."
sudo ufw allow OpenSSH || true
sudo ufw allow 'Nginx Full' || true

sleep 2

log_info "Testing backend health endpoint on http://127.0.0.1:${APP_PORT}/health..."
if curl -sf "http://127.0.0.1:${APP_PORT}/health" >/dev/null; then
    log_success "Internal health check passed!"
else
    log_warning "Internal health check did not respond immediately. Check PM2 logs: pm2 logs aqualedger"
fi

echo -e "\n=============================================================================="
log_success "🎉 AquaLedger deployed successfully to AWS EC2!"
echo -e "=============================================================================="
echo -e "• PM2 Process Status:    pm2 status"
echo -e "• Live Logs:             pm2 logs aqualedger"
echo -e "• Nginx Status:          sudo systemctl status nginx"
echo -e "• Web Access:            http://$(curl -s ifconfig.me || echo '<YOUR_EC2_PUBLIC_IP>')/"
echo -e "==============================================================================\n"
