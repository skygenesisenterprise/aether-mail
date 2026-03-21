"use client";

import * as React from "react";
import { Mail, Star, Paperclip, MoreHorizontal, RefreshCw, Trash2, MailOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { emailApi, type Email } from "@/lib/api/email";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/context/AuthContext";

interface EmailListProps {
  folderId?: string;
  onEmailSelect?: (emailId: string) => void;
}

export function EmailList({ folderId = "INBOX", onEmailSelect }: EmailListProps) {
  const { isAuthenticated } = useAuth();
  const [emails, setEmails] = React.useState<Email[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedEmails, setSelectedEmails] = React.useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">("newest");

  const user = authApi.getStoredUser();
  const accountId = user?.id || "default";

  const fetchEmails = React.useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await emailApi.getEmails(accountId, {
        folderId,
        limit: 50,
      });

      if (response.success && response.data) {
        setEmails(response.data.emails || []);
      }
    } catch (err) {
      console.error("Failed to fetch emails:", err);
      setError("Failed to load emails");
    } finally {
      setIsLoading(false);
    }
  }, [accountId, folderId]);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    setSelectedEmails(new Set());
    fetchEmails();
  }, [isAuthenticated, fetchEmails]);

  const sortedEmails = React.useMemo(() => {
    return [...emails].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [emails, sortOrder]);

  const toggleEmailSelection = (emailId: string) => {
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
    if (selectedEmails.size === emails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(emails.map((e) => e.id)));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const handleMarkAsRead = async () => {
    if (selectedEmails.size === 0) return;
    try {
      await emailApi.markAsRead(accountId, Array.from(selectedEmails));
      setEmails((prev) => prev.map((e) => (selectedEmails.has(e.id) ? { ...e, isRead: true } : e)));
      setSelectedEmails(new Set());
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleDelete = async () => {
    if (selectedEmails.size === 0) return;
    try {
      await emailApi.deleteEmails(accountId, Array.from(selectedEmails));
      setEmails((prev) => prev.filter((e) => !selectedEmails.has(e.id)));
      setSelectedEmails(new Set());
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-background overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedEmails.size === emails.length && emails.length > 0}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-border"
          />
          <span className="text-sm text-muted-foreground">
            {selectedEmails.size > 0 ? `${selectedEmails.size} selected` : "All"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {selectedEmails.size > 0 && (
            <>
              <button
                onClick={handleMarkAsRead}
                className={cn(
                  "p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                )}
                title="Mark as read"
              >
                <MailOpen className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className={cn(
                  "p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                )}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={fetchEmails}
            className={cn(
              "p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            )}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            className="text-sm bg-transparent border rounded-md px-2 py-1"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 bg-destructive/10 text-destructive text-sm shrink-0">{error}</div>
      )}

      <div className="flex-1 overflow-y-auto">
        {sortedEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Mail className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm font-medium">No emails</p>
            <p className="text-xs">This folder is empty</p>
          </div>
        ) : (
          <div className="space-y-0.5 px-2 py-1">
            {sortedEmails.map((email) => (
              <div
                key={email.id}
                className={cn(
                  "group flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer",
                  "hover:bg-accent/50 hover:text-accent-foreground",
                  selectedEmails.has(email.id) && "bg-accent text-accent-foreground"
                )}
                onClick={() => onEmailSelect?.(email.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedEmails.has(email.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleEmailSelection(email.id);
                  }}
                  className="h-4 w-4 rounded border-border"
                />

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className={cn(
                    "p-1 rounded-md transition-colors",
                    email.isFlagged
                      ? "text-yellow-500"
                      : "text-muted-foreground hover:bg-accent hover:text-yellow-500"
                  )}
                >
                  <Star className={cn("h-4 w-4", email.isFlagged && "fill-current")} />
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm truncate", !email.isRead && "font-semibold")}>
                      {email.from.name || email.from.email}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      {formatDate(email.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm truncate flex-1", !email.isRead && "font-medium")}>
                      {email.subject}
                    </p>
                    {email.attachments && email.attachments.length > 0 && (
                      <Paperclip className="h-3 w-3 text-muted-foreground shrink-0" />
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className={cn(
                    "p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors opacity-0 group-hover:opacity-100"
                  )}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
