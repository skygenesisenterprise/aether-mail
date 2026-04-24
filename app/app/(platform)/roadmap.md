# Roadmap API v1 - Platform

Ce document liste les endpoints `/api/v1/*` à implémenter, organisés par module fonctionnel.

> **Note**: Ce document est mis à jour régulièrement pour refléter l'état d'implémentation réel.
> Les endpoints **implémentés** sont marqués avec ✅.

---

## Inbox (Email)

### Mailboxes / Folders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/mailboxes/:accountId` | Liste des dossiers | ✅
| GET | `/api/v1/mailboxes/:accountId/:mailboxId` | Obtenir un dossier spécifique | ✅
| POST | `/api/v1/mailboxes` | Créer un nouveau dossier | ✅
| PATCH | `/api/v1/mailboxes/rename` | Renommer un dossier | ✅
| DELETE | `/api/v1/mailboxes/:accountId/:mailboxId` | Supprimer un dossier | ✅
| POST | `/api/v1/mailboxes/subscribe` | S'abonner à un dossier | ✅

### Emails
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/emails/:accountId` | Liste des emails (avec pagination, tri, filtres) | ✅
| GET | `/api/v1/emails/:accountId/:emailId` | Obtenir un email spécifique | ✅
| GET | `/api/v1/emails/:accountId/:emailId/raw` | Obtenir l'email brut (RAW) | ✅
| GET | `/api/v1/emails/:accountId/threads/:threadId` | Obtenir un thread de conversation | ✅
| POST | `/api/v1/emails/send` | Envoyer un email | ✅
| POST | `/api/v1/emails/draft` | Créer un brouillon | ✅
| PUT | `/api/v1/emails/:accountId/:draftId` | Mettre à jour un brouillon | ✅
| DELETE | `/api/v1/emails/:accountId/:draftId` | Supprimer un brouillon | ✅

### Email Actions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/emails/move` | Déplacer des emails | ✅
| POST | `/api/v1/emails/delete` | Supprimer des emails | ✅
| POST | `/api/v1/emails/mark-read` | Marquer comme lu | ✅
| POST | `/api/v1/emails/mark-unread` | Marquer comme non lu | ✅
| POST | `/api/v1/emails/star` | Ajouter aux favoris | ✅
| POST | `/api/v1/emails/unstar` | Retirer des favoris | ✅
| POST | `/api/v1/emails/archive` | Archiver des emails | ✅
| POST | `/api/v1/emails/search` | Rechercher des emails | ✅
| GET | `/api/v1/emails/quick-search` | Recherche rapide | ✅

### Attachments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/emails/:accountId/:emailId/attachments` | Liste des pièces jointes |
| GET | `/api/v1/emails/:accountId/:emailId/attachments/:attachmentId/content` | Contenu d'une pièce jointe |
| POST | `/api/v1/emails/:accountId/:emailId/attachments/:attachmentId/download` | Télécharger une pièce jointe |

### Identities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/account/accounts` | Liste des identités (adresses d'envoi) | ✅

### Signatures
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/account/signatures` | Liste des signatures |
| POST | `/api/v1/account/signatures` | Créer une signature |
| PUT | `/api/v1/account/signatures/:id` | Modifier une signature |
| DELETE | `/api/v1/account/signatures/:id` | Supprimer une signature |

---

## Account

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/account/me` | Obtenir le compte actuel | ✅
| GET | `/api/v1/account/accounts` | Liste des comptes | ✅
| POST | `/api/v1/account` | Créer un compte |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Connexion | ✅
| POST | `/api/v1/auth/logout` | Déconnexion | ✅
| POST | `/api/v1/auth/refresh` | Rafraîchir le token | ✅
| POST | `/api/v1/auth/change-password` | Changer le mot de passe | ✅
| POST | `/api/v1/auth/reset-password` | Réinitialiser le mot de passe | ✅
| POST | `/api/v1/auth/set-password` | Définir le mot de passe | ✅

---

## Meet (Visioconférence) - À implémenter

### Meetings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/meetings` | Liste des réunions |
| GET | `/api/v1/meetings/:meetingId` | Obtenir une réunion |
| POST | `/api/v1/meetings` | Créer une réunion |
| PUT | `/api/v1/meetings/:meetingId` | Modifier une réunion |
| DELETE | `/api/v1/meetings/:meetingId` | Supprimer une réunion |
| POST | `/api/v1/meetings/:meetingId/join` | Rejoindre une réunion |
| POST | `/api/v1/meetings/:meetingId/start` | Démarrer une réunion |
| POST | `/api/v1/meetings/:meetingId/end` | Terminer une réunion |
| POST | `/api/v1/meetings/:meetingId/leave` | Quitter une réunion |

