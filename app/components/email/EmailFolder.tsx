"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox,
  Send,
  File,
  AlertCircle,
  Trash2,
  Archive,
  FileText,
  Rss,
  MessageSquare,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { emailApi, type Folder } from "@/lib/api/email";
import { useAuth } from "@/context/AuthContext";

const folderIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  INBOX: Inbox,
  Drafts: File,
  Sent: Send,
  Trash: Trash2,
  Archive: Archive,
  Junk: AlertCircle,
  Notes: FileText,
  RSS: Rss,
  Conversations: MessageSquare,
  Research: BookOpen,
};

interface EmailFolderProps {
  activeFolder?: string;
  onFolderChange?: (folderId: string) => void;
}

const defaultFolders: Folder[] = [
  {
    id: "INBOX",
    name: "Inbox",
    path: "INBOX",
    totalEmails: 12,
    unreadEmails: 3,
    isSelectable: true,
    subscribed: true,
  },
  {
    id: "Drafts",
    name: "Drafts",
    path: "Drafts",
    totalEmails: 3,
    unreadEmails: 0,
    isSelectable: true,
    subscribed: true,
  },
  {
    id: "Sent",
    name: "Sent",
    path: "Sent",
    totalEmails: 0,
    unreadEmails: 0,
    isSelectable: true,
    subscribed: true,
  },
  {
    id: "Trash",
    name: "Trash",
    path: "Trash",
    totalEmails: 0,
    unreadEmails: 0,
    isSelectable: true,
    subscribed: true,
  },
  {
    id: "Archive",
    name: "Archive",
    path: "Archive",
    totalEmails: 0,
    unreadEmails: 0,
    isSelectable: true,
    subscribed: true,
  },
  {
    id: "Junk",
    name: "Junk",
    path: "Junk",
    totalEmails: 0,
    unreadEmails: 0,
    isSelectable: true,
    subscribed: true,
  },
  {
    id: "Notes",
    name: "Notes",
    path: "Notes",
    totalEmails: 0,
    unreadEmails: 0,
    isSelectable: true,
    subscribed: true,
  },
];

const favorites: { id: string; name: string; icon: React.ComponentType<{ className?: string }> }[] =
  [
    { id: "INBOX", name: "Inbox", icon: Inbox },
    { id: "Sent", name: "Sent", icon: Send },
    { id: "Drafts", name: "Drafts", icon: File },
  ];

export function EmailFolder({ activeFolder = "INBOX", onFolderChange }: EmailFolderProps) {
  const { isAuthenticated, user } = useAuth();
  const [folders, setFolders] = React.useState<Folder[]>(defaultFolders);
  const [isLoading, setIsLoading] = React.useState(false);
  const [favoritesOpen, setFavoritesOpen] = React.useState(false);

  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("accessToken");

  React.useEffect(() => {
    console.log(
      "[EmailFolder] isAuthenticated:",
      isAuthenticated,
      "user:",
      !!user,
      "hasToken:",
      hasToken
    );
    if (!isAuthenticated || !user || !hasToken) {
      console.log("[EmailFolder] Skipping fetch - not authenticated");
      return;
    }

    console.log("[EmailFolder] Fetching folders...");
    const fetchFolders = async () => {
      try {
        const response = await emailApi.getFolders("default");
        if (response.success && response.data?.folders) {
          setFolders(response.data.folders);
        }
      } catch (err) {
        console.error("Failed to fetch folders:", err);
      }
    };
    fetchFolders();
  }, [isAuthenticated, user]);

  const handleFolderClick = (folderId: string) => {
    onFolderChange?.(folderId);
  };

  const getFolderIcon = (folderName: string) => {
    return folderIcons[folderName] || Inbox;
  };

  const getFolderCount = (folderId: string) => {
    const folder = folders.find((f) => f.id === folderId);
    return folder?.unreadEmails || 0;
  };

  return (
    <div className="w-60 border-r bg-background h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <div className="mb-4">
          <button
            onClick={() => setFavoritesOpen(!favoritesOpen)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
              "text-foreground hover:bg-accent/50"
            )}
          >
            <span className="font-semibold">Favorites</span>
            <motion.span
              animate={{ rotate: favoritesOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.span>
          </button>

          <AnimatePresence>
            {favoritesOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-0.5 mt-1">
                  {favorites.map((folder) => {
                    const Icon = folder.icon;
                    const isActive = folder.id === activeFolder;
                    const count = getFolderCount(folder.id);
                    return (
                      <button
                        key={folder.id}
                        onClick={() => handleFolderClick(folder.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span>{folder.name}</span>
                        </span>
                        {count > 0 && (
                          <span className="text-xs text-muted-foreground">{count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
            Folders
          </h3>
          <nav className="space-y-0.5">
            {folders.map((folder) => {
              const Icon = getFolderIcon(folder.name);
              const isActive = folder.id === activeFolder;
              return (
                <button
                  key={folder.id}
                  onClick={() => handleFolderClick(folder.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{folder.name}</span>
                  </span>
                  {folder.unreadEmails > 0 && (
                    <span className="text-xs text-muted-foreground">{folder.unreadEmails}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
