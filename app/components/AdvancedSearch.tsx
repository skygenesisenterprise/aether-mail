import type React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  Search,
  X,
  Calendar,
  User,
  Paperclip,
  Filter,
  Clock,
  Star,
  ChevronUp,
  Command,
  Mail,
  Folder,
  Zap,
  TrendingUp,
} from "lucide-react";

interface SearchSuggestion {
  id: string;
  text: string;
  type: "recent" | "suggestion" | "contact" | "folder";
  icon?: React.ReactNode;
  action?: () => void;
}

interface SearchFilter {
  id: string;
  label: string;
  value: any;
  type: "date" | "sender" | "attachment" | "folder" | "priority";
  icon?: React.ReactNode;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilter[]) => void;
  placeholder?: string;
  className?: string;
}

export default function AdvancedSearch({
  onSearch,
  placeholder = "Rechercher des emails, dossiers, contacts...",
  className = "",
}: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isCommandPalette, setIsCommandPalette] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger les recherches récentes depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("aether-mail-search-history");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Générer des suggestions basées sur la requête
  const generateSuggestions = useCallback(
    (query: string) => {
      if (!query.trim()) {
        // Afficher les recherches récentes
        return recentSearches.slice(0, 5).map((search, index) => ({
          id: `recent-${index}`,
          text: search,
          type: "recent" as const,
          icon: <Clock size={14} className="text-muted-foreground" />,
        }));
      }

      const suggestions: SearchSuggestion[] = [];

      // Suggestions de commandes rapides
      const commands = [
        {
          text: "from:",
          type: "suggestion" as const,
          icon: <User size={14} />,
        },
        {
          text: "subject:",
          type: "suggestion" as const,
          icon: <Mail size={14} />,
        },
        {
          text: "has:",
          type: "suggestion" as const,
          icon: <Paperclip size={14} />,
        },
        {
          text: "in:",
          type: "suggestion" as const,
          icon: <Folder size={14} />,
        },
        { text: "is:", type: "suggestion" as const, icon: <Star size={14} /> },
      ];

      commands.forEach((cmd) => {
        if (query.toLowerCase().includes(cmd.text.toLowerCase())) {
          suggestions.push({
            id: cmd.text,
            text: cmd.text,
            type: cmd.type,
            icon: cmd.icon,
          });
        }
      });

      // Suggestions de contacts (simulation)
      const contacts = [
        { name: "Jean Dupont", email: "jean.dupont@example.com" },
        { name: "Marie Martin", email: "marie.martin@example.com" },
        { name: "Lucas Bernard", email: "lucas.bernard@example.com" },
      ];

      contacts.forEach((contact) => {
        if (
          contact.name.toLowerCase().includes(query.toLowerCase()) ||
          contact.email.toLowerCase().includes(query.toLowerCase())
        ) {
          suggestions.push({
            id: contact.email,
            text: `${contact.name} <${contact.email}>`,
            type: "contact" as const,
            icon: <User size={14} className="text-blue-500" />,
            action: () => {
              setSearchQuery(`from:${contact.email}`);
              onSearch(`from:${contact.email}`, filters);
            },
          });
        }
      });

      return suggestions.slice(0, 8);
    },
    [recentSearches, onSearch, filters],
  );

  // Mettre à jour les suggestions quand la requête change
  useEffect(() => {
    setSuggestions(generateSuggestions(searchQuery));
  }, [searchQuery, generateSuggestions]);

  // Gérer le raccourci clavier pour la command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPalette(true);
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        setIsCommandPalette(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Gérer la recherche
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      onSearch(query, filters);

      // Sauvegarder dans l'historique
      if (query.trim() && !recentSearches.includes(query)) {
        const newHistory = [query, ...recentSearches.slice(0, 9)];
        setRecentSearches(newHistory);
        localStorage.setItem(
          "aether-mail-search-history",
          JSON.stringify(newHistory),
        );
      }

      setShowSuggestions(false);
    },
    [onSearch, filters, recentSearches],
  );

  // Gérer le clic sur une suggestion
  const handleSuggestionClick = useCallback(
    (suggestion: SearchSuggestion) => {
      if (suggestion.action) {
        suggestion.action();
      } else {
        setSearchQuery(suggestion.text);
        handleSearch(suggestion.text);
      }
      setShowSuggestions(false);
    },
    [handleSearch],
  );

  // Ajouter un filtre
  const addFilter = useCallback((filter: SearchFilter) => {
    setFilters((prev) => [...prev.filter((f) => f.id !== filter.id), filter]);
  }, []);

  // Supprimer un filtre
  const removeFilter = useCallback((filterId: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== filterId));
  }, []);

  // Effacer tous les filtres
  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  // Gérer le clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Champ de recherche principal */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground flex items-center gap-2">
          {isCommandPalette ? (
            <Command size={16} className="text-primary" />
          ) : (
            <Search size={16} />
          )}
          {isCommandPalette && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded font-medium">
              Cmd+K
            </span>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch(searchQuery);
            }
          }}
          placeholder={placeholder}
          className={`w-full bg-muted/50 border border-border rounded-lg pl-${isCommandPalette ? "20" : "10"} pr-20 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-muted-foreground transition-all duration-200 ${isCommandPalette ? "ring-2 ring-primary/50" : ""}`}
        />

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                handleSearch("");
              }}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          )}

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-1 hover:bg-muted rounded transition-colors ${filters.length > 0 ? "text-primary" : "text-muted-foreground"}`}
          >
            <Filter size={14} />
            {filters.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {filters.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
              {isCommandPalette ? (
                <>
                  <Zap size={12} />
                  Command Palette
                </>
              ) : (
                <>
                  <TrendingUp size={12} />
                  Suggestions
                </>
              )}
            </div>

            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2">
                  {suggestion.icon}
                  <span className="text-sm text-foreground">
                    {suggestion.text}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground capitalize">
                  {suggestion.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtres actifs */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm border border-primary/20"
            >
              {filter.icon}
              <span>{filter.label}</span>
              <button
                onClick={() => removeFilter(filter.id)}
                className="p-0.5 hover:bg-primary/20 rounded transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Effacer tout
          </button>
        </div>
      )}

      {/* Panneau de recherche avancée */}
      {showAdvanced && (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Filter size={14} />
              Filtres avancés
            </h3>
            <button
              onClick={() => setShowAdvanced(false)}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <ChevronUp size={14} className="text-muted-foreground" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Filtre par date */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Calendar size={12} />
                Période
              </label>
              <select
                onChange={(e) =>
                  addFilter({
                    id: "date-range",
                    label: e.target.value,
                    value: e.target.value,
                    type: "date",
                    icon: <Calendar size={12} />,
                  })
                }
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="year">Cette année</option>
              </select>
            </div>

            {/* Filtre par expéditeur */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <User size={12} />
                Expéditeur
              </label>
              <input
                type="text"
                placeholder="Nom ou email..."
                onChange={(e) =>
                  addFilter({
                    id: "sender",
                    label: e.target.value,
                    value: e.target.value,
                    type: "sender",
                    icon: <User size={12} />,
                  })
                }
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Filtre par pièces jointes */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Paperclip size={12} />
                Pièces jointes
              </label>
              <select
                onChange={(e) =>
                  addFilter({
                    id: "attachments",
                    label: e.target.value,
                    value: e.target.value,
                    type: "attachment",
                    icon: <Paperclip size={12} />,
                  })
                }
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Tous les emails</option>
                <option value="has-attachments">Avec pièces jointes</option>
                <option value="no-attachments">Sans pièces jointes</option>
                <option value="pdf">PDF uniquement</option>
                <option value="images">Images uniquement</option>
              </select>
            </div>

            {/* Filtre par dossier */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Folder size={12} />
                Dossier
              </label>
              <select
                onChange={(e) =>
                  addFilter({
                    id: "folder",
                    label: e.target.value,
                    value: e.target.value,
                    type: "folder",
                    icon: <Folder size={12} />,
                  })
                }
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Tous les dossiers</option>
                <option value="inbox">Boîte de réception</option>
                <option value="sent">Envoyés</option>
                <option value="drafts">Brouillons</option>
                <option value="starred">Suivis</option>
                <option value="archive">Archive</option>
                <option value="trash">Corbeille</option>
              </select>
            </div>

            {/* Filtre par priorité */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Star size={12} />
                Priorité
              </label>
              <select
                onChange={(e) =>
                  addFilter({
                    id: "priority",
                    label: e.target.value,
                    value: e.target.value,
                    type: "priority",
                    icon: <Star size={12} />,
                  })
                }
                className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Toutes les priorités</option>
                <option value="important">Importants</option>
                <option value="starred">Suivis</option>
                <option value="unread">Non lus</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
