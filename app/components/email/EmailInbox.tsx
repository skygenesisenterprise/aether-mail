import type React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EmailList, { type Email } from "./EmailList";
import EmailViewer from "./EmailViewer";
import EmailComposer from "./EmailComposer";
import { useEmailStore } from "../../store/emailStore";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

// Type for backend email response
interface BackendEmailResponse {
  id: string;
  subject: string;
  body: string;
  from: {
    name: string;
    email: string;
  };
  to: string;
  cc?: string;
  bcc?: string;
  timestamp: string;
  is_read: boolean;
  is_starred: boolean;
  is_encrypted: boolean;
  has_attachments: boolean;
  attachments: Array<{
    filename: string;
    filesize: number;
  }>;
}

const EmailInbox: React.FC = () => {
  const { folder } = useParams<{ folder: string }>(); // Récupérer le dossier actif depuis la route
  const { emails, setEmails, updateEmail, deleteEmail, setCurrentFolder } =
    useEmailStore();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Charger les emails en fonction du dossier actif
  useEffect(() => {
    setCurrentFolder(folder || "inbox");
    const fetchEmails = async () => {
      try {
        const isDev = process.env.NODE_ENV !== "production";

        if (isDev || true) {
          // Always try to fetch since login checks IMAP
          const serverConfig = localStorage.getItem("serverConfig");
          const servers = serverConfig ? JSON.parse(serverConfig) : null;

          // Récupérer les identifiants depuis localStorage
          const credentials = localStorage.getItem("userCredentials");
          const creds = credentials ? JSON.parse(credentials) : null;

          // Si pas de config serveur personnalisée, laisser l'API détecter automatiquement
          const fullConfig = creds
            ? {
                imapUser: creds.email,
                imapPass: creds.password,
              }
            : null;

          const response = await fetch(`/api/inbox`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ imapConfig: fullConfig }),
          });
          const data = await response.json();
          console.log("Fetched emails:", data);
          if (data.success && data.mails) {
            // Transformer les données du backend vers le format frontend
            setEmails(
              data.mails.map((mail: BackendEmailResponse) => ({
                id: mail.id,
                subject: mail.subject,
                body: mail.body,
                from: {
                  name: mail.from.name,
                  email: mail.from.email,
                  verified: false, // Par défaut non vérifié
                },
                to: mail.to,
                cc: mail.cc,
                bcc: mail.bcc,
                timestamp: new Date(mail.timestamp),
                isRead: mail.is_read,
                isStarred: mail.is_starred,
                isEncrypted: mail.is_encrypted,
                hasAttachments: mail.has_attachments,
                attachments: mail.attachments || [],
              })),
            );
          } else {
            setEmails([]);
          }
        } else {
          // Données mockées pour navigation libre en dev
          setEmails([
            {
              id: "1",
              subject: "Bienvenue dans Aether Mail",
              body: "<p>Bonjour,</p><p>Bienvenue dans votre nouveau client email Aether Mail. Cette application vous permet de gérer vos emails de manière sécurisée et moderne.</p><p>Cordialement,<br>L'équipe Aether</p>",
              from: {
                name: "Support",
                email: "support@aethermail.com",
                verified: true,
              },
              timestamp: new Date(),
              isRead: false,
              isStarred: false,
              isEncrypted: false,
              hasAttachments: false,
              attachments: [],
            },
            {
              id: "2",
              subject: "Test avec pièce jointe",
              body: "<p>Voici un email de test avec une pièce jointe.</p>",
              from: { name: "Test User", email: "test@example.com" },
              cc: "cc@example.com",
              timestamp: new Date(Date.now() - 3600000),
              isRead: true,
              isStarred: true,
              isEncrypted: false,
              hasAttachments: true,
              attachments: [
                {
                  filename: "document.pdf",
                  filesize: 2500000,
                },
              ],
            },
          ]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des emails:", error);
      }
    };

    fetchEmails();

    // Poll for new emails every 30 seconds
    const interval = setInterval(fetchEmails, 30000);
    return () => clearInterval(interval);
  }, [folder, setCurrentFolder, setEmails]);

  // Vérifier si la vue est mobile
  useEffect(() => {
    const checkForMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    checkForMobile();

    // Ajouter un écouteur d'événement pour le redimensionnement
    window.addEventListener("resize", checkForMobile);

    // Nettoyer l'écouteur
    return () => window.removeEventListener("resize", checkForMobile);
  }, []);

  // Gérer la sélection d'un email
  const handleSelectEmail = (emailToSelect: Email) => {
    // Marquer comme lu lors de la sélection
    if (!emailToSelect.isRead) {
      updateEmail(emailToSelect.id, { isRead: true });
      setSelectedEmail({ ...emailToSelect, isRead: true });
    } else {
      setSelectedEmail(emailToSelect);
    }
  };

  // Gérer l'ajout ou la suppression d'une étoile
  const handleStarEmail = (email: Email) => {
    updateEmail(email.id, { isStarred: !email.isStarred });
    if (selectedEmail && selectedEmail.id === email.id) {
      setSelectedEmail({
        ...selectedEmail,
        isStarred: !selectedEmail.isStarred,
      });
    }
  };

  // Gérer la suppression d'un email
  const handleDeleteEmail = (email: Email) => {
    deleteEmail(email.id);
    setSelectedEmail(null);
  };

  // Gérer la réponse à un email
  const handleReplyEmail = (email: Email) => {
    setIsComposerOpen(true);
  };

  // Gérer le transfert d'un email
  const handleForwardEmail = (email: Email) => {
    setIsComposerOpen(true);
  };

  // Fermer la vue de l'email sélectionné sur mobile
  const handleCloseEmailView = () => {
    setSelectedEmail(null);
  };

  // Calculer l'ID de l'email sélectionné de manière sûre
  const selectedEmailId = selectedEmail ? selectedEmail.id : null;

  // Keyboard shortcuts
  useKeyboardShortcuts({
    emails,
    selectedEmailId,
    onSelectEmail: handleSelectEmail,
    onDelete: handleDeleteEmail,
    onReply: handleReplyEmail,
    onForward: handleForwardEmail,
    onStar: handleStarEmail,
    onNewEmail: () => setIsComposerOpen(true),
    onSearch: () => {
      // Focus search input
      const searchInput = document.querySelector(
        'input[placeholder="Search..."]',
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    },
    onRefresh: () => {
      // Trigger email refresh
      window.location.reload();
    },
  });

  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Vue mobile - une seule colonne */}
      {isMobileView ? (
        <>
          {/* Liste des emails en mobile */}
          {!selectedEmail && (
            <div className="flex-1">
              <EmailList
                emails={emails}
                onSelectEmail={handleSelectEmail}
                selectedEmailId={selectedEmailId}
                onStar={handleStarEmail}
                onDelete={handleDeleteEmail}
              />
            </div>
          )}

          {/* Vue de l'email sélectionné en mobile */}
          {selectedEmail && (
            <div className="flex-1 flex flex-col">
              <EmailViewer
                email={selectedEmail}
                onClose={handleCloseEmailView}
                onStar={handleStarEmail}
                onDelete={handleDeleteEmail}
                onReply={handleReplyEmail}
                onForward={handleForwardEmail}
                isMobile={true}
              />
            </div>
          )}
        </>
      ) : (
        /* Vue desktop - trois colonnes */
        <div className="flex flex-1">
          {/* Colonne 1: Liste des emails - largeur fixe */}
          <div className="w-96 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
            <EmailList
              emails={emails}
              onSelectEmail={handleSelectEmail}
              selectedEmailId={selectedEmailId}
              onStar={handleStarEmail}
              onDelete={handleDeleteEmail}
            />
          </div>

          {/* Colonne 2: Visualiseur d'emails - largeur flexible */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedEmail ? (
              <EmailViewer
                email={selectedEmail}
                onStar={handleStarEmail}
                onDelete={handleDeleteEmail}
                onReply={handleReplyEmail}
                onForward={handleForwardEmail}
              />
            ) : (
              /* État vide quand aucun email n'est sélectionné */
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                <div className="text-center max-w-md mx-auto px-4">
                  <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-full h-full"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select an email
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose an email from the list to view its contents
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modale de composition d'email */}
      <EmailComposer
        initialTo={selectedEmail ? selectedEmail.from.email : ""}
        initialSubject={selectedEmail ? `Re: ${selectedEmail.subject}` : ""}
        replyToEmail={!!selectedEmail}
      />

      {/* Bouton flottant pour composer un email (Mobile) */}
      <button
        className="fixed bottom-6 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg hover:bg-blue-700 focus:outline-none transition-colors"
        onClick={() => setIsComposerOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-6 w-6 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </button>
    </div>
  );
};

export default EmailInbox;
