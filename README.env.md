# Configuration des Variables d'Environnement

Ce document explique comment configurer les variables d'environnement pour Aether Mail.

## Fichiers de Configuration

### .env.example

Fichier de référence contenant toutes les variables d'environnement nécessaires avec leurs valeurs par défaut.

### .env.local (Développement)

Fichier pour la configuration locale. **Ne jamais commiter ce fichier** car il contient des secrets.

### .env.production (Production)

Fichier pour la configuration de production. À configurer sur le serveur de production.

## Variables d'Environnement

### Frontend

- `VITE_API_BASE_URL`: URL de base de l'API backend
  - Développement: `http://localhost:3000`
  - Production: `https://api.skygenesisenterprise.com`

### Backend

- `DATABASE_URL`: URL de connexion PostgreSQL
  - Format: `postgresql://username:password@host:port/database`

- `JWT_SECRET`: Clé secrète pour signer les tokens JWT
  - **IMPORTANT**: Doit être une chaîne aléatoire sécurisée en production
  - Générer avec: `openssl rand -hex 32`

- `API_ACCESS_TOKEN`: Token d'accès pour les appels API externes
  - Obtenu auprès du fournisseur d'API externe
  - Utilisé pour authentifier les requêtes sortantes

- `EXTERNAL_API_BASE_URL`: URL de base de l'API externe
  - URL du service API que le backend doit appeler

- `SERVER_HOST`: Adresse IP du serveur
  - Défaut: `127.0.0.1`

- `SERVER_PORT`: Port du serveur
  - Défaut: `3000`

## Configuration

### Développement Local

1. Copier le fichier d'exemple:

   ```bash
   cp .env.example .env.local
   ```

2. Éditer `.env.local` avec vos valeurs locales

3. Le backend chargera automatiquement `.env.local` grâce à `dotenvy::dotenv().ok()`

### Production

1. Créer `.env.production` sur le serveur

2. Configurer les variables avec les vraies valeurs de production

3. S'assurer que le fichier n'est pas accessible publiquement

## Sécurité

- **Jamais commiter** les fichiers `.env.local` ou `.env.production`
- Utiliser des mots de passe forts et des tokens sécurisés
- Régénérer `JWT_SECRET` en production
- Utiliser HTTPS en production pour toutes les communications

## Utilisation du Token API Access

Le backend utilise `API_ACCESS_TOKEN` pour authentifier les appels vers des APIs externes:

```rust
let api_client = crate::core::create_api_client();
// Fait automatiquement: Authorization: Bearer {API_ACCESS_TOKEN}
let result = api_client.post("/endpoint", &data).await?;
```

Exemple d'utilisation dans le contrôleur de récupération de mot de passe pour envoyer des emails via une API externe.
