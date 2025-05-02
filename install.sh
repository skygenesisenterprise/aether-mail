#!/bin/bash

# Vérifier si le script est exécuté en tant que root
if [[ $EUID -ne 0 ]]; then
   echo "Ce script doit être exécuté en tant que root."
   exit 1
fi

# Mettre à jour les paquets
echo "Mise à jour des paquets..."
apt-get update

# Installer les dépendances nécessaires
echo "Installation des dépendances..."
apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    libssl-dev \
    pkg-config \
    nodejs \
    npm

# Cloner le dépôt du projet
echo "Clonage du dépôt du projet..."
git clone https://github.com/Sky-Genesis-Enterprise/aether-mail.git /opt/aether-mail

# Naviguer vers le répertoire du projet
cd /opt/aether-mail

# Installer les dépendances spécifiques au projet
echo "Installation des dépendances spécifiques au projet..."
npm install

# Exécuter la commande de build
echo "Exécution de la commande de build..."
npm run build

# Configurer les fichiers nécessaires
echo "Configuration des fichiers..."
# Copier les fichiers de configuration, créer des répertoires, etc.
# cp config/example.config /etc/aether-mail/config
# mkdir -p /var/log/aether-mail

# Créer un service systemd pour Aether Mail
echo "Création d'un service systemd..."
cat <<EOF > /etc/systemd/system/aether-mail.service
[Unit]
Description=Aether Mail Service
After=network.target

[Service]
ExecStart=/opt/aether-mail/start.sh
WorkingDirectory=/opt/aether-mail
StandardOutput=inherit
StandardError=inherit
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF

# Recharger systemd pour prendre en compte le nouveau service
systemctl daemon-reload

# Démarrer et activer le service Aether Mail
echo "Démarrage et activation du service Aether Mail..."
systemctl start aether-mail
systemctl enable aether-mail

echo "Installation terminée. Aether Mail est maintenant installé et en cours d'exécution."