import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EmailList, { type Email } from './EmailList';
import EmailViewer from './EmailViewer';
import EmailComposer from './EmailComposer';
import { generateId } from '../../lib/utils';

const EmailInbox: React.FC = () => {
  const { folder } = useParams<{ folder: string }>(); // Récupérer le dossier actif depuis la route
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Charger les emails en fonction du dossier actif
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        // Simuler une requête API pour récupérer les emails du dossier actif
        const response = await fetch(`/api/v1/emails?folder=${folder}`);
        const data = await response.json();
        console.log('Fetched emails:', data);
        setEmails(data);
      } catch (error) {
        console.error('Erreur lors du chargement des emails:', error);
      }
    };

    fetchEmails();
  }, [folder]);

  // Vérifier si la vue est mobile
  useEffect(() => {
    const checkForMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    checkForMobile();

    // Ajouter un écouteur d'événement pour le redimensionnement
    window.addEventListener('resize', checkForMobile);

    // Nettoyer l'écouteur
    return () => window.removeEventListener('resize', checkForMobile);
  }, []);

  // Gérer la sélection d'un email
  const handleSelectEmail = (emailToSelect: Email) => {
    // Marquer comme lu lors de la sélection
    if (!emailToSelect.isRead) {
      const updatedEmails = emails.map(e =>
        e.id === emailToSelect.id ? { ...e, isRead: true } : e
      );
      setEmails(updatedEmails);

      // Créer un nouvel objet avec isRead défini sur true
      const updatedEmail = { ...emailToSelect, isRead: true };
      setSelectedEmail(updatedEmail);
    } else {
      setSelectedEmail(emailToSelect);
    }
  };

  // Gérer l'ajout ou la suppression d'une étoile
  const handleStarEmail = (email: Email) => {
    const updatedEmails = emails.map(e =>
      e.id === email.id ? { ...e, isStarred: !e.isStarred } : e
    );
    setEmails(updatedEmails);

    if (selectedEmail && selectedEmail.id === email.id) {
      setSelectedEmail({ ...selectedEmail, isStarred: !selectedEmail.isStarred });
    }
  };

  // Gérer la suppression d'un email
  const handleDeleteEmail = (email: Email) => {
    const updatedEmails = emails.filter(e => e.id !== email.id);
    setEmails(updatedEmails);
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

  return (
    <div className="flex h-full">
      {/* Liste des emails - masquée sur mobile lorsqu'un email est sélectionné */}
      <div
        className={`flex-1 ${isMobileView && selectedEmail ? 'hidden' : 'block'} md:block md:w-96 md:flex-none`}
      >
        <EmailList
          emails={emails}
          onSelectEmail={handleSelectEmail}
          selectedEmailId={selectedEmail?.id || null}
        />
      </div>

      {/* Vue de l'email sélectionné */}
      {isMobileView ? (
        selectedEmail && (
          <EmailViewer
            email={selectedEmail}
            onClose={handleCloseEmailView}
            onStar={handleStarEmail}
            onDelete={handleDeleteEmail}
            onReply={handleReplyEmail}
            onForward={handleForwardEmail}
            isMobile={true}
          />
        )
      ) : (
     
        <div className="hidden flex-1 md:block">
          <EmailViewer
            email={
              selectedEmail 
              // TODO: Remove the fallback when backend is ready
              || {
                id: generateId(),
                from: { name: '', email: '' },
                subject: 'No email selected',
                body: '',
                timestamp: new Date(),
                isRead: true,
                isStarred: false,
                isEncrypted: false,
                hasAttachments: false,
                labels: [],
              }
            }
            onStar={handleStarEmail}
            onDelete={handleDeleteEmail}
            onReply={handleReplyEmail}
            onForward={handleForwardEmail}
          />
        </div>
      )}

      {/* Modale de composition d'email */}
      <EmailComposer
        initialTo={selectedEmail ? selectedEmail.from.email : ''}
        initialSubject={selectedEmail ? `Re: ${selectedEmail.subject}` : ''}
        replyToEmail={!!selectedEmail}
      />

      {/* Bouton flottant pour composer un email (Mobile) */}
      <button
        className="fixed bottom-6 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-aether-primary shadow-lg hover:bg-aether-accent focus:outline-none md:hidden"
        onClick={() => setIsComposerOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-white">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  );
};

export default EmailInbox;