# Docker pour Aether Mail - Architecture Séparée

Ce document décrit la nouvelle architecture Docker avec des containers séparés pour le backend et le frontend.

## 📁 Fichiers créés

### Dockerfiles
- `Dockerfile.backend` - Container pour le backend Rust
- `Dockerfile.frontend` - Container pour le frontend Node.js + Nginx

### Configuration
- `docker-compose.separated.yml` - Configuration Docker Compose avec services séparés
- `nginx.frontend.conf` - Configuration Nginx pour le frontend
- `.env.docker` - Variables d'environnement par défaut
- `deploy-docker.sh` - Script de déploiement automatisé

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend     │    │    Backend      │    │   Database      │
│   (Nginx)      │◄──►│   (Rust API)   │◄──►│  (PostgreSQL)   │
│   Port: 80     │    │   Port: 3000   │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │      Redis      │
                    │    (Cache)      │
                    │   Port: 6379    │
                    └─────────────────┘
```

## 🚀 Déploiement rapide

### 1. Configuration de l'environnement
```bash
# Copier le fichier d'environnement
cp .env.docker .env

# Éditer avec vos configurations
nano .env
```

### 2. Déploiement avec le script
```bash
# Lancer le déploiement automatisé
./deploy-docker.sh
```

### 3. Déploiement manuel
```bash
# Construire et démarrer les containers
docker-compose -f docker-compose.separated.yml up -d --build

# Vérifier les logs
docker-compose -f docker-compose.separated.yml logs -f
```

## 🔧 Configuration des services

### Backend (Rust API)
- **Port interne**: 3000
- **Accès externe**: http://localhost:3000
- **Variables d'environnement**: Support complet des serveurs mail personnalisés
- **Dépendances**: PostgreSQL, Redis

### Frontend (Node.js + Nginx)
- **Port interne**: 80
- **Accès externe**: http://localhost
- **Reverse proxy**: Nginx configure pour router les appels API vers le backend
- **Static files**: Servis par Nginx avec compression et cache

### Base de données (PostgreSQL)
- **Version**: 15 Alpine
- **Port interne**: 5432
- **Accès externe**: localhost:5432 (développement uniquement)
- **Persistence**: Volume Docker `postgres_data`

### Cache (Redis)
- **Version**: 7 Alpine
- **Port interne**: 6379
- **Accès externe**: localhost:6379 (développement uniquement)
- **Persistence**: Volume Docker `redis_data`

## 🌐 Communication entre services

### Frontend → Backend
Le frontend communique avec le backend via le reverse proxy Nginx:
```nginx
location /api/ {
    proxy_pass http://backend:3000/;
    # ... configuration headers
}
```

### Backend → Database
Le backend se connecte à PostgreSQL via le nom de service Docker:
```
DATABASE_URL=postgresql://postgres:password@postgres:5432/aethermail_prod
```

### Variables d'environnement personnalisées
Les serveurs mail personnalisés sont configurés via les variables d'environnement:
```bash
EXAMPLE_COM_IMAP_HOST=mail.example.com
EXAMPLE_COM_SMTP_HOST=smtp.example.com
```

## 🔍 Health Checks

Tous les services incluent des health checks:
- **Backend**: `curl -f http://localhost:3000/`
- **Frontend**: `curl -f http://localhost:80/health`
- **PostgreSQL**: `pg_isready -U postgres`
- **Redis**: `redis-cli ping`

## 📝 Logs et monitoring

### Voir les logs
```bash
# Tous les services
docker-compose -f docker-compose.separated.yml logs -f

# Service spécifique
docker-compose -f docker-compose.separated.yml logs -f backend
docker-compose -f docker-compose.separated.yml logs -f frontend
```

### Monitoring des ressources
```bash
# Statistiques des containers
docker stats

# État des services
docker-compose -f docker-compose.separated.yml ps
```

## 🛠️ Développement

### Mode développement
Pour le développement local, vous pouvez utiliser les ports exposés:
- Frontend: http://localhost
- Backend API: http://localhost:3000
- Database: localhost:5432
- Redis: localhost:6379

### Rebuild après modifications
```bash
# Rebuild uniquement le backend
docker-compose -f docker-compose.separated.yml up -d --build backend

# Rebuild uniquement le frontend
docker-compose -f docker-compose.separated.yml up -d --build frontend
```

## 🔒 Sécurité

- Utilisateurs non-root dans tous les containers
- Variables d'environnement pour les secrets
- Headers de sécurité configurés dans Nginx
- Ports base de données exposés uniquement en développement

## 🚨 Production

Pour la production:
1. Retirer les ports exposés de PostgreSQL et Redis
2. Utiliser des secrets Docker pour les variables sensibles
3. Configurer un reverse proxy externe (Traefik) avec SSL
4. Activer les backups réguliers de la base de données