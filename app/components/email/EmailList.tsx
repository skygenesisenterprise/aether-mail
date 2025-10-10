import type React from "react";
import { useState } from "react";
import {
  MagnifyingGlassIcon,
  LockClosedIcon,
  PaperClipIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import { formatDate, truncateText } from "../../lib/utils";

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
  cc?: string;
  bcc?: string;
  attachments?: Array<{
    filename: string;
    filesize: number;
  }>;
}

interface EmailListProps {
  emails: Email[];
  onSelectEmail: (email: Email) => void;
  selectedEmailId: string | null;
  onStar?: (email: Email) => void;
  onDelete?: (email: Email) => void;
}

const EmailList: React.FC<EmailListProps> = ({
  emails,
  onSelectEmail,
  selectedEmailId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  // Filter emails based on search term
  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.body.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col border-r border-proton-border bg-proton-dark-secondary">
      {/* Search bar */}
      <div className="p-4 border-b border-proton-border">
        <div className="relative">
          <input
            type="text"
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-4 py-2.5 text-sm bg-proton-dark border border-proton-border rounded-xl placeholder-proton-text-muted text-proton-text focus:outline-none focus:ring-2 focus:ring-proton-primary focus:border-transparent transition-colors"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-proton-text-muted" />
        </div>
      </div>

      {/* Filter options */}
      <div className="flex items-center justify-between px-4 py-3 bg-proton-dark border-b border-proton-border">
        <div className="text-sm text-proton-text-secondary">
          {filteredEmails.length}{" "}
          {filteredEmails.length === 1 ? "message" : "messages"}
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Filter emails"
            className="rounded-lg p-2 text-proton-text-secondary hover:bg-proton-dark-tertiary transition-colors"
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
          >
            <FunnelIcon className="h-4 w-4" />
          </button>
          <button
            aria-label="Sort emails"
            className="rounded-lg p-2 text-proton-text-secondary hover:bg-proton-dark-tertiary transition-colors"
          >
            <ArrowsUpDownIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 rounded-full bg-proton-dark-tertiary p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-8 w-8 text-proton-text-muted"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-proton-text mb-2">
              No emails found
            </h3>
            <p className="text-sm text-proton-text-muted">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-proton-border">
            {filteredEmails.map((email, index) => (
              <motion.li
                key={email.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectEmail(email)}
                className={`group cursor-pointer transition-all hover:bg-proton-dark-tertiary ${selectedEmailId === email.id ? "bg-proton-primary/5 border-r-4 border-proton-primary" : ""}`}
              >
                <div className="relative px-4 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-proton-primary to-proton-secondary flex items-center justify-center text-white text-sm font-medium">
                          {email.from.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`truncate text-sm font-medium ${!email.isRead ? "text-proton-text" : "text-proton-text-secondary"}`}
                          >
                            {email.from.name}
                            {email.from.verified && (
                              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-proton-success/20">
                                <svg
                                  className="w-2.5 h-2.5 text-proton-success"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-proton-text-muted ml-2 flex-shrink-0">
                            {formatDate(email.timestamp)}
                          </p>
                        </div>
                        <h4
                          className={`truncate text-sm mt-0.5 ${!email.isRead ? "font-medium text-proton-text" : "text-proton-text-secondary"}`}
                        >
                          {email.subject}
                        </h4>
                        <div className="mt-1 truncate text-xs text-proton-text-muted">
                          {truncateText(
                            email.body.replace(/<[^>]*>/g, ""),
                            120,
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="ml-3 flex flex-shrink-0 items-center space-x-2">
                      {email.isStarred && (
                        <StarIconSolid className="h-4 w-4 text-proton-warning" />
                      )}
                      {email.isEncrypted && (
                        <LockClosedIcon className="h-4 w-4 text-proton-primary" />
                      )}
                      {email.hasAttachments && (
                        <PaperClipIcon className="h-4 w-4 text-proton-text-muted" />
                      )}
                    </div>
                  </div>

                  {/* Email labels */}
                  {email.labels && email.labels.length > 0 && (
                    <div className="mt-3 flex gap-1">
                      {email.labels.map((label) => (
                        <span
                          key={label}
                          className="inline-flex items-center rounded-full bg-proton-primary/20 px-2 py-0.5 text-xs font-medium text-proton-primary"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Unread indicator */}
                  {!email.isRead && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-proton-primary rounded-r" />
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EmailList;
