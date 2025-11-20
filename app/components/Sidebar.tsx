import { useState, useEffect, useRef, useMemo } from "react";
import React from "react";
import {
  Mail,
  Send,
  FileText,
  Trash2,
  Archive,
  Star,
  Search,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  User,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  Monitor,
  Moon,
  Sun,
  Folder,
  FolderOpen,
  Edit3,
  X,
  Github,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import AccountSpace from "./AccountSpace";
import { useAppVersion } from "../hooks/useAppVersion";
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

interface SidebarProps {
  selectedFolder?: string;
  onFolderSelect?: (folder: string) => void;
  onCompose?: () => void;
  folders?: Folder[];
}

export default function Sidebar({
  selectedFolder = "inbox",
  onFolderSelect,
  onCompose,
  folders = [],
}: SidebarProps) {
  // Utiliser le hook useEmails pour obtenir les vrais compteurs d'emails
  const { emails } = useEmails({
    folder: selectedFolder,
    autoRefresh: false, // Pas besoin de rafraîchissement automatique ici
  });

  // Calculer les compteurs d'emails par dossier
  const folderCounts = useMemo(() => {
    const emailsList = Object.values(emails);

    return {
      inbox: emailsList.filter((e) => (e.folder || "inbox") === "inbox").length,
      sent: emailsList.filter((e) => e.folder === "sent").length,
      drafts: emailsList.filter((e) => e.folder === "drafts").length,
      starred: emailsList.filter((e) => e.isStarred).length,
      archive: emailsList.filter((e) => e.folder === "archive").length,
      trash: emailsList.filter((e) => e.folder === "trash").length,
      unread: emailsList.filter(
        (e) => !e.isRead && (e.folder || "inbox") === "inbox",
      ).length,
    };
  }, [emails]);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isAccountSpaceOpen, setIsAccountSpaceOpen] = useState(false);
  const [isCustomFoldersExpanded, setIsCustomFoldersExpanded] = useState(true);
  const [isEditingFolder, setIsEditingFolder] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [draggedFolder, setDraggedFolder] = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [orderedFolders, setOrderedFolders] = useState<string[]>([]);
  const { theme, toggleTheme } = useTheme();
  const { version: appVersion, isLoading: isLoadingVersion } = useAppVersion();
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return Moon;
      case "light":
        return Sun;
      case "system":
        return Monitor;
      default:
        return Moon;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "dark":
        return "Thème sombre";
      case "light":
        return "Thème clair";
      case "system":
        return "Thème système";
      default:
        return "Thème sombre";
    }
  };

  const accountOptions = [
    {
      id: "account-space",
      name: "Espace compte",
      icon: User,
      action: () => setIsAccountSpaceOpen(true),
    },
    { id: "help", name: "Aide", icon: HelpCircle },
    { id: "logout", name: "Déconnexion", icon: LogOut },
  ];
  const systemFolders = [
    {
      id: "inbox",
      name: "Boîte de réception",
      icon: Mail,
      count: folderCounts.inbox,
    },
    { id: "sent", name: "Envoyés", icon: Send, count: folderCounts.sent },
    {
      id: "drafts",
      name: "Brouillons",
      icon: FileText,
      count: folderCounts.drafts,
    },
    { id: "starred", name: "Suivis", icon: Star, count: folderCounts.starred },
    {
      id: "archive",
      name: "Archive",
      icon: Archive,
      count: folderCounts.archive,
    },
    { id: "trash", name: "Corbeille", icon: Trash2, count: folderCounts.trash },
  ];

  // Obtenir l'icône pour les dossiers personnalisés
  const getCustomFolderIcon = (iconType?: string) => {
    switch (iconType) {
      case "folder":
        return Folder;
      case "briefcase":
        return Folder; // Temporaire, à remplacer par une icône appropriée
      case "user":
        return User;
      case "star":
        return Star;
      case "tag":
        return FileText; // Temporaire
      case "heart":
        return Star; // Temporaire
      default:
        return Folder;
    }
  };

  // Gestion du drag & drop
  const handleDragStart = (e: React.DragEvent, folderId: string) => {
    setDraggedFolder(folderId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (folderId: string) => {
    setDragOverFolder(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedFolder && draggedFolder !== targetFolderId) {
      const customFolders = folders.filter((f) => f.type === "custom");
      const draggedIndex = customFolders.findIndex(
        (f) => f.id === draggedFolder,
      );
      const targetIndex = customFolders.findIndex(
        (f) => f.id === targetFolderId,
      );

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newFolders = [...customFolders];
        const [draggedItem] = newFolders.splice(draggedIndex, 1);
        newFolders.splice(targetIndex, 0, draggedItem);

        // Mettre à jour l'ordre des dossiers
        const updatedFolders = [
          ...folders.filter((f) => f.type === "system"),
          ...newFolders,
        ];

        // Ici vous pourriez appeler une API pour sauvegarder le nouvel ordre
        console.log(
          "Nouvel ordre des dossiers:",
          newFolders.map((f) => f.id),
        );
      }
    }

    setDraggedFolder(null);
    setDragOverFolder(null);
  };

  const handleDragEnd = () => {
    setDraggedFolder(null);
    setDragOverFolder(null);
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Bouton Nouveau message en haut */}
      <div className="p-4 pt-6 border-b border-border">
        <button
          type="button"
          onClick={onCompose}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span className="font-medium">Nouveau message</span>
        </button>
      </div>

      <div className="px-4 pt-4 pb-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full bg-muted text-card-foreground rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary placeholder-muted-foreground"
          />
        </div>
      </div>

      <nav className="flex-1 px-2">
        {/* Dossiers système */}
        <div className="mb-4">
          {systemFolders.map((folder) => {
            const Icon = folder.icon;
            const isActive = selectedFolder === folder.id;

            return (
              <button
                type="button"
                key={folder.id}
                onClick={() => onFolderSelect?.(folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? "bg-muted text-card-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span className="text-sm font-medium">{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                    {folder.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dossiers personnalisés */}
        {folders.filter((f) => f.type === "custom").length > 0 && (
          <div className="border-t border-border pt-2">
            <button
              type="button"
              onClick={() =>
                setIsCustomFoldersExpanded(!isCustomFoldersExpanded)
              }
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg mb-1 text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors"
            >
              <div className="flex items-center gap-2">
                {isCustomFoldersExpanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Dossiers
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {folders.filter((f) => f.type === "custom").length}
              </span>
            </button>

            {isCustomFoldersExpanded && (
              <div className="space-y-1">
                {/* Bouton pour ajouter un nouveau dossier */}
                <button
                  type="button"
                  onClick={() => {
                    // Ouvrir l'espace compte avec l'onglet dossiers
                    console.log("Ouvrir la gestion des dossiers");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors border border-dashed border-border"
                >
                  <Plus size={16} />
                  <span className="text-sm">Nouveau dossier</span>
                </button>

                {/* Zone de drop pour le début de la liste */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedFolder) {
                      const customFolders = folders.filter(
                        (f) => f.type === "custom",
                      );
                      const draggedIndex = customFolders.findIndex(
                        (f) => f.id === draggedFolder,
                      );

                      if (draggedIndex > 0) {
                        const newFolders = [...customFolders];
                        const [draggedItem] = newFolders.splice(
                          draggedIndex,
                          1,
                        );
                        newFolders.unshift(draggedItem);

                        console.log(
                          "Déplacer au début:",
                          newFolders.map((f) => f.id),
                        );
                      }
                    }
                    handleDragEnd();
                  }}
                  className={`h-1 rounded-full transition-all ${
                    dragOverFolder === "top" ? "bg-primary h-2" : ""
                  }`}
                  onDragEnter={() => setDragOverFolder("top")}
                />

                {folders
                  .filter((folder) => folder.type === "custom")
                  .map((folder) => {
                    const isActive = selectedFolder === folder.id;
                    const isEditing = isEditingFolder === folder.id;
                    const Icon = getCustomFolderIcon(folder.icon);

                    // Calculer les vrais compteurs pour ce dossier personnalisé
                    const folderEmailCount = useMemo(() => {
                      const emailsList = Object.values(emails);
                      return emailsList.filter((e) => e.folder === folder.id)
                        .length;
                    }, [emails, folder.id]);

                    const folderUnreadCount = useMemo(() => {
                      const emailsList = Object.values(emails);
                      return emailsList.filter(
                        (e) => e.folder === folder.id && !e.isRead,
                      ).length;
                    }, [emails, folder.id]);

                    return (
                      <React.Fragment key={folder.id}>
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, folder.id)}
                          onDragOver={handleDragOver}
                          onDragEnter={() => handleDragEnter(folder.id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, folder.id)}
                          onDragEnd={handleDragEnd}
                          className={`group flex items-center rounded-lg transition-all cursor-move ${
                            isActive
                              ? "bg-muted text-card-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
                          } ${
                            draggedFolder === folder.id
                              ? "opacity-50 scale-95"
                              : ""
                          } ${
                            dragOverFolder === folder.id &&
                            draggedFolder !== folder.id
                              ? "border-2 border-dashed border-primary bg-primary/5"
                              : ""
                          }`}
                        >
                          {/* Poignée de drag */}
                          <div className="flex items-center justify-center px-1 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-1 h-4 bg-muted-foreground/30 rounded-full space-y-1">
                              <div className="w-full h-1 bg-muted-foreground/30 rounded-full"></div>
                              <div className="w-full h-1 bg-muted-foreground/30 rounded-full"></div>
                              <div className="w-full h-1 bg-muted-foreground/30 rounded-full"></div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onFolderSelect?.(folder.id)}
                            className="flex-1 flex items-center justify-between px-3 py-2"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="flex items-center justify-center"
                                style={{ color: folder.color }}
                              >
                                <Icon size={16} />
                              </div>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingFolderName}
                                  onChange={(e) =>
                                    setEditingFolderName(e.target.value)
                                  }
                                  onBlur={() => {
                                    // Ici vous pourriez appeler une API pour renommer le dossier
                                    setIsEditingFolder(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      // Ici vous pourriez appeler une API pour renommer le dossier
                                      setIsEditingFolder(null);
                                    }
                                    if (e.key === "Escape") {
                                      setIsEditingFolder(null);
                                    }
                                  }}
                                  className="text-sm font-medium bg-background border border-border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <span className="text-sm font-medium">
                                  {folder.name}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {folderUnreadCount > 0 && (
                                <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                                  {folderUnreadCount}
                                </span>
                              )}
                              {folderEmailCount > 0 && (
                                <span className="bg-muted text-muted-foreground text-xs rounded-full px-2 py-1">
                                  {folderEmailCount}
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Actions du dossier (édition, suppression) */}
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsEditingFolder(folder.id);
                                setEditingFolderName(folder.name);
                              }}
                              className="p-1 hover:bg-muted rounded transition-colors"
                              title="Renommer"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Ici vous pourriez appeler une API pour supprimer le dossier
                                console.log("Supprimer le dossier:", folder.id);
                              }}
                              className="p-1 hover:bg-destructive/20 rounded transition-colors text-destructive"
                              title="Supprimer"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Zone de drop entre les dossiers */}
                        <div
                          onDragOver={handleDragOver}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedFolder && draggedFolder !== folder.id) {
                              const customFolders = folders.filter(
                                (f) => f.type === "custom",
                              );
                              const draggedIndex = customFolders.findIndex(
                                (f) => f.id === draggedFolder,
                              );
                              const targetIndex = customFolders.findIndex(
                                (f) => f.id === folder.id,
                              );

                              if (draggedIndex !== -1 && targetIndex !== -1) {
                                const newFolders = [...customFolders];
                                const [draggedItem] = newFolders.splice(
                                  draggedIndex,
                                  1,
                                );
                                newFolders.splice(
                                  targetIndex + 1,
                                  0,
                                  draggedItem,
                                );

                                console.log(
                                  "Déplacer après",
                                  folder.name,
                                  ":",
                                  newFolders.map((f) => f.id),
                                );
                              }
                            }
                            handleDragEnd();
                          }}
                          className={`h-1 rounded-full transition-all mx-3 ${
                            dragOverFolder === `after-${folder.id}`
                              ? "bg-primary h-2"
                              : ""
                          }`}
                          onDragEnter={() =>
                            setDragOverFolder(`after-${folder.id}`)
                          }
                        />
                      </React.Fragment>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-border relative" ref={menuRef}>
        {/* Menu déroulant qui s'affiche au-dessus */}
        {isAccountMenuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-card border border-border rounded-lg shadow-lg z-50">
            <div className="p-1">
              {accountOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={option.action}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      option.id === "logout"
                        ? "text-destructive hover:bg-destructive/20 hover:text-destructive-foreground"
                        : option.id === "theme"
                          ? "text-primary hover:bg-primary/20 hover:text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm">{option.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
            isAccountMenuOpen
              ? "bg-muted text-card-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-card-foreground"
          }`}
        >
          <div className="flex items-center gap-3">
            <Settings size={18} />
            <span className="text-sm font-medium">Espace compte</span>
          </div>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isAccountMenuOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Section App Information - en dessous de Espace compte */}
      <div className="px-4 pb-4">
        <div className="bg-gradient-to-r from-primary/5 to-muted/30 rounded-lg border border-border/50">
          <a
            href="https://github.com/skygenesisenterprise/aether-mail"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                <Mail size={12} className="text-primary" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  Aether Mail
                </h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {isLoadingVersion ? (
                    <>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span>Chargement...</span>
                    </>
                  ) : (
                    <>
                      <span>Version</span>
                      <span className="font-mono">{appVersion}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Github
                size={16}
                className="text-muted-foreground group-hover:text-primary transition-colors"
              />
              <ExternalLink
                size={10}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground group-hover:text-primary"
              />
            </div>
          </a>
        </div>
      </div>

      {/* Espace compte modal */}
      {isAccountSpaceOpen && (
        <AccountSpace
          userProfile={{
            id: "1",
            name: "Utilisateur",
            email: "user@example.com",
            status: "online",
            role: "Utilisateur",
            department: "General",
            location: "France",
            joinDate: "Aujourd'hui",
            lastLogin: "Maintenant",
          }}
          onProfileUpdate={(profile: any) => {
            console.log("Profile updated:", profile);
          }}
          onLogout={() => {
            console.log("User logged out");
            setIsAccountSpaceOpen(false);
          }}
          isOpen={isAccountSpaceOpen}
          onClose={() => setIsAccountSpaceOpen(false)}
        />
      )}
    </div>
  );
}
