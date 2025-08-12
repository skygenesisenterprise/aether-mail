#!/bin/bash
set -e

# 1. Variables
APP_DIR="/opt/messaging-client" # Dossier de ton app
ONION_DIR="/var/lib/tor/hidden_service"
ONION_HOSTNAME="$ONION_DIR/hostname"

# 2. Build du client
echo "[*] Building client for Tor..."
cd "$APP_DIR"
npm install
npm run build

# 3. Préparation du dossier Tor
echo "[*] Setting up Tor hidden service..."
sudo mkdir -p "$ONION_DIR"
sudo chown -R debian-tor:debian-tor "$ONION_DIR"
sudo chmod 700 "$ONION_DIR"

# 4. Configuration de Tor pour le service Onion
TOR_CONFIG="/etc/tor/torrc"
if ! grep -q "HiddenServiceDir $ONION_DIR" "$TOR_CONFIG"; then
    echo "[*] Adding hidden service to Tor config..."
    echo "HiddenServiceDir $ONION_DIR" | sudo tee -a "$TOR_CONFIG"
    echo "HiddenServicePort 80 127.0.0.1:8080" | sudo tee -a "$TOR_CONFIG"
fi

# 5. Restart Tor
echo "[*] Restarting Tor..."
sudo systemctl restart tor

# 6. Lancement du serveur local (reverse proxy vers build)
echo "[*] Starting local server on port 8080..."
npx serve -s build -l 8080 &

# 7. Affichage de l'adresse Onion
sleep 3
echo "[*] Your .onion service is available at:"
sudo cat "$ONION_HOSTNAME"