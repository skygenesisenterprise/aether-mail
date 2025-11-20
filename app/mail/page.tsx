"use client";

import React, { useState } from "react";
import {
  Mail,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { mailService, MailConfig } from "../lib/services/mailService";
import { useEmails } from "../hooks/useEmails";
import EmailList from "../components/EmailList";
import EmailViewer from "../components/EmailViewer";
import Sidebar from "../components/Sidebar";

export default function MailPage() {
  const [selectedEmail, setSelectedEmail] = useState<string>();
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configStatus, setConfigStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // Hook pour gérer les emails
  const {
    emails,
    loading,
    error,
    markAsRead,
    markAsUnread,
    toggleStar,
    deleteEmail,
    archiveEmail,
    refreshEmails,
  } = useEmails({
    folder: selectedFolder,
    autoRefresh: true,
    refreshInterval: 30000,
  });

  // Configuration automatique avec les variables d'environnement
  const configureMail = async () => {
    setIsConfiguring(true);
    setConfigStatus("idle");
    setStatusMessage("");

    try {
      const config: MailConfig = {
        imapHost:
          process.env.NEXT_PUBLIC_IMAP_HOST || "mail.skygenesisenterprise.com",
        imapPort: parseInt(process.env.NEXT_PUBLIC_IMAP_PORT || "993"),
        imapTls: process.env.NEXT_PUBLIC_IMAP_TLS === "true",
        smtpHost:
          process.env.NEXT_PUBLIC_SMTP_HOST || "smtp.skygenesisenterprise.com",
        smtpPort: parseInt(process.env.NEXT_PUBLIC_SMTP_PORT || "587"),
        smtpSecure: process.env.NEXT_PUBLIC_SMTP_SECURE === "false",
        username:
          process.env.NEXT_PUBLIC_MAIL_USER || "admin@skygenesisenterprise.com",
        password: process.env.NEXT_PUBLIC_MAIL_PASSWORD || "admin123",
      };

      const result = await mailService.configureMail(config);

      if (result.success) {
        setConfigStatus("success");
        setStatusMessage("Configuration réussie ! Chargement des emails...");
        // Rafraîchir les emails après configuration
        setTimeout(() => {
          refreshEmails();
        }, 1000);
      } else {
        setConfigStatus("error");
        setStatusMessage(result.error || "Erreur de configuration");
      }
    } catch (error) {
      setConfigStatus("error");
      setStatusMessage("Erreur lors de la configuration");
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <Sidebar
        selectedFolder={selectedFolder}
        onFolderSelect={setSelectedFolder}
        onCompose={() => console.log("Compose email")}
      />

      {/* Liste des emails */}
      <EmailList
        selectedEmail={selectedEmail}
        onEmailSelect={setSelectedEmail}
        selectedFolder={selectedFolder}
        onEmailDelete={deleteEmail}
        onEmailArchive={archiveEmail}
        onEmailReadToggle={(emailId, isRead) => {
          if (isRead) {
            markAsRead(emailId);
          } else {
            markAsUnread(emailId);
          }
        }}
        onEmailStarToggle={toggleStar}
      />

      {/* Visualiseur d'emails */}
      <EmailViewer
        emailId={selectedEmail}
        emails={emails}
        onReply={(emailId) => console.log("Reply to", emailId)}
        onReplyAll={(emailId) => console.log("Reply all to", emailId)}
        onForward={(emailId) => console.log("Forward", emailId)}
        onDelete={deleteEmail}
        onArchive={archiveEmail}
        onToggleStar={toggleStar}
        onToggleRead={(emailId, isRead) => {
          if (isRead) {
            markAsRead(emailId);
          } else {
            markAsUnread(emailId);
          }
        }}
        onClose={() => setSelectedEmail(undefined)}
      />

      {/* Panneau de configuration flottant */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center gap-3 mb-3">
            <Settings className="text-muted-foreground" size={20} />
            <h3 className="font-semibold text-foreground">
              Configuration Mail
            </h3>
          </div>

          {configStatus === "success" && (
            <div className="flex items-center gap-2 text-green-500 text-sm mb-3">
              <CheckCircle size={16} />
              <span>{statusMessage}</span>
            </div>
          )}

          {configStatus === "error" && (
            <div className="flex items-center gap-2 text-red-500 text-sm mb-3">
              <AlertCircle size={16} />
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={configureMail}
              disabled={isConfiguring}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg px-3 py-2 flex items-center justify-center gap-2 transition-colors"
            >
              {isConfiguring ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Configuration...</span>
                </>
              ) : (
                <>
                  <Mail size={16} />
                  <span>Configurer le serveur</span>
                </>
              )}
            </button>

            <button
              onClick={refreshEmails}
              disabled={loading}
              className="w-full bg-muted hover:bg-muted/80 disabled:opacity-50 text-foreground rounded-lg px-3 py-2 flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              <span>Rafraîchir</span>
            </button>
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            <p>
              Serveur:{" "}
              {process.env.NEXT_PUBLIC_IMAP_HOST ||
                "mail.skygenesisenterprise.com"}
            </p>
            <p>
              Utilisateur:{" "}
              {process.env.NEXT_PUBLIC_MAIL_USER ||
                "admin@skygenesisenterprise.com"}
            </p>
          </div>
        </div>
      </div>

      {/* Indicateur de chargement global */}
      {loading && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
            <RefreshCw size={16} className="animate-spin text-primary" />
            <span className="text-sm text-foreground">
              Chargement des emails...
            </span>
          </div>
        </div>
      )}

      {/* Indicateur d'erreur */}
      {error && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg shadow-lg px-3 py-2 flex items-center gap-2">
            <AlertCircle size={16} className="text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
