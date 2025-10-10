# Docker Setup for Aether Mail

Ce guide explique comment utiliser Docker pour développer et déployer Aether Mail.

## Prérequis

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB espace disque

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
# Base de données
DATABASE_URL="postgresql://aethermail:password@localhost:5432/aethermail_dev"
POSTGRES_USER=aethermail
POSTGRES_PASSWORD=password

# Authentification
BETTER_AUTH_URL="http://localhost:4000"
BETTER_AUTH_SECRET="your-secret-key-here"
JWT_SECRET="your-jwt-secret-here"
SESSION_SECRET="your-session-secret-here"

# API externe (optionnel)
API_BASE_URL=""
API_TOKEN=""

# Environnement
NODE_ENV=development
```

## Développement

### Démarrage rapide

```bash
# Construire et démarrer tous les services
npm run docker:dev

# Ou manuellement
docker-compose -f docker-compose.dev.yml up
```

### Services disponibles

- **aethermail-dev**: Application principale (ports 5173, 4000)
- **postgres-dev**: Base de données PostgreSQL (port 5432)
- **redis-dev**: Cache Redis (port 6379)

### Commandes utiles

```bash
# Construire les images de développement
npm run docker:dev:build

# Reconstruire sans cache
npm run docker:dev:rebuild

# Voir les logs
npm run docker:logs

# Accéder au conteneur
npm run docker:exec:dev

# Arrêter tous les services
npm run docker:down
```

### Développement avec hot-reload

Le conteneur de développement monte votre code source local, permettant le hot-reload automatique.

## Production

### Build et déploiement

```bash
# Construire l'image de production
npm run docker:prod:build

# Démarrer en production
npm run docker:prod

# Reconstruire sans cache
npm run docker:prod:rebuild
```

### Services de production

- **aethermail**: Application principale (port 4000)
- **postgres**: Base de données PostgreSQL
- **redis**: Cache Redis
- **nginx** (optionnel): Reverse proxy
- **prometheus** (optionnel): Monitoring

### Variables d'environnement production

```bash
NODE_ENV=production
DATABASE_URL="postgresql://user:password@postgres:5432/aethermail_prod"
POSTGRES_USER=your_prod_user
POSTGRES_PASSWORD=your_prod_password
```

## Publication d'images

### GitHub Container Registry

Les images sont automatiquement publiées sur GitHub Container Registry lors des pushes :

- `ghcr.io/your-org/aether-mail:latest` - Version stable
- `ghcr.io/your-org/aether-mail:main` - Branche main
- `ghcr.io/your-org/aether-mail:dev-<sha>` - Développement

### Build manuel

```bash
# Image de production
docker build -t aether-mail .

# Image de développement
docker build -f Dockerfile.dev -t aether-mail:dev .

# Tag et push
docker tag aether-mail ghcr.io/your-org/aether-mail:v1.0.0
docker push ghcr.io/your-org/aether-mail:v1.0.0
```

## Debugging

### Logs

```bash
# Logs de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f aethermail-dev

# Logs avec timestamps
docker-compose logs -f -t
```

### Accès aux conteneurs

```bash
# Shell dans le conteneur principal
docker exec -it aethermail-dev sh

# Shell dans la base de données
docker exec -it aethermail-postgres-dev psql -U dev_user -d aethermail_dev
```

### Debugging Node.js

Le port 9229 est exposé pour le debugger Node.js :

```bash
# Attacher un debugger
node --inspect=0.0.0.0:9229
```

## Maintenance

### Nettoyage

```bash
# Arrêter et supprimer tous les conteneurs
docker-compose down

# Supprimer les volumes (⚠️ données perdues)
docker-compose down -v

# Nettoyer les images et conteneurs inutilisés
npm run docker:clean
```

### Sauvegarde

```bash
# Sauvegarde de la base de données
docker exec aethermail-postgres-dev pg_dump -U dev_user aethermail_dev > backup.sql

# Restauration
docker exec -i aethermail-postgres-dev psql -U dev_user aethermail_dev < backup.sql
```

## Dépannage

### Problèmes courants

1. **Port déjà utilisé**

   ```bash
   # Vérifier les ports utilisés
   lsof -i :4000
   lsof -i :5173

   # Changer les ports dans docker-compose.override.yml
   ```

2. **Permissions de fichiers**

   ```bash
   # Corriger les permissions
   sudo chown -R $USER:$USER .
   ```

3. **Mémoire insuffisante**

   ```bash
   # Augmenter la mémoire Docker
   # Docker Desktop: Preferences > Resources > Memory
   ```

4. **Build lent**
   ```bash
   # Utiliser BuildKit
   export DOCKER_BUILDKIT=1
   ```

### Health checks

Tous les services incluent des health checks. Vérifiez leur statut :

```bash
docker-compose ps
```

## Structure des fichiers

```
.
├── Dockerfile              # Image de production
├── Dockerfile.dev          # Image de développement
├── docker-compose.yml      # Configuration de base
├── docker-compose.dev.yml  # Configuration développement
├── docker-compose.prod.yml # Configuration production
├── docker-compose.override.yml # Surcharges locales
├── .dockerignore          # Fichiers exclus du build
└── DOCKER.md              # Cette documentation
```

## CI/CD

### Workflows GitHub Actions

- `docker-image.yml`: Build et push automatique des images
- `docker-release.yml`: Publication lors des releases

### Déploiement automatique

Configurez vos secrets GitHub :

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `DEPLOY_HOST`
- `DEPLOY_USER`
- `SSH_PRIVATE_KEY`
