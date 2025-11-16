import React, { useState, useMemo } from "react";
import {
  Mail,
  User,
  Calendar,
  Paperclip,
  Star,
  Filter,
  ChevronDown,
  ChevronRight,
  Search,
  Clock,
  TrendingUp,
  MessageSquare,
  FolderOpen,
  BarChart3,
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "email" | "contact" | "folder" | "thread";
  title: string;
  preview?: string;
  sender?: string;
  date?: string;
  relevanceScore?: number;
  highlights?: string[];
  metadata?: {
    attachmentCount?: number;
    isRead?: boolean;
    isStarred?: boolean;
    folder?: string;
    threadCount?: number;
  };
}

interface SearchFacet {
  id: string;
  label: string;
  type: "sender" | "date" | "folder" | "attachment" | "priority";
  options: FacetOption[];
}

interface FacetOption {
  id: string;
  label: string;
  count: number;
  selected?: boolean;
}

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  facets?: SearchFacet[];
  totalCount: number;
  loading?: boolean;
  onResultClick: (result: SearchResult) => void;
  onFacetChange: (facetId: string, optionId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export default function SearchResults({
  query,
  results,
  facets = [],
  totalCount,
  loading = false,
  onResultClick,
  onFacetChange,
  onLoadMore,
  hasMore = false,
}: SearchResultsProps) {
  const [groupBy, setGroupBy] = useState<
    "relevance" | "date" | "sender" | "folder"
  >("relevance");
  const [expandedFacets, setExpandedFacets] = useState<string[]>([]);

  // Grouper les résultats
  const groupedResults = useMemo(() => {
    if (groupBy === "relevance") {
      return { "Résultats pertinents": results };
    }

    return results.reduce(
      (groups, result) => {
        let key = "";

        switch (groupBy) {
          case "date":
            if (result.date) {
              const date = new Date(result.date);
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);

              if (date.toDateString() === today.toDateString()) {
                key = "Aujourd'hui";
              } else if (date.toDateString() === yesterday.toDateString()) {
                key = "Hier";
              } else if (date.getFullYear() === today.getFullYear()) {
                key = date.toLocaleDateString("fr-FR", { month: "long" });
              } else {
                key = date.getFullYear().toString();
              }
            }
            break;

          case "sender":
            key = result.sender || "Expéditeur inconnu";
            break;

          case "folder":
            key = result.metadata?.folder || "Autres";
            break;
        }

        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(result);
        return groups;
      },
      {} as Record<string, SearchResult[]>,
    );
  }, [results, groupBy]);

  // Basculer l'expansion d'une facette
  const toggleFacet = (facetId: string) => {
    setExpandedFacets((prev) =>
      prev.includes(facetId)
        ? prev.filter((id) => id !== facetId)
        : [...prev, facetId],
    );
  };

  // Obtenir l'icône pour un type de résultat
  const getResultIcon = (result: SearchResult) => {
    switch (result.type) {
      case "email":
        return <Mail size={16} className="text-muted-foreground" />;
      case "contact":
        return <User size={16} className="text-blue-500" />;
      case "folder":
        return <FolderOpen size={16} className="text-green-500" />;
      case "thread":
        return <MessageSquare size={16} className="text-purple-500" />;
      default:
        return <Search size={16} className="text-muted-foreground" />;
    }
  };

  // Mettre en évidence le texte de recherche
  const highlightText = (text: string, highlights: string[] = []) => {
    if (!highlights.length || !text) return text;

    let highlightedText = text;
    highlights.forEach((highlight) => {
      const regex = new RegExp(`(${highlight})`, "gi");
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-yellow-200 text-yellow-900">$1</mark>',
      );
    });

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  if (loading && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground mt-4">Recherche en cours...</p>
      </div>
    );
  }

  if (!query && results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search size={48} className="text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Commencez votre recherche
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Utilisez des mots-clés, des filtres ou des commandes comme "from:",
          "has:", "in:" pour trouver rapidement ce que vous cherchez.
        </p>
      </div>
    );
  }

  if (results.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search size={48} className="text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Aucun résultat trouvé
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Essayez de modifier votre recherche ou d'utiliser des filtres
          différents.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Facettes de filtrage */}
      {facets.length > 0 && (
        <div className="w-64 border-r border-border p-4 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Filter size={14} />
              Filtres
            </h3>
            <span className="text-xs text-muted-foreground">
              {totalCount} résultats
            </span>
          </div>

          {/* Options de groupement */}
          <div className="mb-6">
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Grouper par
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="w-full bg-background border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="relevance">Pertinence</option>
              <option value="date">Date</option>
              <option value="sender">Expéditeur</option>
              <option value="folder">Dossier</option>
            </select>
          </div>

          {/* Facettes */}
          <div className="space-y-4">
            {facets.map((facet) => (
              <div key={facet.id} className="border border-border rounded-lg">
                <button
                  onClick={() => toggleFacet(facet.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors"
                >
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    {facet.type === "sender" && <User size={12} />}
                    {facet.type === "date" && <Calendar size={12} />}
                    {facet.type === "folder" && <FolderOpen size={12} />}
                    {facet.type === "attachment" && <Paperclip size={12} />}
                    {facet.type === "priority" && <Star size={12} />}
                    {facet.label}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-muted-foreground transition-transform ${
                      expandedFacets.includes(facet.id) ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedFacets.includes(facet.id) && (
                  <div className="border-t border-border p-2 max-h-48 overflow-y-auto">
                    {facet.options.map((option) => (
                      <label
                        key={option.id}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={option.selected}
                            onChange={() => onFacetChange(facet.id, option.id)}
                            className="rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-foreground">
                            {option.label}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {option.count}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Résultats de recherche */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* En-tête des résultats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-foreground">
                {totalCount} résultat{totalCount > 1 ? "s" : ""}
              </h2>
              {query && (
                <span className="text-sm text-muted-foreground">
                  pour "
                  <span className="font-medium text-foreground">{query}</span>"
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-muted rounded transition-colors">
                <BarChart3 size={16} className="text-muted-foreground" />
              </button>
              <button className="p-2 hover:bg-muted rounded transition-colors">
                <TrendingUp size={16} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Résultats groupés */}
          <div className="space-y-6">
            {Object.entries(groupedResults).map(([groupName, groupResults]) => (
              <div key={groupName}>
                {groupName !== "Résultats pertinents" && (
                  <div className="flex items-center gap-2 mb-3">
                    <ChevronRight size={16} className="text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">
                      {groupName}
                    </h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {groupResults.length}
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  {groupResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => onResultClick(result)}
                      className="group p-4 bg-card border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        {/* Icône du résultat */}
                        <div className="flex-shrink-0 mt-1">
                          {getResultIcon(result)}
                        </div>

                        {/* Contenu du résultat */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-foreground truncate flex items-center gap-2">
                              {highlightText(result.title, result.highlights)}

                              {/* Score de pertinence */}
                              {result.relevanceScore && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                  {Math.round(result.relevanceScore * 100)}%
                                </span>
                              )}
                            </h4>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {result.date && (
                                <span className="flex items-center gap-1">
                                  <Clock size={10} />
                                  {result.date}
                                </span>
                              )}

                              {result.metadata?.threadCount && (
                                <span className="flex items-center gap-1">
                                  <MessageSquare size={10} />
                                  {result.metadata.threadCount}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Métadonnées */}
                          {result.sender && (
                            <div className="flex items-center gap-2 mb-2">
                              <User
                                size={12}
                                className="text-muted-foreground"
                              />
                              <span className="text-sm text-muted-foreground">
                                {result.sender}
                              </span>

                              {result.metadata?.folder && (
                                <>
                                  <span className="text-muted-foreground">
                                    •
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {result.metadata.folder}
                                  </span>
                                </>
                              )}
                            </div>
                          )}

                          {/* Aperçu */}
                          {result.preview && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {highlightText(result.preview, result.highlights)}
                            </p>
                          )}

                          {/* Badges et actions */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              {result.metadata?.isRead && (
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                                  Lu
                                </span>
                              )}

                              {result.metadata?.isStarred && (
                                <Star
                                  size={12}
                                  className="text-yellow-500 fill-yellow-500"
                                />
                              )}

                              {result.metadata?.attachmentCount &&
                                result.metadata.attachmentCount > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Paperclip size={10} />
                                    {result.metadata.attachmentCount}
                                  </span>
                                )}
                            </div>

                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1 hover:bg-muted rounded transition-colors">
                                <ChevronRight
                                  size={14}
                                  className="text-muted-foreground"
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Charger plus de résultats */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={onLoadMore}
                disabled={loading}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Chargement...
                  </>
                ) : (
                  <>
                    Charger plus de résultats
                    <ChevronDown size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
