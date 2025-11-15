import { useState, useEffect, useRef } from "react";
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
  User,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface SidebarProps {
  selectedFolder?: string;
  onFolderSelect?: (folder: string) => void;
  onCompose?: () => void;
}

export default function Sidebar({
  selectedFolder = "inbox",
  onFolderSelect,
  onCompose,
}: SidebarProps) {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
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
    { id: "profile", name: "Profil", icon: User },
    { id: "security", name: "Sécurité", icon: Shield },
    { id: "notifications", name: "Notifications", icon: Bell },
    {
      id: "theme",
      name: getThemeLabel(),
      icon: getThemeIcon(),
      action: toggleTheme,
    },
    { id: "help", name: "Aide", icon: HelpCircle },
    { id: "logout", name: "Déconnexion", icon: LogOut },
  ];
  const folders = [
    { id: "inbox", name: "Boîte de réception", icon: Mail, count: 12 },
    { id: "sent", name: "Envoyés", icon: Send, count: 0 },
    { id: "drafts", name: "Brouillons", icon: FileText, count: 3 },
    { id: "starred", name: "Suivis", icon: Star, count: 5 },
    { id: "archive", name: "Archive", icon: Archive, count: 0 },
    { id: "trash", name: "Corbeille", icon: Trash2, count: 0 },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4">
        <button
          type="button"
          onClick={onCompose}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={20} />
          <span className="font-medium">Nouveau message</span>
        </button>
      </div>

      <div className="px-4 pb-4">
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
        {folders.map((folder) => {
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
                <span className="bg-muted text-muted-foreground text-xs rounded-full px-2 py-1">
                  {folder.count}
                </span>
              )}
            </button>
          );
        })}
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
    </div>
  );
}
