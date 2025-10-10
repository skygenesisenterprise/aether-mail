# Étape 1 : Construire l'application complète
FROM node:20-alpine AS builder

# Installer les dépendances système nécessaires
RUN apk add --no-cache \
    git \
    curl \
    && rm -rf /var/cache/apk/*

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY bun.lock ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.server.json ./

# Installer les dépendances
RUN npm ci --only=production=false

# Copier le code source
COPY . .

# Ajouter un argument pour l'environnement
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Construire l'application
RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi

# Étape 2 : Image de production optimisée
FROM node:20-alpine AS production

# Installer les dépendances système pour la production
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S aethermail -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production && npm cache clean --force

# Copier les fichiers compilés depuis l'étape de build
COPY --from=builder --chown=aethermail:nodejs /app/dist ./dist

# Créer les répertoires nécessaires avec les bonnes permissions
RUN mkdir -p logs && \
    chown -R aethermail:nodejs /app

# Passer à l'utilisateur non-root
USER aethermail

# Exposer le port du backend
EXPOSE 4000

# Utiliser dumb-init pour gérer les signaux correctement
ENTRYPOINT ["dumb-init", "--"]

# Commande pour démarrer l'application
CMD ["node", "./dist/backend/server.js"]