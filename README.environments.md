# Environnements Aether Mail

Ce guide explique comment configurer et utiliser les différents environnements de développement et production pour Aether Mail.

## 📋 Vue d'ensemble

Aether Mail supporte deux environnements principaux :

- **Développement** : Pour les développeurs, avec données mockées et outils de debug
- **Production** : Pour le déploiement final, avec intégration API réelle

## 🚀 Démarrage Rapide

### Développement (avec données mockées)

```bash
# Configuration automatique pour le développement
npm run dev
```

Cette commande :

- Configure automatiquement l'environnement de développement
- Lance le frontend (http://localhost:5173)
- Lance le backend (http://localhost:4000)
- Utilise des données mockées pour les emails

### Production (avec API réelle)

```bash
# Configuration automatique pour la production
npm run prod
```

Cette commande :

- Configure automatiquement l'environnement de production
- Compile l'application
- Lance le serveur de production
- Utilise l'API officielle avec authentification

## ⚙️ Configuration des Environnements

### Fichiers d'environnement

- `.env.development` : Configuration pour le développement
- `.env.production` : Configuration pour la production
- `.env` : Fichier actif (généré automatiquement)

### Variables importantes

#### Développement

```bash
NODE_ENV=development
API_BASE_URL=""  # Désactivé
API_TOKEN=""     # Désactivé
```

#### Production

```bash
NODE_ENV=production
API_BASE_URL="https://api.skygenesisenterprise.com"
API_TOKEN="votre-token-api-production"
```

## 🔧 Configuration Manuelle

### Pour le développement

```bash
# Copier la configuration de développement
cp .env.development .env

# Lancer l'application
npm run dev
```

### Pour la production

```bash
# Copier la configuration de production
cp .env.production .env

# Configurer les variables requises
# Éditer .env et remplacer :
# - API_TOKEN=your-production-api-token
# - DATABASE_URL=your-production-database-url
# - BETTER_AUTH_SECRET=your-production-secret

# Compiler et lancer
npm run build
npm run prod:start
```

## 🔗 Intégration API

### En développement

- ✅ Données mockées cohérentes
- ✅ Pas besoin de token API
- ✅ Fonctionnalités complètes simulées
- ✅ Base de données locale optionnelle

### En production

- ✅ API officielle `https://api.skygenesisenterprise.com`
- ✅ Authentification par token
- ✅ Données réelles
- ✅ Toutes les fonctionnalités disponibles

### Fallback automatique

Si l'API de production n'est pas disponible :

- Retour automatique aux données mockées
- Logging détaillé des erreurs
- Continuité du service

## 🧪 Tests

### Tests en développement

```bash
npm run test:frontend  # Tests frontend
npm run test:backend   # Tests backend
npm run test           # Tous les tests
```

### Tests en production

```bash
NODE_ENV=production npm run test
```

## 📊 Monitoring

### Logs par environnement

**Développement** :

- Logs détaillés avec stack traces
- Debug activé
- Informations de performance

**Production** :

- Logs structurés
- Erreurs uniquement (sauf debug activé)
- Métriques de performance

### Variables de logging

```bash
# Développement
LOG_LEVEL=debug

# Production
LOG_LEVEL=info
```

## 🔒 Sécurité

### Développement

- CORS ouverts pour localhost
- Secrets de développement
- Debug activé

### Production

- CORS restrictifs
- Secrets de production
- Debug désactivé
- HTTPS forcé
- Rate limiting activé

## 🚀 Déploiement

### Prérequis production

1. Configurer `API_TOKEN` valide
2. Configurer `DATABASE_URL` de production
3. Configurer `BETTER_AUTH_SECRET` sécurisé
4. Variables SMTP configurées

### Commandes de déploiement

```bash
# Build pour production
npm run build

# Lancement en production
npm run prod
```

## 🐛 Dépannage

### Problèmes courants

#### API non disponible en production

```bash
# Vérifier la configuration
cat .env | grep API_

# Tester la connectivité
curl -H "Authorization: Bearer $API_TOKEN" https://api.skygenesisenterprise.com/api/v1/emails
```

#### Base de données non accessible

```bash
# Vérifier la connexion
npm run db:test
```

#### Build échoue

```bash
# Nettoyer et rebuild
rm -rf dist node_modules
npm install
npm run build
```

## 📚 Ressources

- [Documentation API](./docs/api/)
- [Guide de développement](./docs/development/)
- [Configuration sécurité](./docs/security/)
