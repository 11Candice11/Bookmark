#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# deploy.sh  —  Push the latest code to EC2 and restart services.
#
# Usage (from the repo root):
#   ./deploy.sh
#
# What it does:
#   1. Bootstraps Docker + Certbot on the instance (idempotent)
#   2. Rsyncs code to the instance
#   3. Uploads .env.production
#   4. Builds images and starts services via docker compose
#   5. Obtains/renews a Let's Encrypt cert for the domain and installs
#      an nginx reverse proxy on the host that terminates TLS and forwards
#      to the Docker containers
# ---------------------------------------------------------------------------

set -euo pipefail

# ── Config ──────────────────────────────────────────────────────────────────
EC2_HOST="16.171.129.46"
EC2_USER="ubuntu"
PEM_FILE="aws/BookmarkKey.pem"
REMOTE_DIR="/home/ubuntu/bookmark"
COMPOSE_FILE="docker-compose.prod.yml"
DOMAIN="bookmark.lolo.pro"
EMAIL="admin@lolo.pro"   # used for Let's Encrypt expiry notices

SSH="ssh -i ${PEM_FILE} -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST}"
SCP="scp -i ${PEM_FILE} -o StrictHostKeyChecking=no"

echo "==> Fixing PEM permissions"
chmod 400 "${PEM_FILE}"

# ── 1. Bootstrap Docker + Certbot ───────────────────────────────────────────
echo "==> Bootstrapping instance"
$SSH 'bash -s' << 'BOOTSTRAP'
set -euo pipefail

# ---- Docker ----
if ! command -v docker &>/dev/null; then
  echo "Installing Docker..."
  sudo apt-get update -qq
  sudo apt-get install -y ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
    https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update -qq
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  sudo usermod -aG docker ubuntu
  echo "Docker installed."
else
  echo "Docker already present."
fi

# ---- Certbot + nginx (host-level, for TLS termination) ----
if ! command -v certbot &>/dev/null; then
  echo "Installing nginx + certbot..."
  sudo apt-get update -qq
  sudo apt-get install -y nginx certbot python3-certbot-nginx
  echo "certbot installed."
else
  echo "certbot already present."
fi
BOOTSTRAP

# ── 2. Sync code ─────────────────────────────────────────────────────────────
echo "==> Syncing code to ${EC2_HOST}:${REMOTE_DIR}"
$SSH "mkdir -p ${REMOTE_DIR}"

rsync -az --delete \
  -e "ssh -i ${PEM_FILE} -o StrictHostKeyChecking=no" \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.backup' \
  --exclude='aws' \
  --exclude='.env' \
  --exclude='.env.production' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='coverage' \
  ./ "${EC2_USER}@${EC2_HOST}:${REMOTE_DIR}/"

# ── 3. Upload .env.production ─────────────────────────────────────────────────
if [[ -f ".env.production" ]]; then
  echo "==> Uploading .env.production"
  $SCP .env.production "${EC2_USER}@${EC2_HOST}:${REMOTE_DIR}/.env.production"
else
  echo ""
  echo "  ⚠️  WARNING: .env.production not found locally."
  echo "  Copy .env.production.example → .env.production, fill in real values,"
  echo "  then run ./deploy.sh again."
  echo ""
  exit 1
fi

# ── 4. Build & start Docker services ─────────────────────────────────────────
echo "==> Building and starting services on EC2"
$SSH "bash -s" << REMOTE
set -euo pipefail
cd ${REMOTE_DIR}

# Docker needs the group session — use sg to pick it up without re-login
RUN_DOCKER="sg docker -c"

\$RUN_DOCKER "docker compose -f ${COMPOSE_FILE} --env-file .env.production build --no-cache"
\$RUN_DOCKER "docker compose -f ${COMPOSE_FILE} --env-file .env.production up -d --remove-orphans"

echo "==> Container status:"
\$RUN_DOCKER "docker compose -f ${COMPOSE_FILE} ps"
REMOTE

# ── 5. Obtain TLS cert and configure host nginx ───────────────────────────────
echo "==> Setting up HTTPS for ${DOMAIN}"
$SSH "bash -s" << TLSSETUP
set -euo pipefail

DOMAIN="${DOMAIN}"
EMAIL="${EMAIL}"

# Write a minimal HTTP-only nginx vhost so certbot's HTTP-01 challenge works.
# (Docker's nginx is on port 80 inside Docker; host nginx is also on 80 — but
#  Docker published port 80 blocks the host.  We stop Docker's client container
#  temporarily, get the cert, then reconfigure everything.)

# Stop only the client container so the API keeps running
cd ${REMOTE_DIR}
sg docker -c "docker compose -f ${COMPOSE_FILE} stop client" 2>/dev/null || true

# Ensure host nginx is running and can serve port 80
sudo systemctl start nginx || true

# Write a temporary nginx config for the ACME challenge
sudo tee /etc/nginx/sites-available/bookmark-temp > /dev/null << 'NGINXTEMP'
server {
    listen 80;
    server_name bookmark.lolo.pro;
    location / { return 200 'ok'; }
}
NGINXTEMP

sudo ln -sf /etc/nginx/sites-available/bookmark-temp /etc/nginx/sites-enabled/bookmark-temp
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Obtain / renew certificate
if sudo certbot certificates 2>/dev/null | grep -q "\${DOMAIN}"; then
  echo "Certificate already exists — renewing if needed."
  sudo certbot renew --quiet --nginx
else
  sudo certbot --nginx \
    -d "\${DOMAIN}" \
    --non-interactive \
    --agree-tos \
    -m "\${EMAIL}" \
    --redirect
fi

# Write the final nginx config: terminate TLS, forward HTTP→HTTPS,
# proxy / → Docker client (port 80 inside), proxy /api → Docker server (4000).
sudo tee /etc/nginx/sites-available/bookmark > /dev/null << 'NGINXFINAL'
# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name bookmark.lolo.pro;
    return 301 https://\$host\$request_uri;
}

# HTTPS
server {
    listen 443 ssl;
    server_name bookmark.lolo.pro;

    ssl_certificate     /etc/letsencrypt/live/bookmark.lolo.pro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bookmark.lolo.pro/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Frontend (Docker client container on port 3000 on the host)
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto https;
    }

    # API (Docker server container on port 4000 on the host)
    location /api/ {
        proxy_pass         http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto https;
    }
}
NGINXFINAL

sudo ln -sf /etc/nginx/sites-available/bookmark /etc/nginx/sites-enabled/bookmark
sudo rm -f /etc/nginx/sites-enabled/bookmark-temp
sudo nginx -t && sudo systemctl reload nginx

# Restart the client container (it now only needs to serve on the Docker network;
# we change its published port to 3000 so host nginx can reach it)
cd ${REMOTE_DIR}
sg docker -c "docker compose -f ${COMPOSE_FILE} up -d client"

echo "TLS setup complete."
TLSSETUP

echo ""
echo "✅  Deploy complete!"
echo "   Frontend  → https://${DOMAIN}"
echo "   API       → https://${DOMAIN}/api/health"
echo ""
