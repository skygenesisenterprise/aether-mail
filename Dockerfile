# Étape 1 : Construire le frontend
FROM node:23-slim AS frontend-builder

# Définir le répertoire de travail pour le frontend
WORKDIR /app/frontend

# Copier les fichiers nécessaires pour le frontend
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY src ./src

# Ajouter un argument pour l'environnement
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Installer les dépendances et construire le frontend
RUN npm install
RUN if [ "$NODE_ENV" = "production" ]; then npm run build:frontend; fi

# Étape 2 : Construire le backend
FROM node:23-slim AS backend-builder

# Définir le répertoire de travail pour le backend
WORKDIR /app/backend

# Copier les fichiers nécessaires pour le backend
COPY package*.json ./
COPY tsconfig.server.json ./
COPY api ./api

# Ajouter un argument pour l'environnement
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Installer les dépendances et compiler le backend
RUN npm install
RUN if [ "$NODE_ENV" = "production" ]; then npm run build:backend; fi

# Étape 3 : Combiner backend et frontend
FROM node:23-slim

# Définir le répertoire de travail final
WORKDIR /app

# Copier les fichiers compilés du backend
COPY --from=backend-builder /app/backend/dist ./dist/backend

# Copier les fichiers compilés du frontend dans le backend
COPY --from=frontend-builder /app/frontend/dist ./dist/frontend

# Installer uniquement les dépendances de production
COPY package*.json ./
RUN if [ "$NODE_ENV" = "production" ]; then npm install --only=production; else npm install; fi

# Exposer le port du backend
EXPOSE 5000

# Commande pour démarrer le backend
CMD ["node", "./dist/backend/server.js"]