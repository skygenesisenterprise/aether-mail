import { useState, useEffect, useCallback } from "react";
import { mailService } from "../lib/services/mailService";

export interface Email {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  body: string;
  preview: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  folder: string;
  attachments?: Array<{
    name: string;
    size: string;
    type: string;
  }>;
}

export interface UseEmailsOptions {
  folder?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseEmailsReturn {
  emails: Record<string, Email>;
  loading: boolean;
  error: string | null;
  selectedFolder: string;
  setSelectedFolder: (folder: string) => void;
  markAsRead: (emailId: string) => Promise<void>;
  markAsUnread: (emailId: string) => Promise<void>;
  toggleStar: (emailId: string) => Promise<void>;
  deleteEmail: (emailId: string) => Promise<void>;
  archiveEmail: (emailId: string) => Promise<void>;
  refreshEmails: () => Promise<void>;
}

export function useEmails({
  folder = "inbox",
  autoRefresh = false,
  refreshInterval = 30000,
}: UseEmailsOptions = {}): UseEmailsReturn {
  const [emails, setEmails] = useState<Record<string, Email>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState(folder);

  // Récupérer les emails depuis le serveur
  const fetchEmails = useCallback(async (folderName: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mailService.fetchEmails(folderName);

      if (result.success && result.data) {
        // Transformer les données en format Record<string, Email>
        const transformedEmails: Record<string, Email> = {};

        result.data.forEach((email) => {
          transformedEmails[email.id] = email;
        });

        setEmails(transformedEmails);
      } else {
        throw new Error(
          result.error || "Erreur lors de la récupération des emails",
        );
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des emails:", err);

      // Vérifier si c'est une erreur HTML (serveur down)
      const errorMessage =
        err instanceof Error ? err.message : "Erreur inconnue";
      if (
        errorMessage.includes("<!DOCTYPE") ||
        errorMessage.includes("<html>")
      ) {
        setError(
          "Le serveur mail est indisponible. Vérifiez que le backend est démarré sur le port 3000.",
        );
      } else if (errorMessage.includes("Failed to fetch")) {
        setError(
          "Impossible de se connecter au serveur. Vérifiez que le backend est en cours d'exécution.",
        );
      } else {
        setError(errorMessage);
      }

      // En cas d'erreur, initialiser avec un objet vide
      setEmails({});
    } finally {
      setLoading(false);
    }
  }, []);

  // Marquer un email comme lu
  const markAsRead = useCallback(async (emailId: string) => {
    try {
      const result = await mailService.markEmailAsRead(emailId, true);

      if (result.success) {
        setEmails((prev) => ({
          ...prev,
          [emailId]: {
            ...prev[emailId],
            isRead: true,
          },
        }));
      } else {
        throw new Error(result.error || "Erreur lors du marquage comme lu");
      }
    } catch (err) {
      console.error("Erreur lors du marquage comme lu:", err);
      throw err;
    }
  }, []);

  // Marquer un email comme non lu
  const markAsUnread = useCallback(async (emailId: string) => {
    try {
      const result = await mailService.markEmailAsRead(emailId, false);

      if (result.success) {
        setEmails((prev) => ({
          ...prev,
          [emailId]: {
            ...prev[emailId],
            isRead: false,
          },
        }));
      } else {
        throw new Error(result.error || "Erreur lors du marquage comme non lu");
      }
    } catch (err) {
      console.error("Erreur lors du marquage comme non lu:", err);
      throw err;
    }
  }, []);

  // Basculer l'étoile
  const toggleStar = useCallback(
    async (emailId: string) => {
      try {
        const currentEmail = emails[emailId];
        const newStarState = !currentEmail?.isStarred;

        const result = await mailService.toggleEmailStar(emailId, newStarState);

        if (result.success) {
          setEmails((prev) => ({
            ...prev,
            [emailId]: {
              ...prev[emailId],
              isStarred: newStarState,
            },
          }));
        } else {
          throw new Error(
            result.error || "Erreur lors du basculement de l'étoile",
          );
        }
      } catch (err) {
        console.error("Erreur lors du basculement de l'étoile:", err);
        throw err;
      }
    },
    [emails],
  );

  // Supprimer un email
  const deleteEmail = useCallback(async (emailId: string) => {
    try {
      const result = await mailService.deleteEmail(emailId);

      if (result.success) {
        setEmails((prev) => {
          const newEmails = { ...prev };
          delete newEmails[emailId];
          return newEmails;
        });
      } else {
        throw new Error(result.error || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      throw err;
    }
  }, []);

  // Archiver un email
  const archiveEmail = useCallback(async (emailId: string) => {
    try {
      const result = await mailService.archiveEmail(emailId, "archive");

      if (result.success) {
        setEmails((prev) => ({
          ...prev,
          [emailId]: {
            ...prev[emailId],
            folder: "archive",
          },
        }));
      } else {
        throw new Error(result.error || "Erreur lors de l'archivage");
      }
    } catch (err) {
      console.error("Erreur lors de l'archivage:", err);
      throw err;
    }
  }, []);

  // Rafraîchir les emails
  const refreshEmails = useCallback(async () => {
    await fetchEmails(selectedFolder);
  }, [fetchEmails, selectedFolder]);

  // Charger les emails au montage
  useEffect(() => {
    fetchEmails(selectedFolder);
  }, [selectedFolder, fetchEmails]);

  // Écouter les événements de connexion mail pour recharger les emails
  useEffect(() => {
    const handleMailConnected = () => {
      console.log("Mail connecté, rechargement des emails...");
      fetchEmails(selectedFolder);
    };

    window.addEventListener("mailConnected", handleMailConnected);

    return () => {
      window.removeEventListener("mailConnected", handleMailConnected);
    };
  }, [selectedFolder, fetchEmails]);

  // Vérifier l'état de connexion et recharger si nécessaire
  useEffect(() => {
    const checkConnectionAndLoad = () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated");
      const mailEmail = localStorage.getItem("mailEmail");

      if (isAuthenticated === "true" && mailEmail) {
        console.log("Utilisateur authentifié, chargement des emails...");
        fetchEmails(selectedFolder);
      }
    };

    checkConnectionAndLoad();
  }, [selectedFolder, fetchEmails]);

  // Auto-rafraîchissement
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchEmails(selectedFolder);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, selectedFolder, fetchEmails]);

  return {
    emails,
    loading,
    error,
    selectedFolder,
    setSelectedFolder,
    markAsRead,
    markAsUnread,
    toggleStar,
    deleteEmail,
    archiveEmail,
    refreshEmails,
  };
}

// Fonction utilitaire pour formater les dates
function formatDate(dateString: string | number | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) {
    return "Il y a quelques minutes";
  } else if (diffHours < 24) {
    return `Il y a ${diffHours}h`;
  } else if (diffDays === 1) {
    return "Hier";
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jours`;
  } else {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

// Plus de données de démonstration - utilisation uniquement des vraies données du serveur
