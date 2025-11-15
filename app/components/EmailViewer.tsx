import React from "react";
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
  Paperclip,
  X,
} from "lucide-react";

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
  attachments?: Array<{
    name: string;
    size: string;
    type: string;
  }>;
}

interface EmailViewerProps {
  emailId?: string;
  onReply?: (emailId: string) => void;
  onReplyAll?: (emailId: string) => void;
  onForward?: (emailId: string) => void;
  onDelete?: (emailId: string) => void;
  onArchive?: (emailId: string) => void;
  onToggleStar?: (emailId: string) => void;
  onClose?: () => void;
}

export const emailsData: Record<string, Email> = {
  "1": {
    id: "1",
    from: "Jean Dupont",
    fromEmail: "jean.dupont@example.com",
    to: "moi",
    subject: "Réunion projet Aether",
    body: `<p>Bonjour,</p>
    <p>Je voulais confirmer notre réunion de demain concernant le développement de l'interface Aether Mail. Voici les points que nous devrons aborder :</p>
    <ul>
      <li>Validation du design final de l'interface</li>
      <li>Intégration de l'API backend existante</li>
      <li>Gestion de l'authentification et des sessions</li>
      <li>Implémentation des fonctionnalités principales (envoi, réception, recherche)</li>
    </ul>
    <p>J'ai préparé quelques mockups que je vous présenterai lors de la réunion. Vous trouverez également en pièce jointe le rapport d'avancement du projet.</p>
    <p>N'hésitez pas à me faire savoir si vous avez des questions ou si vous souhaitez ajouter des points à l'ordre du jour.</p>
    <p>À demain,<br>Jean</p>`,
    date: "Aujourd'hui, 14:30",
    isRead: false,
    isStarred: true,
    hasAttachment: true,
    attachments: [
      { name: "rapport-projet.pdf", size: "2.4 MB", type: "PDF" },
      { name: "budget-2024.xlsx", size: "856 KB", type: "XLS" },
    ],
  },
  "2": {
    id: "2",
    from: "Marie Martin",
    fromEmail: "marie.martin@example.com",
    to: "moi",
    subject: "Rapport hebdomadaire",
    body: `<p>Bonjour,</p>
    <p>Voici le rapport d'avancement pour cette semaine. Nous avons terminé 80% des fonctionnalités prévues.</p>
    <p>Points clés :</p>
    <ul>
      <li>API backend : 90% terminée</li>
      <li>Interface frontend : 75% terminée</li>
      <li>Tests : 60% terminés</li>
    </ul>
    <p>N'hésitez pas si vous avez des questions.</p>
    <p>Cordialement,<br>Marie</p>`,
    date: "Aujourd'hui, 12:15",
    isRead: true,
    isStarred: false,
    hasAttachment: false,
  },
  "3": {
    id: "3",
    from: "System Notification",
    fromEmail: "noreply@aether-mail.com",
    to: "moi",
    subject: "Mise à jour de sécurité",
    body: `<p>Une nouvelle mise à jour de sécurité est disponible.</p>
    <p>Veuillez mettre à jour votre application dès que possible pour bénéficier des dernières corrections de sécurité.</p>
    <p>Changements inclus :</p>
    <ul>
      <li>Correction de vulnérabilités critiques</li>
      <li>Amélioration du chiffrement</li>
      <li>Mises à jour des dépendances</li>
    </ul>
    <p>Merci de votre confiance.</p>`,
    date: "Hier",
    isRead: true,
    isStarred: false,
    hasAttachment: false,
  },
  "4": {
    id: "4",
    from: "Lucas Bernard",
    fromEmail: "lucas.bernard@example.com",
    to: "moi",
    subject: "Design review",
    body: `<p>Salut !</p>
    <p>Peux-tu jeter un œil aux derniers mockups pour l'interface mail ? J'aimerais avoir ton avis sur plusieurs points :</p>
    <ul>
      <li>L'agencement de la sidebar</li>
      <li>Les couleurs choisies</li>
      <li>L'ergonomie générale</li>
    </ul>
    <p>J'ai mis les fichiers en pièce jointe.</p>
    <p>Merci d'avance !</p>
    <p>Lucas</p>`,
    date: "Hier",
    isRead: false,
    isStarred: true,
    hasAttachment: true,
    attachments: [{ name: "mockups-v2.fig", size: "15.2 MB", type: "FIG" }],
  },
  "5": {
    id: "5",
    from: "Équipe Support",
    fromEmail: "support@skygenesisenterprise.com",
    to: "moi",
    subject: "Ticket #1234 résolu",
    body: `<p>Bonjour,</p>
    <p>Votre demande concernant l'intégration API a été traitée.</p>
    <p>La solution a été déployée en production. Vous pouvez maintenant utiliser les nouveaux endpoints.</p>
    <p>Documentation mise à jour : <a href="#">https://docs.aether-mail.com/api/v2</a></p>
    <p>N'hésitez pas à nous contacter si vous rencontrez des problèmes.</p>
    <p>Cordialement,<br>L'équipe support</p>`,
    date: "2 jours",
    isRead: true,
    isStarred: false,
    hasAttachment: false,
  },
};

export default function EmailViewer({
  emailId,
  onReply,
  onReplyAll,
  onForward,
  onDelete,
  onArchive,
  onToggleStar,
  onClose,
}: EmailViewerProps) {
  const email = emailId ? emailsData[emailId] : null;

  const handleDownloadAttachment = (attachment: {
    name: string;
    size: string;
    type: string;
  }) => {
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
                {email.subject}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  De:{" "}
                  <span className="text-gray-300 font-medium">
                    {email.from}
                  </span>
                </span>
                <span>•</span>
                <span>
                  À: <span className="text-gray-300">{email.to}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 ml-4">
              <button
                onClick={() => {
                  onToggleStar?.(email.id);
                }}
                className="p-2.5 hover:bg-gray-700/50 rounded-lg transition-all duration-200 group"
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
                    {email.from.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-white text-base">
                    {email.from}
                  </h3>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-medium">
                    {email.fromEmail}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  À: {email.to}
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
                    .reduce((total, att) => total + parseFloat(att.size), 0)
                    .toFixed(1)}{" "}
                  MB)
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {email.attachments.map((attachment, index) => (
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
        <div className="p-6">
          {/* Corps du message avec typographie améliorée */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div
              className="text-card-foreground leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