### Meetings - Conversations (Calls)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/meetings/conversations` | Liste des conversations/_calls |
| GET | `/api/v1/meetings/conversations/:conversationId` | Obtenir une conversation |
| POST | `/api/v1/meetings/conversations/:conversationId/start` | Démarrer un appel |
| POST | `/api/v1/meetings/conversations/:conversationId/accept` | Accepter un appel |
| POST | `/api/v1/meetings/conversations/:conversationId/decline` | Refuser un appel |
| POST | `/api/v1/meetings/conversations/:conversationId/hold` | Mettre en attente |
| POST | `/api/v1/meetings/conversations/:conversationId/resume` | Reprendre |
| POST | `/api/v1/meetings/conversations/:conversationId/mute` | Couper le micro |
| POST | `/api/v1/meetings/conversations/:conversationId/unmute` | Activer le micro |
| POST | `/api/v1/meetings/conversations/:conversationId/video-on` | Activer la vidéo |
| POST | `/api/v1/meetings/conversations/:conversationId/video-off` | Désactiver la vidéo |
| POST | `/api/v1/meetings/conversations/:conversationId/screenshare` | Partager l'écran |
| POST | `/api/v1/meetings/conversations/:conversationId/screenshare-stop` | Arrêter le partage |

### Meetings - Messages (Chat)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/meetings/conversations/:conversationId/messages` | Liste des messages |
| GET | `/api/v1/meetings/conversations/:conversationId/messages/:messageId` | Obtenir un message |
| POST | `/api/v1/meetings/conversations/:conversationId/messages` | Envoyer un message |
| DELETE | `/api/v1/meetings/conversations/:conversationId/messages/:messageId` | Supprimer un message |

### Meeting Participants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/meetings/:meetingId/participants` | Liste des participants |
| GET | `/api/v1/meetings/conversations/:conversationId/participants` | Liste des participants |
| POST | `/api/v1/meetings/:meetingId/invite` | Inviter des participants |
| POST | `/api/v1/meetings/:meetingId/participants/:userId/remove` | Retirer un participant |
| POST | `/api/v1/meetings/:meetingId/participants/:userId/mute` | Muet un participant |
| POST | `/api/v1/meetings/:meetingId/participants/:userId/remove-from-call` | Retirer de l'appel |

### Recording
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/meetings/:meetingId/recordings` | Liste des enregistrements |
| GET | `/api/v1/meetings/:meetingId/recordings/:recordingId` | Obtenir un enregistrement |
| POST | `/api/v1/meetings/:meetingId/recordings/start` | Démarrer l'enregistrement |
| POST | `/api/v1/meetings/:meetingId/recordings/stop` | Arrêter l'enregistrement |
| DELETE | `/api/v1/meetings/:meetingId/recordings/:recordingId` | Supprimer un enregistrement |
| GET | `/api/v1/meetings/:meetingId/recordings/:recordingId/download` | Télécharger l'enregistrement |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/meetings/settings` | Paramètres de réunion |
| PUT | `/api/v1/meetings/settings` | Mettre à jour les paramètres |

---

## Drive

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

## Activity (Journal d'activité)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/activity` | Liste des activités |
| GET | `/api/v1/activity/:activityId` | Obtenir une activité |
| GET | `/api/v1/activity/stats` | Statistiques d'activité |

---

## Automation (Automatisation)

### Workflows
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/workflows` | Liste des workflows |
| GET | `/api/v1/workflows/:workflowId` | Obtenir un workflow |
| POST | `/api/v1/workflows` | Créer un workflow |
| PUT | `/api/v1/workflows/:workflowId` | Modifier un workflow |
| DELETE | `/api/v1/workflows/:workflowId` | Supprimer un workflow |
| POST | `/api/v1/workflows/:workflowId/run` | Exécuter un workflow |
| POST | `/api/v1/workflows/:workflowId/enable` | Activer un workflow |
| POST | `/api/v1/workflows/:workflowId/disable` | Désactiver un workflow |

### Actions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/actions` | Liste des actions disponibles |
| POST | `/api/v1/actions/test` | Tester une action |

### Triggers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/triggers` | Liste des triggers disponibles |
| POST | `/api/v1/triggers/test` | Tester un trigger |

---

## Newsletter

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

---

