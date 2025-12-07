import React, { useEffect, useState } from "react";
import {
  Reply,
  ReplyAll,
  Forward,
  Star,
  Archive,
  Trash2,
  MoreVertical,
  Download,
  Mail,
  MailOpen,
  Paperclip,
  X,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  EnhancedEmailService,
  type EnhancedEmail,
} from "../lib/services/enhancedEmailService";

interface Email {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  folder?: string;
  preview?: string;
  attachments?: Array<{
    name: string;
    size: string;
    type: string;
  }>;
  rawMime?: string;
  cc?: string;
  bcc?: string;
}

interface EmailViewerProps {
  emailId?: string;
  emails?: Record<string, Email>;
  onReply?: (emailId: string) => void;
  onReplyAll?: (emailId: string) => void;
  onForward?: (emailId: string) => void;
  onDelete?: (emailId: string) => void;
  onArchive?: (emailId: string) => void;
  onToggleStar?: (emailId: string) => void;
  onToggleRead?: (emailId: string, isRead: boolean) => void;
  onClose?: () => void;
}

export default function EmailViewer({
  emailId,
  emails: externalEmails,
  onReply,
  onReplyAll,
  onForward,
  onDelete,
  onArchive,
  onToggleStar,
  onToggleRead,
  onClose,
}: EmailViewerProps) {
  // Utiliser les emails externes si fournis
  const email = emailId ? externalEmails?.[emailId] : null;
  const [enhancedEmail, setEnhancedEmail] = useState<EnhancedEmail | null>(
    null,
  );
  const [showExternalImages, setShowExternalImages] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingFullEmail, setLoadingFullEmail] = useState(false);

  // Traiter l'email avec le service amélioré
  useEffect(() => {
    if (email) {
      setLoading(true);
      EnhancedEmailService.processEmailForDisplay(email)
        .then((processed) => {
          setEnhancedEmail(processed);
        })
        .catch((error) => {
          console.error("Erreur lors du traitement de l'email:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setEnhancedEmail(null);
    }
  }, [email]);

  // Charger le contenu complet de l'email si nécessaire
  useEffect(() => {
    if (emailId && email && (!email.body || email.body.trim() === "")) {
      setLoadingFullEmail(true);
      import("../lib/services/mailService").then(({ mailService }) => {
        mailService
          .fetchEmail(emailId, email.folder || "inbox")
          .then((result) => {
            if (result.success && result.data) {
              // Mettre à jour l'email avec le contenu complet
              const updatedEmail = { ...email, ...result.data };
              // Mettre à jour l'email dans la liste externe
              if (externalEmails) {
                externalEmails[emailId] = updatedEmail;
              }
              // Retraiter l'email avec le nouveau contenu
              EnhancedEmailService.processEmailForDisplay(updatedEmail)
                .then((processed) => {
                  setEnhancedEmail(processed);
                })
                .catch((error) => {
                  console.error(
                    "Erreur lors du traitement de l'email complet:",
                    error,
                  );
                });
            }
          })
          .catch((error) => {
            console.error(
              "Erreur lors du chargement de l'email complet:",
              error,
            );
          })
          .finally(() => {
            setLoadingFullEmail(false);
          });
      });
    }
  }, [emailId, email]);

  // Debug: afficher le contenu de l'email dans la console
  useEffect(() => {
    if (email) {
      console.log("Email data:", {
        id: email.id,
        subject: email.subject,
        body: email.body,
        bodyLength: email.body?.length || 0,
        hasAttachment: email.hasAttachment,
        preview: email.preview,
      });
    }
  }, [email]);

  // Marquer automatiquement comme lu quand l'email est ouvert
  useEffect(() => {
    if (email && !email.isRead && onToggleRead && emailId) {
      onToggleRead(emailId, true);
    }
  }, [emailId, email, onToggleRead]);

  const handleToggleRead = () => {
    if (email && onToggleRead) {
      onToggleRead(email.id, !email.isRead);
    }
  };

  const handleDownloadAttachment = (attachment: any) => {
    try {
      // Simuler le téléchargement d'une pièce jointe
      // Dans une vraie application, cela appellerait une API pour télécharger le fichier

      // Créer un contenu factice pour la démonstration
      const content = `Contenu de la pièce jointe: ${attachment.name}\nType: ${attachment.type}\nTaille: ${attachment.size}\n\nCeci est un fichier de démonstration pour Aether Mail.`;

      // Créer un Blob avec le contenu
      const blob = new Blob([content], { type: "text/plain" });

      // Créer une URL temporaire pour le téléchargement
      const url = window.URL.createObjectURL(blob);

      // Créer un élément <a> temporaire pour déclencher le téléchargement
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.name;

      // Ajouter le lien au DOM, cliquer dessus, puis le nettoyer
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Libérer l'URL temporaire
      window.URL.revokeObjectURL(url);

      // Afficher une notification de succès (pourrait être amélioré avec un système de toast)
      console.log(`Téléchargement de ${attachment.name} initié`);
    } catch (error) {
      console.error("Erreur lors du téléchargement de la pièce jointe:", error);
    }
  };

  // Fonction pour nettoyer et améliorer le HTML de l'email
  const sanitizeEmailBody = (html: string) => {
    console.log("sanitizeEmailBody input:", html);

    if (!html || html.trim() === "") {
      console.log("Body is empty or null");
      return "";
    }

    // S'assurer que le HTML a une structure de base
    let cleanHtml = html.trim();

    // Corriger les problèmes d'encodage courants
    cleanHtml = cleanHtml
      // Corriger les caractères UTF-8 mal encodés
      .replace(/Ã©/g, "é")
      .replace(/Ã¨/g, "è")
      .replace(/Ãª/g, "ê")
      .replace(/Ã«/g, "ë")
      .replace(/Ã§/g, "ç")
      .replace(/Ã /g, "à")
      .replace(/Ã¢/g, "â")
      .replace(/Ã´/g, "ô")
      .replace(/Ã¹/g, "ù")
      .replace(/Ã»/g, "û")
      .replace(/Ã®/g, "î")
      .replace(/Ã¯/g, "ï")
      .replace(/Ã¤/g, "ä")
      .replace(/Ã¶/g, "ö")
      .replace(/Ã¼/g, "ü")
      .replace(/Ã‡/g, "Ä")
      .replace(/Ã–/g, "Ö")
      .replace(/Ãœ/g, "Ü")
      .replace(/Ã¿/g, "ÿ")
      // Corriger les caractères spéciaux Windows-1252
      .replace(/â‚¬/g, "€")
      .replace(/â€œ/g, '"')
      .replace(/â€�/g, '"')
      .replace(/â€™/g, "'")
      .replace(/â€¦/g, "...")
      .replace(/â€" /g, "–")
      .replace(/â€�/g, "—")
      // Corriger les espaces insécables
      .replace(/Â /g, " ")
      .replace(/&nbsp;/g, " ");

    console.log("CleanHtml after encoding fixes:", cleanHtml);

    // Si ce n'est pas du HTML, traiter comme du texte brut
    if (!cleanHtml.includes("<") && !cleanHtml.includes(">")) {
      console.log("Treating as plain text");
      return `<p style="white-space: pre-wrap; font-family: monospace;">${cleanHtml.replace(/\n/g, "<br>")}</p>`;
    }

    // Nettoyer le HTML
    cleanHtml = cleanHtml
      // Supprimer les scripts et styles potentiellement dangereux
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/<style[^>]*>.*?<\/style>/gi, "")
      // Améliorer la lisibilité
      .replace(/<div[^>]*>/gi, '<div style="margin: 8px 0;">')
      .replace(/<p[^>]*>/gi, '<p style="margin: 8px 0;">')
      .replace(/<br\s*\/?>/gi, '<br style="line-height: 1.4;">');

    console.log("Returning HTML as-is");
    return cleanHtml;
  };

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-muted-foreground/60" />
          </div>
          <p className="text-lg font-medium text-card-foreground">
            Sélectionnez un e-mail
          </p>
          <p className="text-sm mt-2">
            Choisissez un e-mail dans la liste pour afficher son contenu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* En-tête moderne avec actions */}
      <div className="bg-gradient-to-r from-card to-muted border-b border-border">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-card-foreground mb-2 leading-tight">
                {enhancedEmail?.displaySubject || email.subject}
              </h1>
            </div>

            <div className="flex items-center gap-1 ml-4">
              <button
                onClick={handleToggleRead}
                className="p-2.5 hover:bg-muted/50 rounded-lg transition-all duration-200 group"
                title={
                  email.isRead ? "Marquer comme non lu" : "Marquer comme lu"
                }
              >
                {email.isRead ? (
                  <MailOpen
                    size={18}
                    className="text-muted-foreground group-hover:text-card-foreground"
                  />
                ) : (
                  <Mail
                    size={18}
                    className="text-primary group-hover:text-primary/80"
                  />
                )}
              </button>
              <button
                onClick={() => {
                  onToggleStar?.(email.id);
                }}
                className="p-2.5 hover:bg-muted/50 rounded-lg transition-all duration-200 group"
                title="Suivre"
              >
                <Star
                  size={18}
                  className={
                    email.isStarred
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground group-hover:text-card-foreground"
                  }
                />
              </button>
              <button
                onClick={() => onArchive?.(email.id)}
                className="p-2.5 hover:bg-gray-700/50 rounded-lg transition-all duration-200 group"
                title="Archiver"
              >
                <Archive
                  size={18}
                  className="text-gray-400 group-hover:text-gray-200"
                />
              </button>
              <button
                onClick={() => onDelete?.(email.id)}
                className="p-2.5 hover:bg-red-900/30 rounded-lg transition-all duration-200 group"
                title="Supprimer"
              >
                <Trash2
                  size={18}
                  className="text-gray-400 group-hover:text-red-400"
                />
              </button>
              <div className="w-px h-6 bg-gray-600 mx-1"></div>
              <button
                onClick={() => onReply?.(email.id)}
                className="p-2.5 hover:bg-blue-600/30 rounded-lg transition-all duration-200 group"
                title="Répondre"
              >
                <Reply
                  size={18}
                  className="text-gray-400 group-hover:text-blue-400"
                />
              </button>
              <button
                onClick={() => onReplyAll?.(email.id)}
                className="p-2.5 hover:bg-blue-600/30 rounded-lg transition-all duration-200 group"
                title="Répondre à tous"
              >
                <ReplyAll
                  size={18}
                  className="text-gray-400 group-hover:text-blue-400"
                />
              </button>
              <button
                onClick={() => onForward?.(email.id)}
                className="p-2.5 hover:bg-blue-600/30 rounded-lg transition-all duration-200 group"
                title="Transférer"
              >
                <Forward
                  size={18}
                  className="text-gray-400 group-hover:text-blue-400"
                />
              </button>
              <div className="w-px h-6 bg-gray-600 mx-1"></div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-gray-700/50 rounded-lg transition-all duration-200 group"
                title="Fermer"
              >
                <X
                  size={18}
                  className="text-gray-400 group-hover:text-gray-200"
                />
              </button>
              <button className="p-2.5 hover:bg-gray-700/50 rounded-lg transition-all duration-200 group">
                <MoreVertical
                  size={18}
                  className="text-gray-400 group-hover:text-gray-200"
                />
              </button>
            </div>
          </div>

          {/* Section expéditeur améliorée */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-lg font-bold text-white">
                    {(enhancedEmail?.displayFrom || email.from)
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-white text-base">
                    {enhancedEmail?.displayFrom || email.from}
                  </h3>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                    {email.fromEmail}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  À: {enhancedEmail?.displayTo || email.to}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-medium text-gray-300">
                {email.date}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {email.isRead ? "Lu" : "Non lu"}
              </div>
            </div>
          </div>

          {/* Pièces jointes intégrées dans l'en-tête */}
          {email.hasAttachment && email.attachments && (
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Paperclip size={16} className="text-blue-400" />
                <span className="text-sm font-medium text-blue-300">
                  {email.attachments.length} pièce
                  {email.attachments.length > 1 ? "s" : ""} jointe
                  {email.attachments.length > 1 ? "s" : ""}
                </span>
                <span className="text-xs text-gray-400">
                  (
                  {email.attachments
                    .reduce(
                      (total: number, att: any) => total + parseFloat(att.size),
                      0,
                    )
                    .toFixed(1)}{" "}
                  MB)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {email.attachments.map((attachment: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-md border border-gray-700/30 hover:bg-gray-800/70 transition-all duration-200 group cursor-pointer"
                    onClick={() => handleDownloadAttachment(attachment)}
                  >
                    <div
                      className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${
                        attachment.type === "PDF"
                          ? "bg-gradient-to-br from-red-500 to-pink-600"
                          : attachment.type === "XLS"
                            ? "bg-gradient-to-br from-green-500 to-emerald-600"
                            : "bg-gradient-to-br from-purple-500 to-indigo-600"
                      }`}
                    >
                      {attachment.type}
                    </div>
                    <span className="text-xs text-gray-300 group-hover:text-blue-400 transition-colors">
                      {attachment.name}
                    </span>
                    <button
                      className="p-1 hover:bg-gray-700 rounded transition-all duration-200 group-hover:bg-blue-600/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadAttachment(attachment);
                      }}
                    >
                      <Download
                        size={12}
                        className="text-gray-400 group-hover:text-blue-400"
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Séparateur visuel */}
      <div className="border-b border-border/50"></div>

      {/* Contenu de l'email avec design amélioré */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 min-h-full">
          {loadingFullEmail && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">
                Chargement du contenu complet...
              </span>
            </div>
          )}
          {/* Corps du message avec typographie améliorée */}
          {!loadingFullEmail && (
            <div className="prose prose-invert prose-lg max-w-none">
              {email.body && email.body.trim() !== "" ? (
                <div
                  className="text-card-foreground leading-relaxed space-y-4 break-words"
                  style={{
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeEmailBody(email.body),
                  }}
                />
              ) : email.preview ? (
                <div
                  className="text-card-foreground leading-relaxed space-y-4 break-words"
                  style={{
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  <p>{email.preview}</p>
                </div>
              ) : (
                <div className="text-muted-foreground italic text-center py-8">
                  <p>Cet email ne contient pas de contenu textuel.</p>
                  <p className="text-sm mt-2">
                    Il peut s'agir d'un email avec uniquement des pièces jointes
                    ou un contenu formaté non pris en charge.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Contrôle des images externes */}
          {enhancedEmail?.hasExternalImages && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-blue-400" />
                  <span className="text-sm text-blue-300">
                    Cet email contient des images externes
                  </span>
                </div>
                <button
                  onClick={() => setShowExternalImages(!showExternalImages)}
                  className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs rounded-lg transition-colors"
                >
                  {showExternalImages ? (
                    <>
                      <EyeOff size={12} className="inline mr-1" />
                      Masquer
                    </>
                  ) : (
                    <>
                      <Eye size={12} className="inline mr-1" />
                      Afficher
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Afficher le contenu traité */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">
                Traitement de l'email...
              </span>
            </div>
          ) : enhancedEmail ? (
            <div
              className="text-card-foreground leading-relaxed space-y-4 break-words"
              style={{
                wordWrap: "break-word",
                overflowWrap: "break-word",
                whiteSpace: "pre-wrap",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
              dangerouslySetInnerHTML={{
                __html: showExternalImages
                  ? enhancedEmail.displayBody
                  : enhancedEmail.displayBody.replace(
                      /<img[^>]+src\s*=\s*["'][^"']*["'][^>]*>/gi,
                      '<div class="bg-muted border border-border rounded p-2 text-center text-muted-foreground text-sm">[Image externe bloquée]</div>',
                    ),
              }}
            />
          ) : (
            /* Fallback si le traitement échoue */
            <>
              {/* Afficher le preview si disponible et que le body est vide */}
              {email.preview && (!email.body || email.body.trim() === "") && (
                <div
                  className="text-card-foreground leading-relaxed space-y-4 break-words"
                  style={{
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  <p>{email.preview}</p>
                </div>
              )}

              {/* Afficher le body s'il existe */}
              {email.body && email.body.trim() !== "" && (
                <div
                  className="text-card-foreground leading-relaxed space-y-4 break-words"
                  style={{
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeEmailBody(email.body),
                  }}
                />
              )}

              {/* Fallback si ni le body ni le preview ne sont disponibles */}
              {(!email.body || email.body.trim() === "") &&
                (!email.preview || email.preview.trim() === "") && (
                  <div className="text-muted-foreground italic text-center py-8">
                    <p>Cet email ne contient pas de contenu textuel.</p>
                    <p className="text-sm mt-2">
                      Il peut s'agir d'un email avec uniquement des pièces
                      jointes ou un contenu formaté non pris en charge.
                    </p>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
