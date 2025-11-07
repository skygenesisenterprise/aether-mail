# Configuration des Serveurs Mail Personnalisés

Aether Mail supporte maintenant la configuration de serveurs IMAP/SMTP personnalisés via les variables d'environnement. Cette fonctionnalité permet de définir des serveurs mail spécifiques pour différents domaines.

## Configuration

### Format des Variables d'Environnement

Pour configurer un domaine personnalisé, utilisez le format suivant :

```bash
{DOMAIN}_IMAP_HOST=mail.example.com
{DOMAIN}_IMAP_PORT=993
{DOMAIN}_IMAP_TLS=true
{DOMAIN}_SMTP_HOST=smtp.example.com
{DOMAIN}_SMTP_PORT=587
{DOMAIN}_SMTP_SECURE=true
```

Où `{DOMAIN}` est le nom de domaine avec les points remplacés par des underscores.

### Exemples

#### Domaine personnalisé
```bash
# Pour example.com
EXAMPLE_COM_IMAP_HOST=mail.example.com
EXAMPLE_COM_IMAP_PORT=993
EXAMPLE_COM_IMAP_TLS=true
EXAMPLE_COM_SMTP_HOST=smtp.example.com
EXAMPLE_COM_SMTP_PORT=587
EXAMPLE_COM_SMTP_SECURE=true
```

#### Domaine de l'entreprise
```bash
# Pour mycompany.io
MYCOMPANY_IO_IMAP_HOST=mail.mycompany.io
MYCOMPANY_IO_IMAP_PORT=993
MYCOMPANY_IO_IMAP_TLS=true
MYCOMPANY_IO_SMTP_HOST=smtp.mycompany.io
MYCOMPANY_IO_SMTP_PORT=587
MYCOMPANY_IO_SMTP_SECURE=true
```

#### Serveur par défaut
```bash
# Configuration par défaut pour les domaines non configurés
DEFAULT_IMAP_HOST=mail.default-server.com
DEFAULT_IMAP_PORT=993
DEFAULT_IMAP_TLS=true
DEFAULT_SMTP_HOST=smtp.default-server.com
DEFAULT_SMTP_PORT=587
DEFAULT_SMTP_SECURE=true
```

## Priorité de Configuration

Le système suit cet ordre de priorité :

1. **Configuration spécifique au domaine** : Variables comme `EXAMPLE_COM_IMAP_HOST`
2. **Domaines Sky Genesis Enterprise** : Utilise `mail.skygenesisenterprise.com`
3. **Serveur par défaut personnalisé** : Variables `DEFAULT_*`
4. **Configuration générique** : `imap.{domain}` et `smtp.{domain}`

## API Endpoints

### Obtenir les fournisseurs supportés
```http
GET /api/providers
```

Retourne la liste des fournisseurs configurés, y compris les serveurs personnalisés.

### Tester la connexion IMAP
```http
POST /api/test-imap-login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

Le système détectera automatiquement la configuration appropriée selon le domaine de l'email.

## Utilisation avec Docker

Ajoutez les variables d'environnement dans votre fichier `docker-compose.yml` :

```yaml
services:
  api:
    environment:
      - EXAMPLE_COM_IMAP_HOST=mail.example.com
      - EXAMPLE_COM_IMAP_PORT=993
      - EXAMPLE_COM_IMAP_TLS=true
      - EXAMPLE_COM_SMTP_HOST=smtp.example.com
      - EXAMPLE_COM_SMTP_PORT=587
      - EXAMPLE_COM_SMTP_SECURE=true
```

## Sécurité

- Les mots de passe ne sont jamais stockés dans les variables d'environnement
- Seules les configurations de serveur sont définies via les variables d'environnement
- Les identifiants sont fournis par l'utilisateur lors de la connexion

## Dépannage

### Domaine non reconnu
Si un domaine n'est pas reconnu, vérifiez :
- Le format des variables d'environnement (underscores au lieu de points)
- Que toutes les variables requises sont définies
- Le redémarrage du service après modification des variables

### Connexion échouée
Vérifiez :
- Les paramètres du serveur (hôte, port)
- La configuration TLS/SSL
- Les identifiants de l'utilisateur
- La connectivité réseau vers le serveur mail