## Calendar - À implémenter

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/calendars/:accountId/events` | Liste des événements |
| GET | `/api/v1/calendars/:accountId/events/:eventId` | Obtenir un événement |
| POST | `/api/v1/events` | Créer un événement |
| PUT | `/api/v1/events/:eventId` | Modifier un événement |
| DELETE | `/api/v1/events/:eventId` | Supprimer un événement |

### Calendars
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/calendars/:accountId` | Liste des calendriers |
| POST | `/api/v1/calendars` | Créer un calendrier |
| PATCH | `/api/v1/calendars/:calendarId` | Modifier un calendrier |
| DELETE | `/api/v1/calendars/:calendarId` | Supprimer un calendrier |

---

## Contacts

### Contacts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/contacts/:accountId` | Liste des contacts | ✅
| GET | `/api/v1/contacts/:accountId/:contactId` | Obtenir un contact | ✅
| POST | `/api/v1/contacts` | Créer un contact | ✅
| PATCH | `/api/v1/contacts` | Modifier un contact | ✅
| DELETE | `/api/v1/contacts/:accountId/:contactId` | Supprimer un contact | ✅
| GET | `/api/v1/contacts/search` | Rechercher des contacts | ✅

### Contact Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/contact-groups/:accountId` | Liste des groupes |

---

## Settings - À implémenter

### User Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/settings` | Obtenir les paramètres utilisateur |
| PATCH | `/api/v1/settings` | Mettre à jour les paramètres |

### Vacation Responder
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/settings/vacation` | Obtenir la réponse de vacance |
| PUT | `/api/v1/settings/vacation` | Configurer la réponse de vacance |

### Filters / Rules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/filters` | Liste des règles de filtrage |
| POST | `/api/v1/filters` | Créer une règle |
| PUT | `/api/v1/filters/:id` | Modifier une règle |
| DELETE | `/api/v1/filters/:ruleId` | Supprimer une règle |

### Tags / Labels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/labels/:accountId` | Liste des labels |
| POST | `/api/v1/labels` | Créer un label |
| PUT | `/api/v1/labels/:labelId` | Modifier un label |
| DELETE | `/api/v1/labels/:labelId` | Supprimer un label |

---

## Notifications - À implémenter

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | Liste des notifications |
| POST | `/api/v1/notifications/mark-read` | Marquer comme lu |
| POST | `/api/v1/notifications/:notificationId/dismiss` | Dismiss une notification |

---

## Protocols (IMAP/SMTP/POP3)

> **Implémentés** dans le serveur via `/api/v1/protocols/*`

### IMAP
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/protocols/imap/connect` | Connexion IMAP |
| POST | `/api/v1/protocols/imap/login` | Authentification |
| POST | `/api/v1/protocols/imap/disconnect` | Déconnexion |
| GET | `/api/v1/protocols/imap/mailboxes` | Liste des mailboxes |
| GET | `/api/v1/protocols/imap/mailboxes/:mailbox/status` | Statut d'une mailbox |
| POST | `/api/v1/protocols/imap/mailboxes/:mailbox/select` | Sélectionner une mailbox |
| GET | `/api/v1/protocols/imap/messages` | Récupérer les messages |
| POST | `/api/v1/protocols/imap/messages/search` | Rechercher des messages |
| POST | `/api/v1/protocols/imap/messages/move` | Déplacer des messages |
| POST | `/api/v1/protocols/imap/messages/delete` | Supprimer des messages |
| POST | `/api/v1/protocols/imap/mailboxes/create` | Créer une mailbox |
| POST | `/api/v1/protocols/imap/mailboxes/rename` | Renommer une mailbox |
| DELETE | `/api/v1/protocols/imap/mailboxes/:mailbox` | Supprimer une mailbox |
| POST | `/api/v1/protocols/imap/expunge` | Expurger |

### SMTP
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/protocols/smtp/connect` | Connexion SMTP |
| POST | `/api/v1/protocols/smtp/authenticate` | Authentification |
| POST | `/api/v1/protocols/smtp/disconnect` | Déconnexion |
| POST | `/api/v1/protocols/smtp/send` | Envoyer un email |
| POST | `/api/v1/protocols/smtp/send-raw` | Envoyer un email RAW |

### POP3
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/protocols/pop3/connect` | Connexion POP3 |
| POST | `/api/v1/protocols/pop3/authenticate` | Authentification |
| POST | `/api/v1/protocols/pop3/disconnect` | Déconnexion |
| GET | `/api/v1/protocols/pop3/stat` | Statistiques |
| GET | `/api/v1/protocols/pop3/list` | Liste des messages |
| GET | `/api/v1/protocols/pop3/uidl` | Liste des UID |
| GET | `/api/v1/protocols/pop3/messages/:number` | Récupérer un message |
| GET | `/api/v1/protocols/pop3/messages/:number/top` | En-tête d'un message |
| DELETE | `/api/v1/protocols/pop3/messages/:number` | Supprimer un message |