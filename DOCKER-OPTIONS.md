# Aether Mail - Docker Options

Ce document explique les différentes options de déploiement Docker disponibles pour Aether Mail.

## 🏗️ Options de déploiement

### 1. Architecture Séparée (Recommandée) 🌟
Utilise des containers Docker séparés pour chaque service.

**Fichiers:**
- `Dockerfile.backend` - Backend Rust
- `Dockerfile.frontend` - Frontend Nginx  
- `docker-compose.separated.yml` - Orchestration

**Avantages:**
- ✅ Scalabilité indépendante
- ✅ Isolation des services
- ✅ Maintenance simplifiée
- ✅ Sécurité renforcée

**Déploiement:**
```bash
docker-compose -f docker-compose.separated.yml up -d --build
```

---

### 2. Architecture Monolithique (Alternative)
Utilise un seul container avec tous les services.

**Fichier:**
- `Dockerfile` - Container monolithique

**Avantages:**
- ✅ Déploiement simple
- ✅ Moins de ressources
- ✅ Communication rapide (localhost)

**Déploiement:**
```bash
docker build -t aethermail .
docker run -p 80:80 -p 3000:3000 aethermail
```

---

## 📊 Comparaison

| Critère | Séparée | Monolithique |
|---------|----------|--------------|
| Scalabilité | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Isolation | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Complexité | ⭐⭐⭐ | ⭐ |
| Ressources | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Développement | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Production | ⭐⭐⭐⭐⭐ | ⭐⭐ |

## 🚀 Recommandations

### Pour la production:
Utilisez l'**architecture séparée** avec `docker-compose.separated.yml`:
- Meilleure scalabilité
- Isolation des services
- Maintenance facilitée
- Sécurité renforcée

### Pour le développement:
- **Architecture séparée** pour simuler la production
- **Architecture monolithique** pour rapidité et simplicité

### Pour les tests:
- **Architecture monolithique** pour des tests rapides
- **Architecture séparée** pour tests d'intégration

## 🔧 Configuration

### Variables d'environnement communes:
```bash
# Base de données
DATABASE_URL=postgresql://user:pass@host:5432/db

# Backend
JWT_SECRET=your-secret
API_ACCESS_TOKEN=your-token

# Frontend  
VITE_API_BASE_URL=http://localhost:3000

# Serveurs mail personnalisés
EXAMPLE_COM_IMAP_HOST=mail.example.com
EXAMPLE_COM_SMTP_HOST=smtp.example.com
```

## 📝 Scripts utilitaires

### Déploiement automatisé (séparé):
```bash
./deploy-docker.sh
```

### Déploiement manuel (monolithique):
```bash
docker build -t aethermail .
docker run -d \
  --name aethermail \
  -p 80:80 \
  -p 3000:3000 \
  --env-file .env \
  aethermail
```

## 🔍 Monitoring

### Architecture séparée:
```bash
# Tous les services
docker-compose -f docker-compose.separated.yml logs -f

# Service spécifique
docker-compose -f docker-compose.separated.yml logs -f backend
docker-compose -f docker-compose.separated.yml logs -f frontend
```

### Architecture monolithique:
```bash
# Logs du container
docker logs -f aethermail

# Logs spécifiques (via supervisor)
docker exec aethermail tail -f /var/log/supervisor/backend.log
docker exec aethermail tail -f /var/log/supervisor/nginx.log
```

## 🛠️ Dépannage

### Architecture séparée:
- Vérifiez la connectivité réseau entre containers
- Confirmez que les variables d'environnement sont correctes
- Vérifiez les health checks individuels

### Architecture monolithique:
- Vérifiez que supervisor démarre tous les processus
- Confirmez que nginx écoute sur les bons ports
- Vérifiez que le backend Rust est accessible localement

## 📚 Documentation supplémentaire

- [DOCKER-SEPARATED.md](./DOCKER-SEPARATED.md) - Guide complet architecture séparée
- [DOCKER.md](./DOCKER.md) - Documentation Docker générale
- [Configuration](./docs/configuration/) - Variables d'environnement