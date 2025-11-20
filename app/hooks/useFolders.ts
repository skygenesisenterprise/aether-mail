import { useState, useEffect, useCallback } from "react";

interface Folder {
  id: string;
  name: string;
  type: "system" | "custom";
  emailCount: number;
  unreadCount: number;
  color?: string;
  icon?: string;
}

interface UseFoldersOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useFolders(options: UseFoldersOptions = {}) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("mailUserId") : null;
  const userEmail =
    typeof window !== "undefined" ? localStorage.getItem("mailEmail") : null;

  const fetchFolders = useCallback(async () => {
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/mail/folders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
          "x-user-email": userEmail || "",
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch folders");
      }

      // Transformer les dossiers de l'API vers notre format
      const transformedFolders: Folder[] = data.folders.map(
        (folderName: string, index: number) => {
          // Mapper les noms de dossiers IMAP standards vers nos noms français
          const folderMapping: Record<
            string,
            { name: string; icon: string; type: "system" | "custom" }
          > = {
            INBOX: {
              name: "Boîte de réception",
              icon: "inbox",
              type: "system",
            },
            Sent: { name: "Envoyés", icon: "sent", type: "system" },
            Drafts: { name: "Brouillons", icon: "drafts", type: "system" },
            Starred: { name: "Suivis", icon: "starred", type: "system" },
            Archive: { name: "Archive", icon: "archive", type: "system" },
            Trash: { name: "Corbeille", icon: "trash", type: "system" },
            Spam: { name: "Spam", icon: "spam", type: "system" },
          };

          const mappedFolder = folderMapping[folderName] || {
            name: folderName,
            icon: "folder",
            type: "custom" as const,
          };

          return {
            id: folderName.toLowerCase(),
            name: mappedFolder.name,
            type: mappedFolder.type,
            emailCount: 0, // Sera mis à jour quand on charge les emails
            unreadCount: 0, // Sera mis à jour quand on charge les emails
            color: mappedFolder.type === "system" ? undefined : "#3b82f6",
            icon: mappedFolder.icon,
          };
        },
      );

      setFolders(transformedFolders);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Failed to fetch folders:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, userEmail]);

  const refreshFolders = useCallback(() => {
    fetchFolders();
  }, [fetchFolders]);

  // Charger les dossiers au montage
  useEffect(() => {
    if (userId) {
      fetchFolders();
    }
  }, [fetchFolders, userId]);

  // Auto-rafraîchissement si activé
  useEffect(() => {
    if (options.autoRefresh && options.refreshInterval) {
      const interval = setInterval(refreshFolders, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval, refreshFolders]);

  return {
    folders,
    loading,
    error,
    refreshFolders,
  };
}
