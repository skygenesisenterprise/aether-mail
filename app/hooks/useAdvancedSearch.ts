import { useState, useCallback, useEffect, useMemo } from "react";

interface SearchFilter {
  id: string;
  label: string;
  value: any;
  type: "date" | "sender" | "attachment" | "folder" | "priority";
}

interface SearchHistory {
  query: string;
  filters: SearchFilter[];
  timestamp: number;
  resultCount: number;
}

interface UseAdvancedSearchOptions {
  maxHistoryItems?: number;
  enableHistory?: boolean;
  enableSuggestions?: boolean;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: "history" | "contact" | "command" | "template";
  metadata?: any;
}

export function useAdvancedSearch(options: UseAdvancedSearchOptions = {}) {
  const {
    maxHistoryItems = 10,
    enableHistory = true,
    enableSuggestions = true,
  } = options;

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);

  // Charger l'historique de recherche depuis localStorage
  useEffect(() => {
    if (enableHistory) {
      try {
        const saved = localStorage.getItem("aether-mail-search-history");
        if (saved) {
          setSearchHistory(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Error loading search history:", error);
      }
    }
  }, [enableHistory]);

  // Sauvegarder l'historique de recherche
  const saveToHistory = useCallback(
    (
      searchQuery: string,
      searchFilters: SearchFilter[],
      resultCount: number,
    ) => {
      if (!enableHistory || !searchQuery.trim()) return;

      const newEntry: SearchHistory = {
        query: searchQuery,
        filters: searchFilters,
        timestamp: Date.now(),
        resultCount,
      };

      setSearchHistory((prev) => {
        const filtered = prev.filter(
          (item) =>
            item.query !== searchQuery ||
            JSON.stringify(item.filters) !== JSON.stringify(searchFilters),
        );
        const updated = [newEntry, ...filtered].slice(0, maxHistoryItems);

        try {
          localStorage.setItem(
            "aether-mail-search-history",
            JSON.stringify(updated),
          );
        } catch (error) {
          console.error("Error saving search history:", error);
        }

        return updated;
      });
    },
    [enableHistory, maxHistoryItems],
  );

  // Générer des suggestions basées sur la requête actuelle
  const generateSuggestions = useCallback(
    (searchQuery: string): SearchSuggestion[] => {
      if (!enableSuggestions) return [];

      const suggestions: SearchSuggestion[] = [];

      // Suggestions de l'historique
      searchHistory.forEach((item) => {
        if (item.query.toLowerCase().includes(searchQuery.toLowerCase())) {
          suggestions.push({
            id: `history-${item.timestamp}`,
            text: item.query,
            type: "history",
            metadata: {
              resultCount: item.resultCount,
              timestamp: item.timestamp,
            },
          });
        }
      });

      // Suggestions de commandes
      const commands = [
        { text: "from:", description: "Filtrer par expéditeur" },
        { text: "to:", description: "Filtrer par destinataire" },
        { text: "subject:", description: "Filtrer par sujet" },
        { text: "has:", description: "Filtrer par pièces jointes" },
        { text: "in:", description: "Filtrer par dossier" },
        { text: "is:", description: "Filtrer par statut" },
        { text: "after:", description: "Emails après une date" },
        { text: "before:", description: "Emails avant une date" },
      ];

      commands.forEach((cmd) => {
        if (searchQuery.toLowerCase().includes(cmd.text.toLowerCase())) {
          suggestions.push({
            id: cmd.text,
            text: cmd.text,
            type: "command",
            metadata: { description: cmd.description },
          });
        }
      });

      // Suggestions de contacts génériques
      const contacts = [
        { name: "Contact", email: "contact@example.com" },
        { name: "Info", email: "info@example.com" },
        { name: "Support", email: "support@example.com" },
      ];

      contacts.forEach((contact) => {
        if (
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          suggestions.push({
            id: contact.email,
            text: `${contact.name} <${contact.email}>`,
            type: "contact",
            metadata: { contact },
          });
        }
      });

      // Suggestions de templates
      const templates = [
        { name: "Réunion", query: "subject:réunion" },
        { name: "Rapport", query: "subject:rapport" },
        { name: "Facture", query: "subject:facture has:attachment" },
        { name: "Urgent", query: "is:urgent" },
      ];

      templates.forEach((template) => {
        if (template.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          suggestions.push({
            id: template.name,
            text: template.name,
            type: "template",
            metadata: { query: template.query },
          });
        }
      });

      return suggestions.slice(0, 8);
    },
    [searchHistory, enableSuggestions],
  );

  // Parser une requête de recherche avancée
  const parseQuery = useCallback(
    (queryString: string) => {
      const parsed = {
        query: queryString,
        filters: [...filters],
      };

      // Parser les commandes de recherche
      const patterns = {
        from: /from:([^\s]+)/gi,
        to: /to:([^\s]+)/gi,
        subject: /subject:([^\s]+)/gi,
        has: /has:([^\s]+)/gi,
        in: /in:([^\s]+)/gi,
        is: /is:([^\s]+)/gi,
        after: /after:([^\s]+)/gi,
        before: /before:([^\s]+)/gi,
      };

      // Extraire les filtres de la requête
      Object.entries(patterns).forEach(([command, pattern]) => {
        const match = queryString.match(pattern);
        if (match) {
          const value = match[1];

          // Ajouter ou mettre à jour le filtre correspondant
          const existingFilterIndex = parsed.filters.findIndex(
            (f) => f.id === command,
          );
          const filter: SearchFilter = {
            id: command,
            label: value,
            value,
            type: getFilterType(command),
          };

          if (existingFilterIndex >= 0) {
            parsed.filters[existingFilterIndex] = filter;
          } else {
            parsed.filters.push(filter);
          }

          // Retirer la commande de la requête principale
          parsed.query = parsed.query.replace(pattern, "").trim();
        }
      });

      return parsed;
    },
    [filters],
  );

  // Obtenir le type de filtre pour une commande
  const getFilterType = (command: string): SearchFilter["type"] => {
    switch (command) {
      case "from":
      case "to":
        return "sender";
      case "in":
        return "folder";
      case "has":
        return "attachment";
      case "is":
        return "priority";
      case "after":
      case "before":
        return "date";
      default:
        return "sender";
    }
  };

  // Exécuter une recherche
  const search = useCallback(
    async (searchQuery: string, searchFilters: SearchFilter[] = []) => {
      setIsSearching(true);
      setQuery(searchQuery);
      setFilters(searchFilters);

      try {
        // Simuler une recherche asynchrone
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Sauvegarder dans l'historique
        saveToHistory(searchQuery, searchFilters, 0); // Le résultat count serait mis à jour par le composant parent

        return {
          query: searchQuery,
          filters: searchFilters,
          timestamp: Date.now(),
        };
      } finally {
        setIsSearching(false);
      }
    },
    [saveToHistory],
  );

  // Effacer la recherche
  const clearSearch = useCallback(() => {
    setQuery("");
    setFilters([]);
    setSuggestions([]);
  }, []);

  // Ajouter un filtre
  const addFilter = useCallback((filter: SearchFilter) => {
    setFilters((prev) => {
      const filtered = prev.filter((f) => f.id !== filter.id);
      return [...filtered, filter];
    });
  }, []);

  // Supprimer un filtre
  const removeFilter = useCallback((filterId: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== filterId));
  }, []);

  // Mettre à jour les suggestions quand la requête change
  useEffect(() => {
    setSuggestions(generateSuggestions(query));
  }, [query, generateSuggestions]);

  // État de recherche calculé
  const hasActiveSearch = useMemo(() => {
    return query.trim().length > 0 || filters.length > 0;
  }, [query, filters]);

  // Résumé de la recherche
  const searchSummary = useMemo(() => {
    const parts: string[] = [];

    if (query) parts.push(`"${query}"`);

    filters.forEach((filter) => {
      parts.push(`${filter.id}:${filter.value}`);
    });

    return parts.join(" ");
  }, [query, filters]);

  return {
    // État
    query,
    filters,
    isSearching,
    hasActiveSearch,
    searchHistory,
    suggestions,
    searchSummary,

    // Actions
    search,
    clearSearch,
    addFilter,
    removeFilter,
    setQuery,
    setFilters,

    // Utilitaires
    parseQuery,
    generateSuggestions,
  };
}

export type { SearchFilter, SearchHistory, SearchSuggestion };
