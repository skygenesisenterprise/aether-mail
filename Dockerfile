# Base Debian 13 slim
FROM debian:13-slim

# ---------------------------
# Étape 1 : Installation système
# ---------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    build-essential \
    git \
    postgresql-client \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------
# Étape 2 : Installation Node.js 20 et PNPM
# ---------------------------
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm@latest \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------
# Étape 3 : Préparation du répertoire de travail
# ---------------------------
RUN mkdir -p /app /var/log/supervisor /var/lib/nginx /run/nginx
WORKDIR /app

# ---------------------------
# Étape 4 : Installation des dépendances avec PNPM
# ---------------------------
# On copie d'abord les fichiers de dépendances
COPY pnpm-lock.yaml package.json ./

# Utilisation du cache PNPM (optimise les builds Docker)
RUN pnpm fetch

# ---------------------------
# Étape 5 : Copier le code et builder
# ---------------------------
COPY . .

# Modifier Prisma pour PostgreSQL
RUN sed -i 's|url = "file:./data/aethermail.db"|url = "postgresql://aethermail:aethermail_password@localhost:5432/aethermail"|g' prisma/schema.prisma

# Installer les dépendances (basé sur le cache précédemment créé)
RUN pnpm install --offline

# Générer Prisma client et build du projet
RUN npx prisma generate && pnpm run build

# ---------------------------
# Étape 6 : Config Nginx & Supervisor
# ---------------------------
COPY nginx.conf /etc/nginx/sites-enabled/default
COPY supervisord.conf /etc/supervisord.conf

# ---------------------------
# Étape 7 : Sécurité et utilisateur non-root
# ---------------------------
RUN addgroup --system aethermail && adduser --system --ingroup aethermail aethermail
RUN chown -R aethermail:aethermail /app /var/lib/nginx /var/log/nginx /run/nginx

USER aethermail

# ---------------------------
# Étape 8 : Exposition & Démarrage
# ---------------------------
EXPOSE 4000
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
