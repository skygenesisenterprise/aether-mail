"use client";

import * as React from "react";
import {
  Mail,
  Star,
  Paperclip,
  RefreshCw,
  Trash2,
  MailOpen,
  Archive,
  MoreHorizontal,
  ChevronDown,
  Square,
  CheckSquare,
  MinusSquare,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { emailApi, type Email } from "@/lib/api/email";
import { useAuth } from "@/context/AuthContext";

interface EmailListProps {
  folderId?: string;
  onEmailSelect?: (emailId: string) => void;
}

const ITEM_HEIGHT = 72;
const FETCH_THRESHOLD = 10;

export function EmailList({ folderId = "INBOX", onEmailSelect }: EmailListProps) {
  const { user, isAuthenticated } = useAuth();
  const [emails, setEmails] = React.useState<Email[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedEmails, setSelectedEmails] = React.useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [offset, setOffset] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const accountId = user?.id || user?.email || "";
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("accessToken");
  const LIMIT = 50;

  const fetchEmails = React.useCallback(
    async (showRefresh = false, newOffset = 0, append = false) => {
      if (!accountId || !hasToken) {
        setIsLoading(false);
        return;
      }

      if (showRefresh) setIsRefreshing(true);
      else if (newOffset > 0) setIsLoadingMore(true);
      else setIsLoading(true);

      setError(null);

      try {
        const response = await emailApi.getEmails(accountId, {
          folderId,
          limit: LIMIT,
          offset: newOffset,
        });

        if (response.success && response.data?.emails) {
          const newEmails = response.data.emails;
          setTotalCount(response.data.total || newEmails.length);

          if (append) {
            setEmails((prev) => [...prev, ...newEmails]);
          } else {
            setEmails(newEmails);
          }

          setHasMore(newEmails.length === LIMIT);
          setOffset(newOffset + newEmails.length);
        } else {
          setError(response.error || "Impossible de charger les emails");
        }
      } catch (err) {
        console.error("[EmailList] Error fetching emails:", err);
        setError(err instanceof Error ? err.message : "Erreur lors du chargement");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [accountId, folderId, hasToken]
  );

  React.useEffect(() => {
    if (isAuthenticated && accountId && hasToken) {
      setOffset(0);
      setEmails([]);
      setHasMore(true);
      fetchEmails(false, 0, false);
    }
  }, [isAuthenticated, accountId, hasToken, folderId, fetchEmails]);

  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (isLoadingMore || !hasMore) return;

      const target = e.target as HTMLDivElement;
      const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

      if (scrollBottom < ITEM_HEIGHT * FETCH_THRESHOLD) {
        fetchEmails(false, offset, true);
      }
    },
    [isLoadingMore, hasMore, offset, fetchEmails]
  );

  const sortedEmails = React.useMemo(() => {
    return [...emails].sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });
  }, [emails]);

  const toggleEmailSelection = (emailId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(emailId)) {
        next.delete(emailId);
      } else {
        next.add(emailId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedEmails.size === emails.length && emails.length > 0) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(emails.map((e) => e.id)));
    }
  };

  const formatDate = (dateStr: string | Date) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Hier";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("fr-FR", { weekday: "short" });
    } else if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    } else {
      return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
    }
  };

  const getSenderName = (email: Email) => {
    if (email.from) {
      return email.from.name || email.from.email || "Inconnu";
    }
    return "Inconnu";
  };

  const handleMarkAsRead = async () => {
    if (selectedEmails.size === 0) return;
    try {
      await emailApi.markAsRead(accountId, Array.from(selectedEmails));
      setEmails((prev) => prev.map((e) => (selectedEmails.has(e.id) ? { ...e, isRead: true } : e)));
      setSelectedEmails(new Set());
    } catch (err) {
      console.error("Erreur marquer lu:", err);
    }
  };

  const handleDelete = async () => {
    if (selectedEmails.size === 0) return;
    try {
      await emailApi.deleteEmails(accountId, Array.from(selectedEmails));
      setEmails((prev) => prev.filter((e) => !selectedEmails.has(e.id)));
      setSelectedEmails(new Set());
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const unreadCount = emails.filter((e) => !e.isRead).length;

  const getSelectAllIcon = () => {
    if (selectedEmails.size === 0) {
      return <Square className="h-3.5 w-3.5 text-muted-foreground/60" />;
    } else if (selectedEmails.size === emails.length && emails.length > 0) {
      return <CheckSquare className="h-3.5 w-3.5 text-primary" />;
    } else {
      return <MinusSquare className="h-3.5 w-3.5 text-primary" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col bg-background border-r">
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Chargement des emails...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-background border-r">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSelectAll}
            className="p-1 rounded hover:bg-muted transition-colors"
            title="Tout sélectionner"
          >
            {getSelectAllIcon()}
          </button>
          <span className="text-sm font-medium text-foreground">
            {selectedEmails.size > 0
              ? `${selectedEmails.size} sélectionné${selectedEmails.size > 1 ? "s" : ""}`
              : `${unreadCount > 0 ? `${unreadCount} non lu${unreadCount > 1 ? "s" : ""}` : totalCount + " messages"}`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {selectedEmails.size > 0 ? (
            <>
              <button
                onClick={handleMarkAsRead}
                className={cn(
                  "p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                )}
                title="Marquer comme lu"
              >
                <MailOpen className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className={cn(
                  "p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                )}
                title="Supprimer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="w-px h-5 bg-border mx-1" />
            </>
          ) : null}
          <button
            onClick={() => fetchEmails(true)}
            disabled={isRefreshing}
            className={cn(
              "p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
              isRefreshing && "animate-spin"
            )}
            title="Actualiser"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-3 mt-2 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div ref={containerRef} className="flex-1 overflow-y-auto" onScroll={handleScroll}>
        {sortedEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium">Aucun email</p>
            <p className="text-sm mt-1">Ce dossier est vide</p>
          </div>
        ) : (
          <div className="py-1">
            {sortedEmails.map((email, index) => {
              const isSelected = selectedEmails.has(email.id);
              const isUnread = !email.isRead;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={email.id || index}
                  className={cn(
                    "group relative flex items-center px-3 py-2 cursor-pointer transition-colors",
                    "hover:bg-muted/70",
                    isSelected && "bg-muted",
                    !isSelected && isEven && "bg-background",
                    !isSelected && !isEven && "bg-muted/20",
                    isUnread && "font-medium"
                  )}
                  onClick={() => onEmailSelect?.(email.id)}
                  style={{ minHeight: ITEM_HEIGHT }}
                >
                  <button
                    onClick={(e) => toggleEmailSelection(email.id, e)}
                    className="p-1 rounded hover:bg-muted transition-colors shrink-0 mr-1"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Square className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70" />
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={cn(
                      "p-1 rounded transition-colors shrink-0 mr-1",
                      email.isFlagged
                        ? "text-yellow-500"
                        : "text-muted-foreground/40 group-hover:text-muted-foreground/70 hover:text-yellow-500"
                    )}
                  >
                    <Star className={cn("h-3.5 w-3.5", email.isFlagged && "fill-current")} />
                  </button>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {isUnread && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        <span
                          className={cn(
                            "text-sm truncate",
                            isUnread ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {getSenderName(email)}
                        </span>
                        {email.isDraft && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground rounded shrink-0">
                            Brouillon
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs shrink-0 tabular-nums",
                          isUnread ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {formatDate(email.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={cn(
                          "text-sm truncate flex-1",
                          isUnread ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {email.subject || "(Sans objet)"}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {email.attachments && email.attachments.length > 0 && (
                          <Paperclip className="h-3.5 w-3.5 text-muted-foreground/60" />
                        )}
                        {email.preview && (
                          <span className="text-xs text-muted-foreground/60 truncate max-w-50">
                            — {email.preview}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-px bg-border/50 group-hover:hidden" />
                </div>
              );
            })}

            {isLoadingMore && (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
              </div>
            )}

            {!hasMore && sortedEmails.length > 0 && (
              <div className="flex items-center justify-center py-3 text-xs text-muted-foreground/60 border-t">
                Fin des messages
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
