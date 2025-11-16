import React, { useState, useCallback, useMemo } from "react";
import {
  Star,
  Archive,
  Trash2,
  Paperclip,
  Mail,
  MailOpen,
  Check,
  MoreVertical,
} from "lucide-react";
import AdvancedSearch from "./AdvancedSearch";
import {
  useAdvancedSearch,
  type SearchFilter,
} from "../hooks/useAdvancedSearch";

interface Email {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
}

interface EmailListProps {
  selectedEmail?: string;
  onEmailSelect?: (emailId: string) => void;
  selectedFolder?: string;
  emails?: Record<string, any>;
  onEmailDelete?: (emailId: string) => void;
  onEmailArchive?: (emailId: string) => void;
  onEmailReadToggle?: (emailId: string, isRead: boolean) => void;
  onEmailStarToggle?: (emailId: string) => void;
}

export default function EmailList({
  selectedEmail,
  onEmailSelect,
  selectedFolder = "inbox",
  emails: externalEmails,
  onEmailDelete,
  onEmailArchive,
  onEmailReadToggle,
  onEmailStarToggle,
}: EmailListProps) {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const {
    query,
    filters,
    isSearching,
    hasActiveSearch,
    searchHistory,
    suggestions,
    searchSummary,
    search,
    clearSearch,
    addFilter,
    removeFilter,
  } = useAdvancedSearch({
    maxHistoryItems: 10,
    enableHistory: true,
    enableSuggestions: true,
  });

  // Utiliser les emails externes si fournis, sinon utiliser l'état local
  const emailsData = externalEmails
    ? Object.values(externalEmails)
    : [
        {
          id: "1",
          from: "Jean Dupont",
          fromEmail: "jean.dupont@example.com",
          subject: "Réunion projet Aether",
          preview:
            "Bonjour, je voulais confirmer notre réunion de demain concernant le développement de l'interface...",
          date: "14:30",
          isRead: false,
          isStarred: true,
          hasAttachment: true,
        },
        {
          id: "2",
          from: "Marie Martin",
          fromEmail: "marie.martin@example.com",
          subject: "Rapport hebdomadaire",
          preview:
            "Voici le rapport d'avancement pour cette semaine. Nous avons terminé 80% des fonctionnalités...",
          date: "12:15",
          isRead: true,
          isStarred: false,
          hasAttachment: false,
        },
        {
          id: "3",
          from: "System Notification",
          fromEmail: "noreply@aether-mail.com",
          subject: "Mise à jour de sécurité",
          preview:
            "Une nouvelle mise à jour de sécurité est disponible. Veuillez mettre à jour votre application...",
          date: "Hier",
          isRead: true,
          isStarred: false,
          hasAttachment: false,
        },
        {
          id: "4",
          from: "Lucas Bernard",
          fromEmail: "lucas.bernard@example.com",
          subject: "Design review",
          preview:
            "Peux-tu jeter un œil aux derniers mockups pour l'interface mail ? J'aimerais avoir ton avis...",
          date: "Hier",
          isRead: false,
          isStarred: true,
          hasAttachment: true,
        },
        {
          id: "5",
          from: "Équipe Support",
          fromEmail: "support@skygenesisenterprise.com",
          subject: "Ticket #1234 résolu",
          preview:
            "Votre demande concernant l'intégration API a été traitée. La solution a été déployée...",
          date: "2 jours",
          isRead: true,
          isStarred: false,
          hasAttachment: false,
        },
      ];

  const getFolderEmails = useCallback(
    (folder: string): Email[] => {
      switch (folder) {
        case "inbox":
          return emailsData.filter(
            (e) =>
              e.id === "1" ||
              e.id === "2" ||
              e.id === "3" ||
              e.id === "4" ||
              e.id === "5",
          );
        case "sent":
          return [];
        case "drafts":
          return [];
        case "starred":
          return emailsData.filter((e) => e.isStarred);
        case "archive":
          return [];
        case "trash":
          return [];
        default:
          return emailsData;
      }
    },
    [emailsData],
  );

  const filteredEmails = useMemo(() => {
    let filtered = getFolderEmails(selectedFolder);

    // Appliquer les filtres de recherche avancée
    filters.forEach((filter: SearchFilter) => {
      switch (filter.type) {
        case "date":
          if (filter.value === "today") {
            const today = new Date().toDateString();
            filtered = filtered.filter(
              (email) => new Date(email.date).toDateString() === today,
            );
          } else if (filter.value === "week") {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter(
              (email) => new Date(email.date) >= weekAgo,
            );
          } else if (filter.value === "month") {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            filtered = filtered.filter(
              (email) => new Date(email.date) >= monthAgo,
            );
          }
          break;

        case "sender":
          filtered = filtered.filter(
            (email) =>
              email.from.toLowerCase().includes(filter.value.toLowerCase()) ||
              email.fromEmail
                .toLowerCase()
                .includes(filter.value.toLowerCase()),
          );
          break;

        case "attachment":
          if (filter.value === "has-attachments") {
            filtered = filtered.filter((email) => email.hasAttachment);
          } else if (filter.value === "no-attachments") {
            filtered = filtered.filter((email) => !email.hasAttachment);
          }
          break;

        case "folder":
          // Le filtrage par dossier est déjà géré par selectedFolder
          break;

        case "priority":
          if (filter.value === "important") {
            filtered = filtered.filter((email) => email.isStarred);
          } else if (filter.value === "unread") {
            filtered = filtered.filter((email) => !email.isRead);
          }
          break;
      }
    });

    // Appliquer la recherche textuelle
    if (query) {
      // Support des commandes de recherche avancée
      let searchInSubject = true;
      let searchInFrom = true;
      let searchInPreview = true;
      let actualQuery = query;

      // Parser les commandes comme "from:", "subject:", etc.
      if (query.includes("from:")) {
        const fromMatch = query.match(/from:([^\s]+)/);
        if (fromMatch) {
          actualQuery = fromMatch[1];
          searchInSubject = false;
          searchInPreview = false;
        }
      }

      if (query.includes("subject:")) {
        const subjectMatch = query.match(/subject:([^\s]+)/);
        if (subjectMatch) {
          actualQuery = subjectMatch[1];
          searchInFrom = false;
          searchInPreview = false;
        }
      }

      filtered = filtered.filter((email) => {
        const queryLower = actualQuery.toLowerCase();
        return (
          (searchInSubject &&
            email.subject.toLowerCase().includes(queryLower)) ||
          (searchInFrom && email.from.toLowerCase().includes(queryLower)) ||
          (searchInPreview && email.preview.toLowerCase().includes(queryLower))
        );
      });
    }

    return filtered;
  }, [getFolderEmails, selectedFolder, query, filters]);

  const unreadCount = useMemo(
    () => filteredEmails.filter((e) => !e.isRead).length,
    [filteredEmails],
  );

  const toggleEmailRead = useCallback(
    (emailId: string) => {
      const email = emailsData.find((e) => e.id === emailId);
      if (email) {
        onEmailReadToggle?.(emailId, !email.isRead);
      }
    },
    [emailsData, onEmailReadToggle],
  );

  const toggleEmailStar = useCallback(
    (emailId: string) => {
      const email = emailsData.find((e) => e.id === emailId);
      if (email) {
        onEmailStarToggle?.(emailId);
      }
    },
    [emailsData, onEmailStarToggle],
  );

  const markAllAsRead = useCallback(() => {
    const unreadEmails = filteredEmails.filter((e) => !e.isRead);
    unreadEmails.forEach((email) => onEmailReadToggle?.(email.id, true));
  }, [filteredEmails, onEmailReadToggle]);

  const markAllAsUnread = useCallback(() => {
    const readEmails = filteredEmails.filter((e) => e.isRead);
    readEmails.forEach((email) => onEmailReadToggle?.(email.id, false));
  }, [filteredEmails, onEmailReadToggle]);

  const toggleEmailSelection = useCallback((emailId: string) => {
    setSelectedEmails((prev) =>
      prev.includes(emailId)
        ? prev.filter((id) => id !== emailId)
        : [...prev, emailId],
    );
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedEmails([]);
  }, [isSelectionMode]);

  const handleBulkAction = useCallback(
    (action: "read" | "unread" | "star" | "archive" | "delete") => {
      selectedEmails.forEach((emailId) => {
        switch (action) {
          case "read":
            onEmailReadToggle?.(emailId, true);
            break;
          case "unread":
            onEmailReadToggle?.(emailId, false);
            break;
          case "star":
            onEmailStarToggle?.(emailId);
            break;
          case "archive":
            onEmailArchive?.(emailId);
            break;
          case "delete":
            onEmailDelete?.(emailId);
            break;
        }
      });
      setSelectedEmails([]);
      setIsSelectionMode(false);
    },
    [
      selectedEmails,
      onEmailReadToggle,
      onEmailStarToggle,
      onEmailArchive,
      onEmailDelete,
    ],
  );

  const getFolderTitle = (folder: string) => {
    const titles: Record<string, string> = {
      inbox: "Boîte de réception",
      sent: "Envoyés",
      drafts: "Brouillons",
      starred: "Suivis",
      archive: "Archive",
      trash: "Corbeille",
    };
    return titles[folder] || folder;
  };

  return (
    <div className="w-96 bg-background border-r border-border flex flex-col h-full">
      {/* Header moderne */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground">
              {getFolderTitle(selectedFolder)}
            </h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectionMode}
              className={`p-2 rounded-lg transition-colors ${
                isSelectionMode
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
              title={
                isSelectionMode ? "Quitter la sélection" : "Mode sélection"
              }
            >
              <Check size={16} />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Barre de recherche avancée */}
        <AdvancedSearch
          onSearch={search}
          placeholder="Rechercher des emails, dossiers, contacts..."
          className="mb-3"
        />

        {/* Actions rapides */}
        {isSelectionMode && selectedEmails.length > 0 && (
          <div className="flex items-center justify-between p-2 bg-primary/10 border border-primary/20 rounded-lg mb-3">
            <span className="text-sm font-medium text-primary">
              {selectedEmails.length} sélectionné
              {selectedEmails.length > 1 ? "s" : ""}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handleBulkAction("read")}
                className="p-1.5 hover:bg-primary/20 rounded transition-colors"
                title="Marquer comme lu"
              >
                <MailOpen size={14} />
              </button>
              <button
                onClick={() => handleBulkAction("unread")}
                className="p-1.5 hover:bg-primary/20 rounded transition-colors"
                title="Marquer comme non lu"
              >
                <Mail size={14} />
              </button>
              <button
                onClick={() => handleBulkAction("star")}
                className="p-1.5 hover:bg-primary/20 rounded transition-colors"
                title="Suivre"
              >
                <Star size={14} />
              </button>
              <button
                onClick={() => handleBulkAction("archive")}
                className="p-1.5 hover:bg-primary/20 rounded transition-colors"
                title="Archiver"
              >
                <Archive size={14} />
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                className="p-1.5 hover:bg-destructive/20 rounded transition-colors text-destructive"
                title="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Actions groupées */}
        {!isSelectionMode && (
          <div className="flex gap-2">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex-1 bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-foreground text-sm rounded-lg px-3 py-2 transition-colors flex items-center justify-center gap-2"
            >
              <MailOpen size={14} />
              <span>Tout lire</span>
            </button>
            <button
              onClick={markAllAsUnread}
              disabled={filteredEmails.length - unreadCount === 0}
              className="flex-1 bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-foreground text-sm rounded-lg px-3 py-2 transition-colors flex items-center justify-center gap-2"
            >
              <Mail size={14} />
              <span>Tout non lu</span>
            </button>
          </div>
        )}
      </div>

      {/* Liste des emails */}
      <div className="flex-1 overflow-y-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
            <Mail size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              {query ? "Aucun résultat trouvé" : "Aucun email"}
            </p>
            <p className="text-sm text-center">
              {query
                ? "Essayez de modifier votre recherche"
                : "Ce dossier est vide"}
            </p>
          </div>
        ) : (
          filteredEmails.map((email) => (
            <div
              key={email.id}
              className={`group relative border-b border-border transition-all duration-200 ${
                selectedEmail === email.id
                  ? "bg-muted/50 border-l-4 border-l-primary"
                  : "hover:bg-muted/30"
              } ${!email.isRead ? "bg-primary/5" : ""}`}
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => {
                  if (isSelectionMode) {
                    toggleEmailSelection(email.id);
                  } else {
                    onEmailSelect?.(email.id);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox en mode sélection */}
                  {isSelectionMode && (
                    <div className="flex items-center justify-center mt-1">
                      <input
                        type="checkbox"
                        checked={selectedEmails.includes(email.id)}
                        onChange={() => toggleEmailSelection(email.id)}
                        className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        !email.isRead
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {email.from.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`text-sm truncate ${
                          !email.isRead
                            ? "font-semibold text-foreground"
                            : "font-medium text-muted-foreground"
                        }`}
                      >
                        {email.from}
                      </h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {email.date}
                      </span>
                    </div>

                    <h4
                      className={`text-sm mb-1 truncate ${
                        !email.isRead
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {email.subject}
                    </h4>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {email.preview}
                    </p>

                    {/* Actions et métadonnées */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {email.hasAttachment && (
                          <Paperclip
                            size={12}
                            className="text-muted-foreground"
                          />
                        )}
                        {email.isStarred && (
                          <Star
                            size={12}
                            className="text-yellow-500 fill-yellow-500"
                          />
                        )}
                      </div>

                      {!isSelectionMode && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEmailRead(email.id);
                            }}
                            className="p-1 hover:bg-muted rounded transition-colors"
                            title={
                              email.isRead
                                ? "Marquer comme non lu"
                                : "Marquer comme lu"
                            }
                          >
                            {email.isRead ? (
                              <MailOpen
                                size={14}
                                className="text-muted-foreground"
                              />
                            ) : (
                              <Mail size={14} className="text-primary" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEmailStar(email.id);
                            }}
                            className="p-1 hover:bg-muted rounded transition-colors"
                            title="Suivre"
                          >
                            <Star
                              size={14}
                              className={
                                email.isStarred
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-muted-foreground"
                              }
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEmailArchive?.(email.id);
                            }}
                            className="p-1 hover:bg-muted rounded transition-colors"
                            title="Archiver"
                          >
                            <Archive
                              size={14}
                              className="text-muted-foreground"
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEmailDelete?.(email.id);
                            }}
                            className="p-1 hover:bg-destructive/20 rounded transition-colors text-destructive"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
