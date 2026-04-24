# Roadmap API v1 - Platform

Ce document liste les endpoints `/api/v1/*` à implémenter, organisés par module fonctionnel.

---

## Inbox (Email)

### Mailboxes / Folders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts/:accountId/mailboxes` | Liste des dossiers (remplace GET /mailboxes/:accountId) |
| GET | `/api/v1/accounts/:accountId/mailboxes/:mailboxId` | Obtenir un dossier spécifique |
| POST | `/api/v1/mailboxes` | Créer un nouveau dossier |
| PATCH | `/api/v1/mailboxes/:mailboxId` | Renommer un dossier |
| DELETE | `/api/v1/accounts/:accountId/mailboxes/:mailboxId` | Supprimer un dossier |
| POST | `/api/v1/mailboxes/subscribe` | S'abonner à un dossier |

### Emails
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/emails/:accountId` | Liste des emails (avec pagination, tri, filtres) |
| GET | `/api/v1/emails/:accountId/:emailId` | Obtenir un email spécifique |
| GET | `/api/v1/emails/:accountId/:emailId/raw` | Obtenir l'email brut (RAW) |
| GET | `/api/v1/accounts/:accountId/threads/:threadId` | Obtenir un thread de conversation |
| POST | `/api/v1/emails/send` | Envoyer un email |
| POST | `/api/v1/emails/draft` | Créer un brouillon |
| PUT | `/api/v1/accounts/:accountId/emails/:draftId` | Mettre à jour un brouillon |
| DELETE | `/api/v1/accounts/:accountId/emails/:draftId` | Supprimer un brouillon |

### Email Actions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/emails/move` | Déplacer des emails |
| POST | `/api/v1/emails/action` | Actions groupées (markRead, markUnread, markStarred, unstar, delete, archive) |
| POST | `/api/v1/emails/labels` | Définir les labels d'un email |
| POST | `/api/v1/emails/search` | Rechercher des emails |

### Quick Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/search/quick` | Recherche rapide |

### Attachments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts/:accountId/emails/:emailId/attachments` | Liste des pièces jointes |
| GET | `/api/v1/accounts/:accountId/emails/:emailId/attachments/:attachmentId/content` | Contenu d'une pièce jointe |
| POST | `/api/v1/accounts/:accountId/emails/:emailId/attachments/:attachmentId/download` | Télécharger une pièce jointe |

### Identities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts/:accountId/identities` | Liste des identités (adresses d'envoi) |

### Signatures
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts/:accountId/signatures` | Liste des signatures |
| POST | `/api/v1/signatures` | Créer une signature |
| PUT | `/api/v1/signatures/:id` | Modifier une signature |
| DELETE | `/api/v1/accounts/:accountId/signatures/:id` | Supprimer une signature |

---

## Calendar

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts/:accountId/calendars/:calendarId/events` | Liste des événements (avec start/end) |
| POST | `/api/v1/events` | Créer un événement |
| PUT | `/api/v1/events/:eventId` | Modifier un événement |
| DELETE | `/api/v1/accounts/:accountId/events/:eventId` | Supprimer un événement |

### Calendars (à vérifier)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts/:accountId/calendars` | Liste des calendriers |
| POST | `/api/v1/calendars` | Créer un calendrier |
| PATCH | `/api/v1/calendars/:calendarId` | Modifier un calendrier |
| DELETE | `/api/v1/accounts/:accountId/calendars/:calendarId` | Supprimer un calendrier |

---

## Contacts

### Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts/:accountId/contacts` | Liste des contacts (limit, offset) |
| GET | `/api/v1/accounts/:accountId/contacts/:contactId` | Obtenir un contact spécifique |
| POST | `/api/v1/contacts` | Créer un contact |
| PUT | `/api/v1/contacts/:id` | Modifier un contact |
| DELETE | `/api/v1/accounts/:accountId/contacts/:contactId` | Supprimer un contact |
| POST | `/api/v1/contacts/search` | Rechercher des contacts |

### Contact Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts/:accountId/contact-groups` | Liste des groupes de contacts |
| POST | `/api/v1/contact-groups` | Créer un groupe |

---

## Tags (Labels)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts/:accountId/tags` | Liste des tags/labels |
| POST | `/api/v1/tags` | Créer un tag |
| PUT | `/api/v1/tags/:id` | Modifier un tag |
| DELETE | `/api/v1/accounts/:accountId/tags/:tagId` | Supprimer un tag |

