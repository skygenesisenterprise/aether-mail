"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Monitor,
  Moon,
  Sun,
  ChevronDown,
  Mail,
  Calendar,
  Users,
  CheckSquare,
  HardDrive,
  Grid3x3,
  FileText,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../context/JwtAuthContext";
import { useAppVersion } from "../hooks/useAppVersion";
import { useGlobalShortcuts } from "../hooks/useKeyboardShortcuts";
import AccountSpace from "./AccountSpace";

interface HeaderProps {
  onSearch?: (query: string) => void;
  title?: string;
  showSearch?: boolean;
  showUserMenu?: boolean;
  showNavigation?: boolean;
}

export default function Header({
  onSearch,
  title = "Aether Mail",
  showSearch = true,
  showUserMenu = true,
  showNavigation = true,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isAccountSpaceOpen, setIsAccountSpaceOpen] = useState(false);
  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, isLoading: authLoading } = useAuth();
  const { version: appVersion, isLoading: isLoadingVersion } = useAppVersion();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Récupérer les informations utilisateur depuis localStorage si le contexte est vide
  const getUserInfo = () => {
    if (user) {
      return user;
    }

    // Fallback sur localStorage pour compatibilité avec login existant
    if (typeof window !== "undefined") {
      const mailEmail = localStorage.getItem("mailEmail");
      const mailUserId = localStorage.getItem("mailUserId");
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (e) {
          console.error("Failed to parse stored user:", e);
        }
      }

      if (mailEmail && mailUserId) {
        return {
          id: mailUserId,
          email: mailEmail,
          fullName: mailEmail
            .split("@")[0]
            .replace(".", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        };
      }
    }

    return null;
  };

  const currentUser = getUserInfo();

  // Activer les raccourcis clavier globaux
  useGlobalShortcuts();

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleLogout = () => {
    // Nettoyer le localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("mailUserId");
    localStorage.removeItem("mailEmail");
    localStorage.removeItem("mailServerInfo");
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("user");
    localStorage.removeItem("memberships");

    // Nettoyer les cookies
    document.cookie =
      "isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Rediriger vers la page de login
    router.push("/login");
  };

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

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const accountOptions = [
    {
      id: "account-space",
      name: "Espace compte",
      icon: User,
      action: () => setIsAccountSpaceOpen(true),
    },
    {
      id: "theme",
      name: getThemeLabel(),
      icon: getThemeIcon(),
      action: toggleTheme,
    },
    {
      id: "help",
      name: "Aide",
      icon: HelpCircle,
      action: () => {
        // Ouvrir la page d'aide dans un nouvel onglet
        window.open("https://support.skygenesisenterprise.com", "_blank");
      },
    },
    {
      id: "logout",
      name: "Déconnexion",
      icon: LogOut,
      action: () => {
        handleLogout();
        setIsAccountMenuOpen(false);
      },
    },
  ];

  const appSwitcherOptions = [
    {
      id: "mail",
      name: "Mail",
      icon: Mail,
      path: "/",
    },
    {
      id: "calendar",
      name: "Calendar",
      icon: Calendar,
      path: "/calendar",
    },
    {
      id: "contacts",
      name: "Contacts",
      icon: Users,
      path: "/contacts",
    },
    {
      id: "notes",
      name: "Notes",
      icon: FileText,
      path: "/notes",
    },
    {
      id: "tasks",
      name: "Tasks",
      icon: CheckSquare,
      path: "/tasks",
    },
    {
      id: "drive",
      name: "Drive",
      icon: HardDrive,
      path: "/drive",
    },
    {
      id: "people",
      name: "People",
      icon: User,
      path: "/people",
    },
    {
      id: "settings",
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
    {
      id: "help",
      name: "Help",
      icon: HelpCircle,
      path: "/help",
    },
  ];

  return (
    <>
      <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-full items-center justify-between px-6">
          {/* App Switcher à gauche */}
          <div className="flex items-center gap-4">
            <DropdownMenu
              open={isAppSwitcherOpen}
              onOpenChange={setIsAppSwitcherOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 px-3 flex items-center gap-2 hover:bg-muted"
                  title="App Switcher"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 p-2"
                align="start"
                forceMount
              >
                <div className="grid grid-cols-3 gap-2">
                  {appSwitcherOptions.map((app) => {
                    const Icon = app.icon;
                    return (
                      <DropdownMenuItem
                        key={app.id}
                        onClick={() => router.push(app.path)}
                        className="flex items-center justify-center p-4 h-16 w-16 cursor-pointer hover:bg-muted"
                        title={app.name}
                      >
                        <Icon className="h-6 w-6" />
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Espace Aether Mail indépendant */}
            <div className="h-10 px-3 flex items-center border-l border-border gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <span className="font-medium text-lg">Aether Mail</span>
            </div>
          </div>

          {/* Barre de recherche centrée */}
          {showSearch && (
            <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Rechercher des emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </form>
          )}

          {/* Espace compte à droite (conditionnel) */}
          {showUserMenu && (
            <div className="w-64 flex justify-end relative" ref={menuRef}>
              <DropdownMenu
                open={isAccountMenuOpen}
                onOpenChange={setIsAccountMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={currentUser?.avatar || "/avatars/current-user.jpg"}
                        alt={currentUser?.fullName || "Utilisateur"}
                      />
                      <AvatarFallback>
                        {getUserInitials(
                          currentUser?.fullName,
                          currentUser?.email,
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end" forceMount>
                  {/* Header du profil avec photo et informations principales */}
                  <div className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={
                            currentUser?.avatar || "/avatars/current-user.jpg"
                          }
                          alt={currentUser?.fullName || "Utilisateur"}
                        />
                        <AvatarFallback className="text-sm font-medium">
                          {getUserInitials(
                            currentUser?.fullName,
                            currentUser?.email,
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {currentUser?.fullName || "Utilisateur"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {currentUser?.email || "email@example.com"}
                        </p>
                        {currentUser?.position && (
                          <p className="text-xs text-muted-foreground">
                            {currentUser.position}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Section Espace compte */}
                  <div className="px-2 py-1">
                    <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Compte
                    </p>
                    <DropdownMenuItem
                      onClick={() => setIsAccountSpaceOpen(true)}
                      className="cursor-pointer"
                    >
                      <User className="mr-3 h-4 w-4" />
                      <span>Espace compte</span>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Section Apparence */}
                  <div className="px-2 py-1">
                    <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Apparence
                    </p>
                    <DropdownMenuItem
                      onClick={toggleTheme}
                      className="cursor-pointer"
                    >
                      {React.createElement(getThemeIcon(), {
                        className: "mr-3 h-4 w-4",
                      })}
                      <span>{getThemeLabel()}</span>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Section Support */}
                  <div className="px-2 py-1">
                    <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Support
                    </p>
                    <DropdownMenuItem
                      onClick={() =>
                        window.open(
                          "https://support.skygenesisenterprise.com",
                          "_blank",
                        )
                      }
                      className="cursor-pointer"
                    >
                      <HelpCircle className="mr-3 h-4 w-4" />
                      <span>Aide</span>
                    </DropdownMenuItem>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Section Déconnexion */}
                  <div className="px-2 py-1">
                    <DropdownMenuItem
                      onClick={() => {
                        handleLogout();
                        setIsAccountMenuOpen(false);
                      }}
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </header>

      {/* Espace compte modal */}
      {isAccountSpaceOpen && (
        <AccountSpace
          userProfile={{
            id: currentUser?.id || "1",
            name: currentUser?.fullName || "Utilisateur",
            email: currentUser?.email || "user@example.com",
            status: "online",
            role: currentUser?.role || "Utilisateur",
            department: currentUser?.department || "General",
            location: currentUser?.location || "France",
            joinDate: currentUser?.createdAt
              ? new Date(currentUser.createdAt).toLocaleDateString()
              : "Aujourd'hui",
            lastLogin: currentUser?.lastLoginAt
              ? new Date(currentUser.lastLoginAt).toLocaleString()
              : "Maintenant",
          }}
          onProfileUpdate={(profile: any) => {
            console.log("Profile updated:", profile);
          }}
          onLogout={() => {
            handleLogout();
            setIsAccountMenuOpen(false);
          }}
          isOpen={isAccountSpaceOpen}
          onClose={() => setIsAccountSpaceOpen(false)}
        />
      )}
    </>
  );
}
