# Étape 1 : Construire le frontend
FROM node:23-slime AS frontend-builder

# Définir le répertoire de travail pour le frontend
WORKDIR /app/frontend

# Copier les fichiers nécessaires pour le frontend
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY src ./src

# Installer les dépendances et construire le frontend
RUN npm install
RUN npm run build:frontend

# Étape 2 : Construire le backend
FROM node:23-slime AS backend-builder

# Définir le répertoire de travail pour le backend
WORKDIR /app/backend

# Copier les fichiers nécessaires pour le backend
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

# Installer les dépendances et compiler le backend
RUN npm install
RUN npm run build:backend

# Étape 3 : Combiner backend et frontend
FROM node:23-slime

# Définir le répertoire de travail final
WORKDIR /app

# Copier les fichiers compilés du backend
COPY --from=backend-builder /app/backend/dist ./dist

# Copier les fichiers compilés du frontend dans le backend
COPY --from=frontend-builder /app/frontend/dist ./dist/frontend

# Installer uniquement les dépendances de production
COPY package*.json ./
RUN npm install --only=production

# Exposer le port du backend
EXPOSE 5000

# Commande pour démarrer le backend
CMD ["node", "./dist/server.js"]