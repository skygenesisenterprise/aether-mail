import React, { useState } from 'react';
import EmailList, { type Email } from './EmailList';
import EmailViewer from './EmailViewer';
import EmailComposer from './EmailComposer';
import { generateId } from '../../lib/utils';

const EmailInbox: React.FC = () => {
  // Initialiser l'état avec un tableau vide
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check for mobile view on component mount and window resize
  React.useEffect(() => {
    const checkForMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    checkForMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkForMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkForMobile);
  }, []);

  // Handle email selection
  const handleSelectEmail = (emailToSelect: Email) => {
    // Mark as read when selecting
    if (!emailToSelect.isRead) {
      const updatedEmails = emails.map(e =>
        e.id === emailToSelect.id ? { ...e, isRead: true } : e
      );
      setEmails(updatedEmails);

      // Create a new object with isRead set to true
      const updatedEmail = { ...emailToSelect, isRead: true };
      setSelectedEmail(updatedEmail);
    } else {
      setSelectedEmail(emailToSelect);
    }
  };

  // Handle starring emails
  const handleStarEmail = (email: Email) => {
    const updatedEmails = emails.map(e =>
      e.id === email.id ? { ...e, isStarred: !e.isStarred } : e
    );
    setEmails(updatedEmails);

    if (selectedEmail && selectedEmail.id === email.id) {
      setSelectedEmail({ ...selectedEmail, isStarred: !selectedEmail.isStarred });
    }
  };

  // Handle deleting emails
  const handleDeleteEmail = (email: Email) => {
    // In a real app, this would send a request to the server
    const updatedEmails = emails.filter(e => e.id !== email.id);
    setEmails(updatedEmails);
    setSelectedEmail(null);
  };

  // Handle replying to emails
  const handleReplyEmail = (email: Email) => {
    setIsComposerOpen(true);
  };

  // Handle forwarding emails
  const handleForwardEmail = (email: Email) => {
    setIsComposerOpen(true);
  };

  // Close the selected email on mobile
  const handleCloseEmailView = () => {
    setSelectedEmail(null);
  };

  return (
    <div className="flex h-full">
      {/* Email List - hidden on mobile when an email is selected */}
      <div
        className={`flex-1 ${isMobileView && selectedEmail ? 'hidden' : 'block'} md:block md:w-96 md:flex-none`}
      >
        <EmailList
          emails={emails}
          onSelectEmail={handleSelectEmail}
          selectedEmailId={selectedEmail?.id || null}
        />
      </div>

      {/* Email Viewer */}
      {isMobileView ? (
        // Mobile view
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
        // Desktop view
        <div className="hidden flex-1 md:block">
          <EmailViewer
            email={selectedEmail}
            onStar={handleStarEmail}
            onDelete={handleDeleteEmail}
            onReply={handleReplyEmail}
            onForward={handleForwardEmail}
          />
        </div>
      )}

      {/* Composer Modal */}
      <EmailComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        initialTo={selectedEmail ? selectedEmail.from.email : ''}
        initialSubject={selectedEmail ? `Re: ${selectedEmail.subject}` : ''}
        replyToEmail={!!selectedEmail}
      />

      {/* Floating Compose Button (Mobile) */}
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