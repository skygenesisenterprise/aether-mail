import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  MinusIcon,
  ArrowsPointingOutIcon,
  PaperClipIcon,
  LockClosedIcon,
  LockOpenIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTo?: string;
  initialSubject?: string;
  initialBody?: string;
  replyToEmail?: boolean;
}

const EmailComposer: React.FC<EmailComposerProps> = ({
  isOpen,
  onClose,
  initialTo = '',
  initialSubject = '',
  initialBody = '',
  replyToEmail = false,
}) => {
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [to, setTo] = useState(initialTo);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [encryption, setEncryption] = useState<'none' | 'standard' | 'end-to-end'>('standard');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [showEncryptionOptions, setShowEncryptionOptions] = useState(false);

  const composerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Focus the appropriate field when opening
  useEffect(() => {
    if (isOpen && !minimized) {
      if (initialTo && !replyToEmail) {
        composerRef.current?.querySelector<HTMLInputElement>('input[name="subject"]')?.focus();
      } else if (replyToEmail) {
        bodyRef.current?.focus();
      } else {
        composerRef.current?.querySelector<HTMLInputElement>('input[name="to"]')?.focus();
      }
    }
  }, [isOpen, minimized, initialTo, replyToEmail]);

  if (!isOpen) return null;

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5 }
  };

  const composerVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const handleEncryptionChange = (type: 'none' | 'standard' | 'end-to-end') => {
    setEncryption(type);
    setShowEncryptionOptions(false);
  };

  return (
    <AnimatePresence>
      {isOpen && !minimized && (
        <motion.div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black",
            maximized ? "bg-opacity-50" : "bg-opacity-0"
          )}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          onClick={() => maximized && setMaximized(false)}
        />
      )}

      <motion.div
        ref={composerRef}
        className={cn(
          "fixed z-50 flex flex-col bg-white shadow-xl dark:bg-gray-900",
          maximized
            ? "inset-4 rounded-lg sm:inset-6 md:inset-10"
            : minimized
              ? "bottom-0 right-4 h-14 w-80 rounded-t-lg"
              : "bottom-4 right-4 h-[32rem] w-[36rem] rounded-lg sm:bottom-6 sm:right-6 sm:w-[40rem]"
        )}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={composerVariants}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700",
            minimized ? "cursor-pointer" : ""
          )}
          onClick={() => minimized && setMinimized(false)}
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {replyToEmail ? "Reply" : "New Message"}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMinimized(!minimized);
              }}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <MinusIcon className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMaximized(!maximized);
              }}
              className={cn(
                "rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
                minimized ? "hidden" : ""
              )}
            >
              <ArrowsPointingOutIcon className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body - hidden when minimized */}
        {!minimized && (
          <>
            <div className="flex-1 overflow-auto p-4">
              {/* Recipients */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <label htmlFor="to" className="mr-3 w-12 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                    To:
                  </label>
                  <input
                    type="text"
                    id="to"
                    name="to"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-aether-primary focus:ring-aether-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="Recipients"
                  />
                  <button
                    onClick={() => setShowCcBcc(!showCcBcc)}
                    className="ml-2 text-sm text-aether-primary"
                  >
                    {showCcBcc ? 'Hide' : 'Cc/Bcc'}
                  </button>
                </div>

                {showCcBcc && (
                  <>
                    <div className="flex items-center">
                      <label htmlFor="cc" className="mr-3 w-12 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cc:
                      </label>
                      <input
                        type="text"
                        id="cc"
                        name="cc"
                        value={cc}
                        onChange={(e) => setCc(e.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-aether-primary focus:ring-aether-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        placeholder="Carbon copy recipients"
                      />
                    </div>

                    <div className="flex items-center">
                      <label htmlFor="bcc" className="mr-3 w-12 flex-shrink-0 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bcc:
                      </label>
                      <input
                        type="text"
                        id="bcc"
                        name="bcc"
                        value={bcc}
                        onChange={(e) => setBcc(e.target.value)}
                        className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-aether-primary focus:ring-aether-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        placeholder="Blind carbon copy recipients"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Subject */}
              <div className="mt-4">
                <input
                  type="text"
                  name="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-aether-primary focus:ring-aether-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Subject"
                />
              </div>

              {/* Email Body */}
              <div className="mt-4">
                <textarea
                  ref={bodyRef}
                  name="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="h-64 w-full resize-none rounded-md border-gray-300 text-sm shadow-sm focus:border-aether-primary focus:ring-aether-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Write your message here..."
                />
              </div>
            </div>

            {/* Footer with actions */}
            <div className="border-t border-gray-200 p-4 dark:border-gray-700">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex space-x-2">
                  <button
                    className="inline-flex items-center rounded-md bg-aether-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-aether-accent focus:outline-none focus:ring-2 focus:ring-aether-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  >
                    Send
                  </button>

                  <div className="relative">
                    <button
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => setShowEncryptionOptions(!showEncryptionOptions)}
                    >
                      {encryption === 'none' && (
                        <>
                          <LockOpenIcon className="mr-1.5 h-4 w-4 text-gray-500" />
                          Not encrypted
                        </>
                      )}
                      {encryption === 'standard' && (
                        <>
                          <LockClosedIcon className="mr-1.5 h-4 w-4 text-aether-primary" />
                          Standard encryption
                        </>
                      )}
                      {encryption === 'end-to-end' && (
                        <>
                          <LockClosedIcon className="mr-1.5 h-4 w-4 text-green-600" />
                          End-to-end encrypted
                        </>
                      )}
                      <ChevronDownIcon className="ml-1.5 h-4 w-4" />
                    </button>

                    {showEncryptionOptions && (
                      <div className="absolute right-0 mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <button
                            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            onClick={() => handleEncryptionChange('none')}
                          >
                            <LockOpenIcon className="mr-3 h-4 w-4 text-gray-500" />
                            Not encrypted
                          </button>
                          <button
                            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            onClick={() => handleEncryptionChange('standard')}
                          >
                            <LockClosedIcon className="mr-3 h-4 w-4 text-aether-primary" />
                            Standard encryption
                          </button>
                          <button
                            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            onClick={() => handleEncryptionChange('end-to-end')}
                          >
                            <LockClosedIcon className="mr-3 h-4 w-4 text-green-600" />
                            End-to-end encrypted
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="rounded-md border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                    <PaperClipIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default EmailComposer;
