import { useState } from "react";
import { Star, Archive, Trash2, Paperclip } from "lucide-react";

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
  onEmailDelete?: (emailId: string) => void;
  onEmailArchive?: (emailId: string) => void;
}

export default function EmailList({
  selectedEmail,
  onEmailSelect,
  selectedFolder = "inbox",
  onEmailDelete,
  onEmailArchive,
}: EmailListProps) {
  const allEmails: Email[] = [
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

  const getFolderEmails = (folder: string): Email[] => {
    switch (folder) {
      case "inbox":
        return allEmails.filter(
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
        return allEmails.filter((e) => e.isStarred);
      case "archive":
        return [];
      case "trash":
        return [];
      default:
        return allEmails;
    }
  };

  const emails = getFolderEmails(selectedFolder);

  return (
    <div className="w-96 bg-gray-950 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            {selectedFolder === "inbox" && "Boîte de réception"}
            {selectedFolder === "sent" && "Envoyés"}
            {selectedFolder === "drafts" && "Brouillons"}
            {selectedFolder === "starred" && "Suivis"}
            {selectedFolder === "archive" && "Archive"}
            {selectedFolder === "trash" && "Corbeille"}
          </h2>
          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
            {emails.filter((e) => !e.isRead).length}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg px-3 py-2 transition-colors"
          >
            Tout lire
          </button>
          <button
            type="button"
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg px-3 py-2 transition-colors"
          >
            Filtrer
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {emails.map((email) => (
          <div
            key={email.id}
            onClick={() => onEmailSelect?.(email.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onEmailSelect?.(email.id);
              }
            }}
            role="button"
            tabIndex={0}
            className={`p-4 border-b border-gray-800 cursor-pointer transition-colors ${
              selectedEmail === email.id ? "bg-gray-800" : "hover:bg-gray-900"
            } ${!email.isRead ? "bg-blue-950/20" : ""}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-white">
                    {email.from.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-sm truncate ${!email.isRead ? "font-semibold text-white" : "text-gray-300"}`}
                    >
                      {email.from}
                    </h3>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {email.date}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {email.fromEmail}
                  </p>
                </div>
              </div>
            </div>

            <h4
              className={`text-sm mb-1 truncate ${!email.isRead ? "font-medium text-white" : "text-gray-200"}`}
            >
              {email.subject}
            </h4>

            <p className="text-xs text-gray-400 line-clamp-2 mb-2">
              {email.preview}
            </p>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {email.hasAttachment && (
                  <Paperclip size={14} className="text-gray-500" />
                )}
                {email.isStarred && (
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                )}
              </div>

              <div className="flex gap-1 ml-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEmailArchive?.(email.id);
                  }}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <Archive size={14} className="text-gray-400" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEmailDelete?.(email.id);
                  }}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <Trash2 size={14} className="text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
