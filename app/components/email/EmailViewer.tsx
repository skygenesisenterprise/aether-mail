import type React from 'react';
import { useState } from 'react'; // Importation de useState
import { motion } from 'framer-motion';
import {
  ArrowPathRoundedSquareIcon,
  ArchiveBoxIcon,
  TrashIcon,
  StarIcon,
  EllipsisHorizontalIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { formatDate, formatFileSize } from '../../lib/utils';
import type { Email } from './EmailList';
import EmailComposer from './EmailComposer'; // Importation du composant EmailComposer

interface EmailViewerProps {
  email: Email | null;
  onClose?: () => void;
  onReply?: (email: Email) => void;
  onForward?: (email: Email) => void;
  onStar?: (email: Email) => void;
  onDelete?: (email: Email) => void;
  isMobile?: boolean;
}

const EmailViewer: React.FC<EmailViewerProps> = ({
  email,
  onClose,
  onReply,
  onForward,
  onStar,
  onDelete,
  isMobile = false
}) => {
  const [isComposerOpen, setIsComposerOpen] = useState(false); // État pour gérer l'ouverture du composant EmailComposer

  if (!email) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400">
        <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">Select an email to view</h3>
        <p className="mt-2 text-sm">Choose an email from the list to view its contents</p>
      </div>
    );
  }

  // Mock attachments for demo purposes
  const attachments = email.hasAttachments ? [
    { name: 'document.pdf', size: 2500000, type: 'application/pdf' },
    { name: 'image.jpg', size: 1200000, type: 'image/jpeg' }
  ] : [];

  // Animation for mobile view
  const mobileVariants = {
    hidden: { x: '100%' },
    visible: { x: 0 },
  };

  const content = (
    <div className="flex h-full flex-col">
      {/* Email header */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700 sm:px-6">
        {isMobile && (
          <button
            onClick={onClose}
            className="mb-4 inline-flex items-center rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <XMarkIcon className="h-5 w-5" />
            <span className="ml-1 text-sm">Back</span>
          </button>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{email.subject}</h2>
          <div className="flex items-center space-x-1">
            {email.isEncrypted && (
              <span className="inline-flex items-center rounded-full bg-aether-subtle px-2 py-1 text-xs font-medium text-aether-cosmic dark:bg-indigo-900 dark:text-indigo-200">
                <LockClosedIcon className="mr-1 h-3 w-3" />
                Encrypted
              </span>
            )}
            <button
              onClick={() => onStar?.(email)}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              {email.isStarred ? (
                <StarIconSolid className="h-5 w-5 text-amber-400" />
              ) : (
                <StarIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-start">
          <div className="mr-3 h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="flex h-full w-full items-center justify-center text-xl uppercase text-gray-600 dark:text-gray-300">
              {email.from.name.charAt(0)}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {email.from.name}
                  {email.from.verified && (
                    <span className="ml-1 inline-flex items-center rounded-full bg-green-100 px-1.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-300">
                      <ShieldCheckIcon className="mr-0.5 h-3 w-3" />
                      Verified
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{email.from.email}</p>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                {formatDate(email.timestamp)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="prose max-w-none dark:prose-invert">
          {/* This would normally be rendered HTML from the email, but for demo purposes we'll use plain text */}
          <div className="whitespace-pre-line text-gray-800 dark:text-gray-200">
            {email.body}
          </div>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mt-6 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-3 font-medium text-gray-900 dark:text-white">Attachments ({attachments.length})</h3>
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div
                  key={`attachment-${attachment.name}-${index}`}
                  className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex items-center">
                    <div className="rounded bg-gray-100 p-2 dark:bg-gray-800">
                      <PaperClipIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{attachment.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(attachment.size)}</p>
                    </div>
                  </div>
                  <button className="rounded p-1 text-aether-primary hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ArrowDownTrayIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Email actions */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setIsComposerOpen(true);
              onReply?.(email);
            }}
            className="inline-flex items-center rounded-md bg-aether-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-aether-accent focus:outline-none focus:ring-2 focus:ring-aether-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-1.5 h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Reply
          </button>
          <button
            onClick={() => {
              setIsComposerOpen(true);
              onForward?.(email);
            }}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-aether-primary focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-1.5 h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
            </svg>
            Forward
          </button>

          <div className="flex flex-1 justify-end space-x-2">
            <button className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
              <ArchiveBoxIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete?.(email)}
              className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
            <button className="rounded p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // For mobile view, wrap in a motion div for animations
  if (isMobile) {
    return (
      <motion.div
        className="absolute inset-0 z-50 bg-white dark:bg-gray-900"
        initial="hidden"
        animate="visible"
        variants={mobileVariants}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      >
        {content}
        <EmailComposer
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
          initialTo={email?.from.email}
          initialSubject={`Re: ${email?.subject}`}
          initialBody={`\n\nOn ${formatDate(email?.timestamp)}, ${email?.from.name} wrote:\n${email?.body}`}
          replyToEmail={true}
        />
      </motion.div>
    );
  }

  // Desktop view
  return (
    <div className="flex-1">
      {content}
      <EmailComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        initialTo={email?.from.email}
        initialSubject={`Re: ${email?.subject}`}
        initialBody={`\n\nOn ${formatDate(email?.timestamp)}, ${email?.from.name} wrote:\n${email?.body}`}
        replyToEmail={true}
      />
    </div>
  );
};

export default EmailViewer;
