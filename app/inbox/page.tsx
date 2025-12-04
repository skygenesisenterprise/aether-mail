"use client";

import { useState, useCallback, useEffect } from "react";
import { Mail } from "lucide-react";
import Sidebar from "../components/Sidebar";
import EmailList from "../components/EmailList";
import EmailViewer from "../components/EmailViewer";
import Compose from "../components/Compose";
import Header from "../components/Header";
import { useEmails } from "../hooks/useEmails";

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

export default function InboxPage() {
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
      unreadCount: 12,
      color: "#3B82F6",
      icon: "folder",
    },
    {
      id: "personal",
      name: "Personnel",
      type: "custom",
      emailCount: 156,
      unreadCount: 8,
      color: "#10B981",
      icon: "folder",
    },
    {
      id: "projects",
      name: "Projets",
      type: "custom",
      emailCount: 234,
      unreadCount: 45,
      color: "#F59E0B",
      icon: "folder",
    },
    {
      id: "archive-2023",
      name: "Archive 2023",
      type: "custom",
      emailCount: 567,
      unreadCount: 0,
      color: "#6B7280",
      icon: "folder",
    },
  ]);

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

  // Callbacks pour les actions sur les emails
  const handleEmailDelete = useCallback(
    async (emailId: string) => {
      try {
        await deleteEmail(emailId);
        // Si l'email supprimé était celui sélectionné, le désélectionner
        if (selectedEmail === emailId) {
          setSelectedEmail(undefined);
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de l'email:", error);
      }
    },
    [deleteEmail, selectedEmail],
  );

  const handleEmailArchive = useCallback(
    async (emailId: string) => {
      try {
        await archiveEmail(emailId);
        // Si l'email archivé était celui sélectionné, le désélectionner
        if (selectedEmail === emailId) {
          setSelectedEmail(undefined);
        }
      } catch (error) {
        console.error("Erreur lors de l'archivage de l'email:", error);
      }
    },
    [archiveEmail, selectedEmail],
  );

  const handleToggleRead = useCallback(
    async (emailId: string) => {
      try {
        const email = emailsData[emailId];
        if (email) {
          if (email.isRead) {
            await markAsUnread(emailId);
          } else {
            await markAsRead(emailId);
          }
        }
      } catch (error) {
        console.error("Erreur lors du changement de statut de lecture:", error);
      }
    },
    [emailsData, markAsRead, markAsUnread],
  );

  const handleEmailStarToggle = useCallback(
    async (emailId: string) => {
      try {
        await toggleStar(emailId);
      } catch (error) {
        console.error("Erreur lors du changement de statut d'étoile:", error);
      }
    },
    [toggleStar],
  );

  // Gestion du changement de dossier
  const handleFolderSelect = useCallback((folder: string) => {
    setSelectedFolder(folder);
    setSelectedEmail(undefined); // Réinitialiser l'email sélectionné quand on change de dossier
  }, []);

  // Gestion de la composition
  const handleCompose = useCallback(() => {
    setComposeMode("new");
    setIsComposeOpen(true);
  }, []);

  const handleCloseCompose = useCallback(() => {
    setIsComposeOpen(false);
  }, []);

  // Effet pour charger les emails quand le dossier change
  useEffect(() => {
    // Le hook useEmails gère déjà le chargement automatique
    console.log(`Chargement des emails pour le dossier: ${selectedFolder}`);
  }, [selectedFolder]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Colonne de gauche : App Switcher + Dossiers */}
        <Sidebar
          selectedFolder={selectedFolder}
          folders={folders}
          onFolderSelect={handleFolderSelect}
          onCompose={handleCompose}
        />

        {/* Colonne du centre : Liste des emails */}
        <EmailList
          selectedEmail={selectedEmail}
          onEmailSelect={setSelectedEmail}
          selectedFolder={selectedFolder}
          onEmailDelete={handleEmailDelete}
          onEmailArchive={handleEmailArchive}
          onEmailReadToggle={handleToggleRead}
          onEmailStarToggle={handleEmailStarToggle}
        />

        {/* Colonne de droite : Visualisation de l'email ou Compose */}
        <div className="flex-1 flex flex-col">
          {isComposeOpen ? (
            <Compose
              mode={composeMode}
              originalEmail={
                composeMode !== "new" && selectedEmail
                  ? emailsData[selectedEmail]
                  : undefined
              }
              onClose={handleCloseCompose}
              isOpen={true}
            />
          ) : selectedEmail ? (
            <EmailViewer
              emailId={selectedEmail}
              emails={emailsData}
              onReply={() => handleReply(selectedEmail)}
              onReplyAll={() => handleReplyAll(selectedEmail)}
              onForward={() => handleForward(selectedEmail)}
              onDelete={() => handleEmailDelete(selectedEmail)}
              onArchive={() => handleEmailArchive(selectedEmail)}
              onToggleRead={(emailId, isRead) => handleToggleRead(emailId)}
              onToggleStar={() => handleEmailStarToggle(selectedEmail)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={32} className="text-muted-foreground/60" />
                </div>
                <p className="text-lg font-medium text-foreground">
                  Sélectionnez un e-mail
                </p>
                <p className="text-sm mt-2">
                  Choisissez un e-mail dans la liste pour afficher son contenu
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
