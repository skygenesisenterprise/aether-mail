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

interface Folder {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

const folders: Folder[] = [
  { id: "inbox", name: "Inbox", icon: Inbox, count: 12 },
  { id: "drafts", name: "Drafts", icon: File, count: 3 },
  { id: "sent", name: "Sent", icon: Send },
  { id: "trash", name: "Trash", icon: Trash2 },
  { id: "archive", name: "Archive", icon: Archive },
  { id: "junk", name: "Junk", icon: AlertCircle },
  { id: "notes", name: "Notes", icon: FileText },
  { id: "rss", name: "RSS Feed", icon: Rss },
  { id: "conversations", name: "Conversation history", icon: MessageSquare },
  { id: "research", name: "Research Paper", icon: BookOpen },
];

const favorites: Folder[] = [
  { id: "fav-inbox", name: "Inbox", icon: Inbox, count: 12 },
  { id: "fav-sent", name: "Sent", icon: Send },
  { id: "fav-drafts", name: "Drafts", icon: File, count: 3 },
];

interface EmailFolderProps {
  activeFolder?: string;
}

export function EmailFolder({ activeFolder = "inbox" }: EmailFolderProps) {
  const [favoritesOpen, setFavoritesOpen] = React.useState(true);

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
                    return (
                      <button
                        key={folder.id}
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
                        {folder.count !== undefined && (
                          <span className="text-xs text-muted-foreground">{folder.count}</span>
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
              const Icon = folder.icon;
              const isActive = folder.id === activeFolder;
              return (
                <button
                  key={folder.id}
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
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
