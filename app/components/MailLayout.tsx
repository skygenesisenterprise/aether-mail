"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "./Sidebar";
import EmailList from "./EmailList";
import EmailViewer, { emailsData } from "./EmailViewer";
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

  // État partagé pour les emails
  const [emails, setEmails] = useState<Record<string, Email>>(emailsData);

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

  // Callback pour supprimer un email
  const handleEmailDelete = useCallback((emailId: string) => {
    setEmails((prevEmails) => {
      const newEmails = { ...prevEmails };
      delete newEmails[emailId];
      return newEmails;
    });
    setSelectedEmail(undefined);
  }, []);

  // Callback pour archiver un email
  const handleEmailArchive = useCallback((emailId: string) => {
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
        emails={emails}
        onEmailDelete={handleEmailDelete}
        onEmailArchive={handleEmailArchive}
        onEmailReadToggle={handleEmailReadToggle}
        onEmailStarToggle={handleEmailStarToggle}
      />

      {/* Colonne de droite : Email Viewer ou Compose */}
      <div className="flex-1 flex flex-col">
        {isComposeOpen ? (
          <Compose
            isOpen={isComposeOpen}
            onClose={() => setIsComposeOpen(false)}
            mode={composeMode}
            originalEmail={
              selectedEmail ? emailsData[selectedEmail] : undefined
            }
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
            onDelete={handleEmailDelete}
            onArchive={handleEmailArchive}
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
