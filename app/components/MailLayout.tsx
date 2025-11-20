"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "./Sidebar";
import EmailList from "./EmailList";
import EmailViewer from "./EmailViewer";
import Compose from "./Compose";

interface Folder {
  id: string;
  name: string;
  type: "system" | "custom";
  emailCount: number;
  unreadCount: number;
  color?: string;
  icon?: string;
  createdAt?: string;
}

interface Email {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  attachments?: Array<{
    name: string;
    size: string;
    type: string;
  }>;
}

export default function MailLayout() {
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<string | undefined>();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<
    "new" | "reply" | "replyAll" | "forward"
  >("new");

  // État partagé pour les emails - initialiser vide en mode production
  const [emails, setEmails] = useState<Record<string, Email>>({});

  // État pour les dossiers personnalisés
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: "work",
      name: "Travail",
      type: "custom",
      emailCount: 89,
      unreadCount: 5,
      color: "#3B82F6",
      icon: "folder",
    },
    {
      id: "personal",
      name: "Personnel",
      type: "custom",
      emailCount: 34,
      unreadCount: 8,
      color: "#10B981",
      icon: "user",
    },
    {
      id: "projects",
      name: "Projets",
      type: "custom",
      emailCount: 156,
      unreadCount: 12,
      color: "#F59E0B",
      icon: "folder",
    },
  ]);

  // Callback pour mettre à jour l'état de lecture
  const handleEmailReadToggle = useCallback(
    (emailId: string, isRead: boolean) => {
      setEmails((prevEmails) => ({
        ...prevEmails,
        [emailId]: {
          ...prevEmails[emailId],
          isRead,
        },
      }));
    },
    [],
  );

  // Effet pour écouter les mises à jour de dossiers depuis AccountSpace
  useEffect(() => {
    const handleFoldersUpdate = (event: CustomEvent) => {
      setFolders(event.detail);
    };

    window.addEventListener(
      "foldersUpdated",
      handleFoldersUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "foldersUpdated",
        handleFoldersUpdate as EventListener,
      );
    };
  }, []);

  // Callback pour mettre à jour l'état de suivi
  const handleEmailStarToggle = useCallback((emailId: string) => {
    setEmails((prevEmails) => ({
      ...prevEmails,
      [emailId]: {
        ...prevEmails[emailId],
        isStarred: !prevEmails[emailId].isStarred,
      },
    }));
  }, []);

  // Callback pour mettre à jour l'état de lecture
  const handleToggleRead = useCallback((emailId: string, isRead: boolean) => {
    setEmails((prevEmails) => ({
      ...prevEmails,
      [emailId]: {
        ...prevEmails[emailId],
        isRead,
      },
    }));
  }, []);

  // Callback pour supprimer un email
  const handleDeleteEmail = useCallback((emailId: string) => {
    setEmails((prevEmails) => {
      const newEmails = { ...prevEmails };
      delete newEmails[emailId];
      return newEmails;
    });
    setSelectedEmail(undefined);
  }, []);

  // Callback pour archiver un email
  const handleArchiveEmail = useCallback((emailId: string) => {
    // Dans une vraie app, on déplacerait vers un dossier d'archive
    setEmails((prevEmails) => ({
      ...prevEmails,
      [emailId]: {
        ...prevEmails[emailId],
        // isArchived: true
      },
    }));
    setSelectedEmail(undefined);
  }, []);

  // Callbacks pour répondre
  const handleReply = useCallback((emailId: string) => {
    setComposeMode("reply");
    setIsComposeOpen(true);
  }, []);

  const handleReplyAll = useCallback((emailId: string) => {
    setComposeMode("replyAll");
    setIsComposeOpen(true);
  }, []);

  const handleForward = useCallback((emailId: string) => {
    setComposeMode("forward");
    setIsComposeOpen(true);
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Colonne de gauche : Dossiers */}
      <Sidebar
        selectedFolder={selectedFolder}
        folders={folders}
        onFolderSelect={(folder) => {
          setSelectedFolder(folder);
          setSelectedEmail(undefined); // Réinitialiser l'email sélectionné quand on change de dossier
        }}
        onCompose={() => {
          setComposeMode("new");
          setIsComposeOpen(true);
        }}
      />

      {/* Colonne du centre : Liste des emails */}
      <EmailList
        selectedEmail={selectedEmail}
        onEmailSelect={setSelectedEmail}
        selectedFolder={selectedFolder}
        onEmailDelete={handleDeleteEmail}
        onEmailArchive={handleArchiveEmail}
        onEmailReadToggle={handleToggleRead}
        onEmailStarToggle={handleEmailStarToggle}
      />

      <EmailViewer
        emailId={selectedEmail}
        onReply={handleReply}
        onReplyAll={handleReplyAll}
        onForward={handleForward}
        onDelete={handleDeleteEmail}
        onArchive={handleArchiveEmail}
        onToggleStar={handleEmailStarToggle}
        onToggleRead={handleToggleRead}
        onClose={() => setSelectedEmail(undefined)}
      />

      {/* Colonne de droite : Email Viewer ou Compose */}
      <div className="flex-1 flex flex-col">
        {isComposeOpen ? (
          <Compose
            isOpen={isComposeOpen}
            onClose={() => setIsComposeOpen(false)}
            mode={composeMode}
            originalEmail={selectedEmail ? emails[selectedEmail] : undefined}
          />
        ) : (
          <EmailViewer
            emailId={selectedEmail}
            emails={emails}
            onReply={(emailId) => {
              setComposeMode("reply");
              setIsComposeOpen(true);
            }}
            onReplyAll={(emailId) => {
              setComposeMode("replyAll");
              setIsComposeOpen(true);
            }}
            onForward={(emailId) => {
              setComposeMode("forward");
              setIsComposeOpen(true);
            }}
            onDelete={handleDeleteEmail}
            onArchive={handleArchiveEmail}
            onToggleStar={handleEmailStarToggle}
            onToggleRead={handleEmailReadToggle}
            onClose={() => {
              setSelectedEmail(undefined);
            }}
          />
        )}
      </div>
    </div>
  );
}
