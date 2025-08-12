#!/bin/bash
set -e

# Variables
APP_DIR="/opt/aethermail"          # Dossier de l'app
NGINX_DIR="/var/www/aethermail"    # Dossier pour servir les fichiers
NGINX_CONF="/etc/nginx/sites-available/aethermail"
DOMAIN="app.aethermail.me"         # À adapter à ton domaine ou IP
SSL_DIR="/etc/ssl/aethermail"

# 1. Build client
echo "[*] Building client..."
cd "$APP_DIR"
npm install
npm run build

# 2. Déploiement build dans Nginx web root
echo "[*] Deploying build to Nginx directory..."
sudo mkdir -p "$NGINX_DIR"
sudo rm -rf "$NGINX_DIR"/*
sudo cp -r build/* "$NGINX_DIR"/

# 3. Génération certificat SSL auto-signé si pas déjà existant
if [ ! -f "$SSL_DIR/$DOMAIN.key" ] || [ ! -f "$SSL_DIR/$DOMAIN.crt" ]; then
    echo "[*] Generating self-signed SSL certificate..."
    sudo mkdir -p "$SSL_DIR"
    sudo openssl req -x509 -nodes -days 365 \
      -newkey rsa:2048 \
      -keyout "$SSL_DIR/$DOMAIN.key" \
      -out "$SSL_DIR/$DOMAIN.crt" \
      -subj "/C=FR/ST=Paris/L=Paris/O=SkyGenesis Enterprise/CN=$DOMAIN"
fi

# 4. Configuration Nginx complète (HTTP + HTTPS)
if [ ! -f "$NGINX_CONF" ]; then
    echo "[*] Creating Nginx configuration..."
    sudo tee "$NGINX_CONF" > /dev/null <<EOL
server {
    listen 80;
    server_name $DOMAIN;

    # Redirection HTTP vers HTTPS
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    root $NGINX_DIR;
    index index.html;

    ssl_certificate $SSL_DIR/$DOMAIN.crt;
    ssl_certificate_key $SSL_DIR/$DOMAIN.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384";

    # Logs
    access_log /var/log/nginx/aethermail-access.log;
    error_log /var/log/nginx/aethermail-error.log;

    # Sécurité HTTP Headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy no-referrer-when-downgrade;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'";

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 256;
    gzip_vary on;

    # Limiter la taille des uploads
    client_max_body_size 10M;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback — rediriger toutes les requêtes vers index.html sauf fichiers existants
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOL
    sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/aethermail
fi

# 5. Tester la config et recharger Nginx
echo "[*] Testing Nginx configuration..."
sudo nginx -t

echo "[*] Reloading Nginx service..."
sudo systemctl reload nginx

echo "[*] Deployment complete! Access your client at https://$DOMAIN"
