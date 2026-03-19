#!/bin/bash

# Aether Identity Frontend Development Script
# Démarrage direct avec contournement de la structure Next.js

set -e

echo "🚀 Aether Identity - Démarrage direct depuis app/..."

# Variables d'environnement
export NODE_ENV=${NODE_ENV:-development}
export PORT=${PORT:-3001}
export NEXT_TELEMETRY_DISABLED=1

echo "📍 Configuration:"
echo "  - Répertoire: $(pwd)"
echo "  - NODE_ENV: $NODE_ENV"
echo "  - PORT: $PORT"
echo ""

# Fonction pour compter les fichiers dans node_modules
count_node_modules_files() {
    if [ -d "node_modules" ]; then
        find node_modules -maxdepth 2 -type f 2>/dev/null | wc -l
    else
        echo "0"
    fi
}

# Vérification et installation des dépendances
echo "🔍 Vérification de node_modules..."

if [ ! -d "node_modules" ]; then
    echo "📦 node_modules inexistant, installation en cours..."
    pnpm install
    echo "✅ Installation terminée"
elif [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
    echo "📦 node_modules existe mais est vide, installation en cours..."
    pnpm install
    echo "✅ Installation terminée"
else
    FILE_COUNT=$(count_node_modules_files)
    if [ "$FILE_COUNT" -lt 10 ]; then
        echo "📦 node_modules semble incomplet ($FILE_COUNT fichiers), réinstallation..."
        rm -rf node_modules
        pnpm install
        echo "✅ Réinstallation terminée"
    else
        echo "✅ node_modules déjà installé ($FILE_COUNT fichiers)"
    fi
fi

# Vérification finale que next est disponible
if [ ! -f "node_modules/.bin/next" ]; then
    echo "❌ ERREUR: node_modules/.bin/next n'existe pas malgré l'installation"
    echo "📦 Tentative de réinstallation forcée..."
    rm -rf node_modules
    pnpm install
fi

# Nettoyage de .next (avec vérification de volume)
echo "🧹 Nettoyage de .next..."

if [ -L ".next" ]; then
    echo "   ℹ️  .next est un symlink (volume), nettoyage ignoré"
elif command -v mountpoint >/dev/null 2>&1; then
    if mountpoint -q .next 2>/dev/null; then
        echo "   ℹ️  .next est un volume monté, nettoyage ignoré"
    else
        rm -rf .next 2>/dev/null && echo "   ✅ .next nettoyé" || echo "   ℹ️  .next inexistant"
    fi
else
    # Si mountpoint n'est pas disponible, essayer de supprimer silencieusement
    if rm -rf .next 2>/dev/null; then
        echo "   ✅ .next nettoyé"
    else
        echo "   ℹ️  .next ne peut pas être supprimé (probablement un volume), ignoré"
    fi
fi

echo "🔧 Démarrage de Next.js (mode direct)..."
echo "🌐 Accès: http://localhost:$PORT"
echo ""

# Vérification finale
if [ ! -f "node_modules/.bin/next" ]; then
    echo "❌ ERREUR CRITIQUE: Impossible de trouver node_modules/.bin/next"
    echo "📋 Contenu de node_modules/.bin:"
    ls -la node_modules/.bin/ 2>/dev/null || echo "   (répertoire inexistant)"
    exit 1
fi

# Démarrage de Next.js
exec node_modules/.bin/next dev --port "$PORT" --hostname 0.0.0.0