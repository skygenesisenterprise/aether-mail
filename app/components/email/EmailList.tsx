import type React from 'react';
import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  StarIcon,
  LockClosedIcon,
  PaperClipIcon,
  ChevronDownIcon,
  FunnelIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { formatDate, truncateText } from '../../lib/utils';

// Email interface
export interface Email {
  id: string;
  from: {
    name: string;
    email: string;
    verified?: boolean;
  };
  subject: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  isEncrypted: boolean;
  hasAttachments: boolean;
  labels?: string[];
}

interface EmailListProps {
  emails: Email[];
  onSelectEmail: (email: Email) => void;
  selectedEmailId: string | null;
}

const EmailList: React.FC<EmailListProps> = ({ emails, onSelectEmail, selectedEmailId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  // Filter emails based on search term
  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col border-r border-gray-200 dark:border-gray-700">
      {/* Search bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search emails"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm transition placeholder:text-gray-500 focus:border-aether-primary focus:outline-none focus:ring-1 focus:ring-aether-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
      </div>

      {/* Filter options */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-700">
        <div className="text-sm font-medium dark:text-gray-300">
          {filteredEmails.length} {filteredEmails.length === 1 ? 'message' : 'messages'}
        </div>
        <div className="flex gap-2">
          <button
            className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
          >
            <FunnelIcon className="h-5 w-5" />
          </button>
          <button className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
            <ArrowsUpDownIcon className="h-5 w-5" />
          </button>
          
          {/* Filter dropdown */}
          {filterMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute translate-x-1/2 translate-y-1/2 top-44 z-10 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:text-gray-300"
            >
              <div className="px-4 py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Filter by
              </div>
              <div className="px-4 py-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300 text-aether-primary focus:ring-aether-primary" />
                  Unread
                </label>
              </div>
              <div className="px-4 py-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300 text-aether-primary focus:ring-aether-primary" />
                  Starred
                </label>
              </div>
              <div className="px-4 py-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300 text-aether-primary focus:ring-aether-primary" />
                  Encrypted
                </label>
              </div>
              <div className="px-4 py-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300 text-aether-primary focus:ring-aether-primary" />
                  With attachments
                </label>
              </div>
            </motion.div>
          )}
        </div>
      </div>


      {/* Email list */}
      <div className="flex-1 overflow-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <div className="mb-2 rounded-full bg-gray-100 p-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No emails found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredEmails.map((email) => (
              <li
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className={`cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedEmailId === email.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''} ${!email.isRead ? 'font-medium' : ''}`}
              >
                <div className="relative px-4 py-3 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h3 className="truncate text-sm text-gray-800 dark:text-gray-200">
                      {email.from.name}
                      {email.from.verified && (
                        <span className="ml-1 rounded-full bg-green-100 px-1.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-300">
                          ✓
                        </span>
                      )}
                    </h3>
                    <p className="whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(email.timestamp)}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <h4 className="truncate text-sm text-gray-700 dark:text-gray-300">
                      {email.subject}
                    </h4>
                    <div className="ml-2 flex flex-shrink-0 items-center space-x-1">
                      {email.isStarred && (
                        <StarIconSolid className="h-4 w-4 text-amber-400" />
                      )}
                      {email.isEncrypted && (
                        <LockClosedIcon className="h-4 w-4 text-aether-primary" />
                      )}
                      {email.hasAttachments && (
                        <PaperClipIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                    {truncateText(email.body, 120)}
                  </div>

                  {/* Email labels */}
                  {email.labels && email.labels.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {email.labels.map((label) => (
                        <span
                          key={label}
                          className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Unread indicator */}
                  {!email.isRead && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-aether-primary" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EmailList;