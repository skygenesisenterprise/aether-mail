# =============================================================================
# Aether Mail - Multi-Stage Docker Build
# =============================================================================
# Ce Dockerfile utilise la nouvelle architecture avec containers séparés
# Il peut être utilisé pour un déploiement monolithique ou comme référence
# =============================================================================

# -----------------------------------------------------------------------------
# Étape 1: Build du Backend Rust
# -----------------------------------------------------------------------------
FROM rust:1.75-slim as backend-builder

# Installation des dépendances système pour Rust
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier les fichiers Cargo
COPY Cargo.toml Cargo.lock ./
COPY api/Cargo.toml ./api/
COPY api/src ./api/src

# Builder le backend
WORKDIR /app/api
RUN cargo build --release

# -----------------------------------------------------------------------------
# Étape 2: Build du Frontend Node.js
# -----------------------------------------------------------------------------
FROM node:20-alpine as frontend-builder

# Installation de pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copier les fichiers de dépendances frontend
COPY package.json pnpm-lock.yaml* ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY index.html ./

# Copier les sources frontend
COPY app/ ./app/
COPY public/ ./public/

# Installation des dépendances et build
RUN pnpm install --frozen-lockfile
RUN npx prisma generate
RUN pnpm run build

# -----------------------------------------------------------------------------
# Étape 3: Image de production monolithique
# -----------------------------------------------------------------------------
FROM debian:13-slim

# Installation des dépendances runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    postgresql-client \
    nginx \
    supervisor \
    libpq5 \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Création de l'utilisateur non-root
RUN addgroup --system aethermail && adduser --system --ingroup aethermail aethermail

# Préparation des répertoires
RUN mkdir -p /app/backend /app/frontend /var/log/supervisor /var/lib/nginx /run/nginx
WORKDIR /app

# Copier le backend compilé
COPY --from=backend-builder /app/api/target/release/api /app/backend/

# Copier les fichiers frontend buildés
COPY --from=frontend-builder /app/dist /app/frontend/

# Copier les configurations
COPY nginx.monolith.conf /etc/nginx/sites-enabled/default
COPY supervisord.conf /etc/supervisord.conf

# Copier les fichiers de configuration Prisma
COPY prisma/ ./prisma/

# Permissions
RUN chown -R aethermail:aethermail /app /var/lib/nginx /var/log/nginx /run/nginx

# Utilisateur non-root
USER aethermail

# Exposer les ports
EXPOSE 80 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Démarrage avec supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

# =============================================================================
# Alternative: Utilisation des containers séparés (recommandé)
# =============================================================================
# 
# Pour une architecture avec containers séparés, utilisez:
# - Dockerfile.backend (pour le backend Rust)
# - Dockerfile.frontend (pour le frontend Nginx)
# - docker-compose.separated.yml (pour orchestrer les services)
#
# Commandes:
#   docker-compose -f docker-compose.separated.yml up -d --build
#
# =============================================================================