---

## Settings

### User Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts/:accountId/settings` | Obtenir les paramètres utilisateur |
| PATCH | `/api/v1/accounts/:accountId/settings` | Mettre à jour les paramètres |

### Vacation Responder
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts/:accountId/vacation` | Obtenir la réponse de vacance |
| PUT | `/api/v1/accounts/:accountId/vacation` | Configurer la réponse de vacance |

### Filters / Rules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts/:accountId/filters` | Liste des règles de filtrage |
| POST | `/api/v1/filters` | Créer une règle |
| PUT | `/api/v1/filters/:id` | Modifier une règle |
| DELETE | `/api/v1/accounts/:accountId/filters/:ruleId` | Supprimer une règle |

---

## Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts/:accountId/notifications` | Liste des notifications (limit, offset) |
| POST | `/api/v1/notifications/mark-read` | Marquer des notifications comme lues |
| POST | `/api/v1/accounts/:accountId/notifications/:notificationId/dismiss` | Dismiss une notification |

---

## Accounts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts` | Liste des comptes |
| GET | `/api/v1/accounts/:accountId` | Obtenir un compte spécifique |
| POST | `/api/v1/accounts` | Créer un compte |

---

## Drive (File Storage) - À implémenter

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts/:accountId/files` | Liste des fichiers |
| GET | `/api/v1/accounts/:accountId/files/:fileId` | Obtenir un fichier |
| POST | `/api/v1/files` | Créer/upload un fichier |
| PUT | `/api/v1/files/:fileId` | Modifier un fichier |
| DELETE | `/api/v1/accounts/:accountId/files/:fileId` | Supprimer un fichier |
| GET | `/api/v1/accounts/:accountId/folders` | Liste des dossiers |
| POST | `/api/v1/folders` | Créer un dossier |
| POST | `/api/v1/files/:fileId/share` | Partager un fichier |

---

## Newsletter - À implémenter

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts/:accountId/newsletters` | Liste des newsletters |
| GET | `/api/v1/accounts/:accountId/newsletters/:newsletterId` | Obtenir une newsletter |
| POST | `/api/v1/newsletters` | Créer une newsletter |
| PUT | `/api/v1/newsletters/:id` | Modifier une newsletter |
| DELETE | `/api/v1/accounts/:accountId/newsletters/:newsletterId` | Supprimer une newsletter |
| POST | `/api/v1/newsletters/:id/subscribe` | S'abonner |
| POST | `/api/v1/newsletters/:id/unsubscribe` | Se désabonner |

---

## Organization - À implémenter

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/organization` | Info organisation |
| PATCH | `/api/v1/organization` | Modifier organisation |
| GET | `/api/v1/organization/members` | Liste des membres |
| POST | `/api/v1/organization/invites` | Inviter un membre |
| DELETE | `/api/v1/organization/members/:userId` | Retirer un membre |
| GET | `/api/v1/organization/domains` | Domaines vérifiés |
| POST | `/api/v1/organization/domains` | Ajouter un domaine |
| POST | `/api/v1/organization/domains/:domainId/verify` | Vérifier un domaine |

---

## Todo / Tasks - À implémenter

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/accounts/:accountId/tasks` | Liste des tâches |
| GET | `/api/v1/accounts/:accountId/tasks/:taskId` | Obtenir une tâche |
| POST | `/api/v1/tasks` | Créer une tâche |
| PUT | `/api/v1/tasks/:id` | Modifier une tâche |
| DELETE | `/api/v1/accounts/:accountId/tasks/:taskId` | Supprimer une tâche |
| POST | `/api/v1/tasks/:id/complete` | Marquer comme complétée |
| GET | `/api/v1/accounts/:accountId/task-lists` | Liste des listes de tâches |
| POST | `/api/v1/task-lists` | Créer une liste |

---

## Copilot - À implémenter

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/copilot/chat` | Envoyer un message au copilot |
| GET | `/api/v1/copilot/history` | Historique des conversations |
| POST | `/api/v1/copilot/summarize` | Résumer des emails |
| POST | `/api/v1/copilot/compose` | Générer un email |
| POST | `/api/v1/copilot/reply` | Générer une réponse |