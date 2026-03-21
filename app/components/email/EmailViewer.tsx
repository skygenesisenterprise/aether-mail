"use client";

import * as React from "react";
import {
  ArrowLeft,
  Star,
  Trash2,
  Archive,
  Reply,
  Forward,
  Paperclip,
  Download,
  ChevronDown,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { emailApi, type Email, type Attachment } from "@/lib/api/email";
import { useAuth } from "@/context/AuthContext";

interface EmailViewerProps {
  emailId: string;
  folderId?: string;
  onBack?: () => void;
  onReply?: (email: Email) => void;
  onForward?: (email: Email) => void;
  onEmailDeleted?: (emailId: string) => void;
  onEmailRead?: (emailId: string) => void;
}

export function EmailViewer({
  emailId,
  folderId = "INBOX",
  onBack,
  onReply,
  onForward,
  onEmailDeleted,
  onEmailRead,
}: EmailViewerProps) {
  const { user } = useAuth();
  const [email, setEmail] = React.useState<Email | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = React.useState(false);
  const [showFullHeaders, setShowFullHeaders] = React.useState(false);
  const [showAttachments, setShowAttachments] = React.useState(true);

  const accountId = user?.id || user?.email || "";
  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("accessToken");

  React.useEffect(() => {
    if (emailId && accountId && hasToken) {
      fetchEmail();
    }
  }, [emailId, accountId, hasToken]);

  const fetchEmail = async () => {
    if (!accountId || !hasToken || !emailId) {
      console.log("[EmailViewer] Missing params:", { accountId, hasToken, emailId });
      setError("Paramètres manquants");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("[EmailViewer] Fetching email:", { accountId, emailId, folderId });
      const response = await emailApi.getEmail(accountId, emailId);
      console.log("[EmailViewer] Response:", response);

      if (response.success && response.data) {
        setEmail(response.data);

        if (!response.data.isRead) {
          markAsRead(emailId);
        }
      } else {
        setError(response.error || "Impossible de charger l'email");
      }
    } catch (err) {
      console.error("[EmailViewer] Error fetching email:", err);
      setError(err instanceof Error ? err.message : "Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await emailApi.markAsRead(accountId, [id]);
      setEmail((prev) => (prev ? { ...prev, isRead: true } : null));
      onEmailRead?.(id);
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const handleToggleStar = async () => {
    if (!email) return;
    setIsActionLoading(true);

    try {
      setEmail((prev) => (prev ? { ...prev, isFlagged: !prev.isFlagged } : null));
    } catch (err) {
      console.error("Error toggling star:", err);
      setEmail((prev) => (prev ? { ...prev, isFlagged: !prev.isFlagged } : null));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!email) return;
    setIsActionLoading(true);

    try {
      await emailApi.deleteEmails(accountId, [email.id]);
      onEmailDeleted?.(email.id);
    } catch (err) {
      console.error("Error deleting email:", err);
      setError("Erreur lors de la suppression");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!email) return;
    setIsActionLoading(true);

    try {
      await emailApi.moveEmails(accountId, [email.id], "Archive");
      onEmailDeleted?.(email.id);
    } catch (err) {
      console.error("Error archiving email:", err);
      setError("Erreur lors de l'archivage");
    } finally {
      setIsActionLoading(false);
    }
  };

  const formatDate = (dateStr: string | Date) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";

    return date.toLocaleString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateStr: string | Date) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";

    return date.toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getAddressDisplay = (addr: { name?: string; email: string }) => {
    if (addr.name) {
      return `${addr.name} <${addr.email}>`;
    }
    return addr.email;
  };

  const sanitizeHtml = (html: string) => {
    return html;
  };

  const renderBody = () => {
    if (!email) return null;

    if (email.body && email.body.trim()) {
      if (email.body.includes("<")) {
        return (
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(email.body) }}
          />
        );
      }
      return <p className="whitespace-pre-wrap">{email.body}</p>;
    }

    return <p className="text-muted-foreground italic">Aucun contenu</p>;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Chargement de l'email...</span>
        </div>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 max-w-md text-center px-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <h3 className="text-lg font-semibold">Erreur de chargement</h3>
          <p className="text-sm text-muted-foreground">{error || "Email introuvable"}</p>
          <button
            onClick={() => onBack?.()}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retourner à la liste
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded hover:bg-muted transition-colors lg:hidden"
              title="Retour"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <span className="text-sm font-medium truncate max-w-75">
            {email.subject || "(Sans objet)"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onReply?.(email)}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Répondre"
          >
            <Reply className="h-4 w-4" />
          </button>
          <button
            onClick={() => onForward?.(email)}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Transférer"
          >
            <Forward className="h-4 w-4" />
          </button>
          <button
            onClick={handleToggleStar}
            disabled={isActionLoading}
            className={cn(
              "p-1.5 rounded hover:bg-muted transition-colors",
              email.isFlagged ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"
            )}
            title={email.isFlagged ? "Retirer le favoris" : "Ajouter aux favoris"}
          >
            {email.isFlagged ? (
              <Star className="h-4 w-4 fill-current" />
            ) : (
              <Star className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={handleArchive}
            disabled={isActionLoading}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Archiver"
          >
            <Archive className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isActionLoading}
            className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-4">{email.subject || "(Sans objet)"}</h1>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-medium text-primary">
                  {email.from?.name?.[0]?.toUpperCase() ||
                    email.from?.email?.[0]?.toUpperCase() ||
                    "?"}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-1">
                  <div>
                    <span className="font-medium">
                      {email.from?.name || email.from?.email || "Inconnu"}
                    </span>
                    {email.from?.name && (
                      <span className="text-muted-foreground ml-1">&lt;{email.from.email}&gt;</span>
                    )}
                  </div>
                  <span
                    className="text-sm text-muted-foreground shrink-0"
                    title={formatDate(email.date)}
                  >
                    {formatShortDate(email.date)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>À:</span>
                  <span>{email.to?.map((t) => getAddressDisplay(t)).join(", ") || "Inconnu"}</span>
                </div>

                {email.cc && email.cc.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Cc:</span>
                    <span>{email.cc.map((c) => getAddressDisplay(c)).join(", ")}</span>
                  </div>
                )}
              </div>
            </div>

            {email.attachments && email.attachments.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setShowAttachments(!showAttachments)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Paperclip className="h-4 w-4" />
                  <span>{email.attachments.length} pièce(s) jointe(s)</span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", showAttachments && "rotate-180")}
                  />
                </button>

                {showAttachments && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {email.attachments.map((attachment, index) => (
                      <a
                        key={attachment.id || index}
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-sm"
                      >
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-50">{attachment.filename}</span>
                        <span className="text-xs text-muted-foreground">
                          ({formatFileSize(attachment.size)})
                        </span>
                        <Download className="h-3.5 w-3.5 text-muted-foreground" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t pt-4">{renderBody()}</div>
        </div>
      </div>
    </div>
  );
}
