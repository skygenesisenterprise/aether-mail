"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
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
import { useAppVersion } from "../hooks/useAppVersion";
import { mailService } from "../lib/services/mailService";
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
  const { theme, toggleTheme } = useTheme();
  const { version: appVersion, isLoading: isLoadingVersion } = useAppVersion();
  const router = useRouter();
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

  return (
    <>
      <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-full items-center justify-between px-6">
          {/* Espace vide à gauche pour équilibrer */}
          <div className="w-64"></div>

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
                        src="/avatars/current-user.jpg"
                        alt="Utilisateur"
                      />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">John Doe</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        john.doe@example.com
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {accountOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <DropdownMenuItem key={option.id} onClick={option.action}>
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{option.name}</span>
                      </DropdownMenuItem>
                    );
                  })}
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
