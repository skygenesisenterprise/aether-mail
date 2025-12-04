"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "./Sidebar";
import EmailList from "./EmailList";
import EmailViewer from "./EmailViewer";
import Compose from "./Compose";
import Header from "./Header";
import { useEmails } from "../hooks/useEmails";
import type { Email as EmailType } from "../types/email";

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

export default function MailLayout() {
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<string | undefined>();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<
    "new" | "reply" | "replyAll" | "forward"
  >("new");

  // Utiliser le hook useEmails pour charger les vraies données
  const {
    emails: emailsData,
    markAsRead,
    markAsUnread,
    toggleStar,
    deleteEmail,
    archiveEmail,
  } = useEmails({
    folder: selectedFolder,
    autoRefresh: false,
  });

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
    async (emailId: string, isRead: boolean) => {
      try {
        if (isRead) {
          await markAsRead(emailId);
        } else {
          await markAsUnread(emailId);
        }
      } catch (error) {
        console.error("Erreur lors du marquage de l'email:", error);
      }
    },
    [markAsRead, markAsUnread],
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
  const handleEmailStarToggle = useCallback(
    async (emailId: string) => {
      try {
        await toggleStar(emailId);
      } catch (error) {
        console.error("Erreur lors du basculement de l'étoile:", error);
      }
    },
    [toggleStar],
  );

  // Callback pour mettre à jour l'état de lecture (alias)
  const handleToggleRead = useCallback(
    async (emailId: string, isRead: boolean) => {
      await handleEmailReadToggle(emailId, isRead);
    },
    [handleEmailReadToggle],
  );

  // Callback pour supprimer un email
  const handleDeleteEmail = useCallback(
    async (emailId: string) => {
      try {
        await deleteEmail(emailId);
        setSelectedEmail(undefined);
      } catch (error) {
        console.error("Erreur lors de la suppression de l'email:", error);
      }
    },
    [deleteEmail],
  );

  // Callback pour archiver un email
  const handleArchiveEmail = useCallback(
    async (emailId: string) => {
      try {
        await archiveEmail(emailId);
        setSelectedEmail(undefined);
      } catch (error) {
        console.error("Erreur lors de l'archivage de l'email:", error);
      }
    },
    [archiveEmail],
  );

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
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Colonne de gauche : App Switcher + Dossiers */}
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

        {/* Colonne de droite : Email Viewer ou Compose */}
        <div className="flex-1 flex flex-col">
          {isComposeOpen ? (
            <Compose
              isOpen={isComposeOpen}
              onClose={() => setIsComposeOpen(false)}
              mode={composeMode}
              originalEmail={
                selectedEmail
                  ? (emailsData[selectedEmail] as EmailType)
                  : undefined
              }
            />
          ) : (
            <EmailViewer
              emailId={selectedEmail}
              emails={emailsData}
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
    </div>
  );
}
