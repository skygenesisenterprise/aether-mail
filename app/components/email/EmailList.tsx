import { motion } from "framer-motion";
import { formatDate, truncateText } from "../../lib/utils";
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
import { cn } from "../../lib/utils";

// Email interface
export interface Email {
  id: string;
  from: {
    name: string;
    email: string;
    verified?: boolean;
  };
  to?: string;
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
    <div className="flex h-full flex-col glass-strong glass-no-border border-r border-white/10">
      {/* Glass Search bar */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 glass-text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full pl-12 pr-4 py-3 text-sm glass-strong"
          />
        </div>
      </div>

      {/* Glass Filter options */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="text-xs glass-text-muted font-medium">
          {filteredEmails.length}{" "}
          {filteredEmails.length === 1 ? "email" : "emails"}
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Filter emails"
            className={`glass-button glass-shimmer text-xs p-2 ${
              filterMenuOpen ? "glass-primary" : ""
            }`}
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
          >
            <FunnelIcon className="h-4 w-4" />
          </button>
          <button
            aria-label="Sort emails"
            className="glass-button glass-shimmer text-xs p-2"
          >
            <ArrowsUpDownIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Glass Email list */}
      <div className="flex-1 overflow-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 w-20 h-20 rounded-2xl glass-gradient flex items-center justify-center glass-float">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-10 w-10 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold glass-text-primary mb-2">
              No emails found
            </h3>
            <p className="text-sm glass-text-muted">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredEmails.map((email, index) => (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: index * 0.05,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                onClick={() => onSelectEmail(email)}
                className={cn(
                  "glass-card glass-hover cursor-pointer glass-transition-all",
                  selectedEmailId === email.id
                    ? "glass-primary ring-2 ring-white/30"
                    : "",
                )}
              >
                <div className="relative p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      {/* Glass Avatar */}
                      <div className="flex-shrink-0 mr-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white glass-transition-all",
                            !email.isRead
                              ? "glass-gradient glass-pulse"
                              : "glass-strong",
                          )}
                        >
                          {email.from.name.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3
                            className={cn(
                              "truncate text-sm font-medium glass-transition-all",
                              !email.isRead
                                ? "glass-text-primary font-bold"
                                : "glass-text-secondary",
                            )}
                          >
                            {email.from.name}
                            {email.from.verified && (
                              <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full glass-success">
                                <svg
                                  className="w-2.5 h-2.5 text-white"
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
                          <p className="text-xs glass-text-muted ml-2 flex-shrink-0">
                            {formatDate(email.timestamp)}
                          </p>
                        </div>
                        <h4
                          className={cn(
                            "truncate text-sm mb-1 glass-transition-all",
                            !email.isRead
                              ? "glass-text-primary font-semibold"
                              : "glass-text-secondary",
                          )}
                        >
                          {email.subject}
                        </h4>
                        <div className="truncate text-xs glass-text-muted leading-relaxed">
                          {truncateText(
                            email.body.replace(/<[^>]*>/g, ""),
                            100,
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Glass Status icons */}
                    <div className="ml-3 flex flex-shrink-0 items-center space-x-2">
                      {email.isStarred && (
                        <div className="w-6 h-6 rounded-lg glass-warning flex items-center justify-center glass-pulse">
                          <StarIconSolid className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      {email.isEncrypted && (
                        <div className="w-6 h-6 rounded-lg glass-primary flex items-center justify-center">
                          <LockClosedIcon className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      {email.hasAttachments && (
                        <div className="w-6 h-6 rounded-lg glass-strong flex items-center justify-center">
                          <PaperClipIcon className="h-3.5 w-3.5 glass-text-secondary" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Glass Email labels */}
                  {email.labels && email.labels.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {email.labels.map((label) => (
                        <span
                          key={label}
                          className="inline-flex items-center rounded-full glass-gradient px-3 py-1 text-xs font-medium text-white glass-shimmer"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Glass Unread indicator */}
                  {!email.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 glass-gradient rounded-r-full glass-pulse" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailList;
