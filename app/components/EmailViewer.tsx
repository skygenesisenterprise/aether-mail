import { useState } from "react";
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
  onForward?: (emailId: string) => void;
  onDelete?: (emailId: string) => void;
  onArchive?: (emailId: string) => void;
  onToggleStar?: (emailId: string) => void;
}

const emailsData: Record<string, Email> = {
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
  onForward,
  onDelete,
  onArchive,
  onToggleStar,
}: EmailViewerProps) {
  const [isStarred, setIsStarred] = useState(false);

  const email = emailId ? emailsData[emailId] : null;

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black text-gray-400">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={32} className="text-gray-600" />
          </div>
          <p className="text-lg font-medium">Sélectionnez un e-mail</p>
          <p className="text-sm mt-2">
            Choisissez un e-mail dans la liste pour afficher son contenu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-white">{email.subject}</h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsStarred(!email.isStarred);
                onToggleStar?.(email.id);
              }}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Star
                size={18}
                className={
                  email.isStarred
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-400"
                }
              />
            </button>
            <button
              onClick={() => onArchive?.(email.id)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Archive size={18} className="text-gray-400" />
            </button>
            <button
              onClick={() => onDelete?.(email.id)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Trash2 size={18} className="text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <MoreVertical size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {email.from.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white">{email.from}</h3>
                  <span className="text-sm text-gray-400">
                    &lt;{email.fromEmail}&gt;
                  </span>
                </div>
                <div className="text-sm text-gray-400">À: {email.to}</div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-400">{email.date}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {email.hasAttachment && email.attachments && (
            <div className="mb-4 p-3 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                <Paperclip size={16} />
                <span>
                  {email.attachments.length} pièce
                  {email.attachments.length > 1 ? "s" : ""} jointe
                  {email.attachments.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-2">
                {email.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-800 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded flex items-center justify-center ${
                          attachment.type === "PDF"
                            ? "bg-blue-600"
                            : attachment.type === "XLS"
                              ? "bg-green-600"
                              : "bg-purple-600"
                        }`}
                      >
                        <span className="text-xs font-bold text-white">
                          {attachment.type}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-white">{attachment.name}</p>
                        <p className="text-xs text-gray-400">
                          {attachment.size}
                        </p>
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                      <Download size={16} className="text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: email.body }}
          />
        </div>
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <button
            onClick={() => onReply?.(email.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors"
          >
            <Reply size={16} />
            <span>Répondre</span>
          </button>
          <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors">
            <ReplyAll size={16} />
            <span>Répondre à tous</span>
          </button>
          <button
            onClick={() => onForward?.(email.id)}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors"
          >
            <Forward size={16} />
            <span>Transférer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
