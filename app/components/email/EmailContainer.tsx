import React, { useState } from 'react';
import EmailViewer from './EmailViewer';
import EmailComposer from './EmailComposer';
import type { Email } from './EmailList';

interface EmailContainerProps {
  email: Email | null;
  onClose?: () => void;
  onReply?: (email: Email) => void;
  onForward?: (email: Email) => void;
  onStar?: (email: Email) => void;
  onDelete?: (email: Email) => void;
  isMobile?: boolean;
}

const EmailContainer: React.FC<EmailContainerProps> = ({
  email,
  onClose,
  onReply,
  onForward,
  onStar,
  onDelete,
  isMobile = false
}) => {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<'reply' | 'forward' | 'new'>('new');

  const handleReply = (email: Email) => {
    setIsComposerOpen(true);
    setComposerMode('reply');
    onReply?.(email);
  };

  const handleForward = (email: Email) => {
    setIsComposerOpen(true);
    setComposerMode('forward');
    onForward?.(email);
  };

  return (
    <div className="flex-1">
      {isComposerOpen ? (
        <EmailComposer
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          initialTo={email?.from.email}
          initialSubject={composerMode === 'reply' ? `Re: ${email?.subject}` : `Fwd: ${email?.subject}`}
          initialBody={`\n\nOn ${formatDate(email?.timestamp)}, ${email?.from.name} wrote:\n${email?.body}`}
          replyToEmail={composerMode === 'reply'}
        />
      ) : (
        <EmailViewer
          email={email}
          onClose={onClose}
          onReply={handleReply}
          onForward={handleForward}
          onStar={onStar}
          onDelete={onDelete}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

export default EmailContainer;