import { formatDate, truncateText } from "../../lib/utils";
import type React from "react";
import { useRef } from "react";
import {
  MagnifyingGlassIcon,
  LockClosedIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { cn } from "../../lib/utils";
import { useEmailStore } from "../../store/emailStore";
import EmailBulkActions from "./EmailBulkActions";
import EmailSortFilter from "./EmailSortFilter";

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

const EmailList: React.FC<EmailListProps> = ({
  onSelectEmail,
  selectedEmailId,
  onStar,
  onDelete,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    selectedEmails,
    toggleEmailSelection,
    selectAllEmails,
    isEmailSelected,
    getFilteredAndSortedEmails,
  } = useEmailStore();

  const checkboxRef = useRef<HTMLInputElement>(null);
  const filteredEmails = getFilteredAndSortedEmails();
  const selectedCount = selectedEmails.size;
  const allSelected = filteredEmails.length > 0 && filteredEmails.every((e) => isEmailSelected(e.id));

  const handleCheckboxChange = () => {
    if (allSelected) {
      useEmailStore.getState().clearSelection();
    } else {
      selectAllEmails();
    }
  };

  const handleEmailClick = (email: Email, event: React.MouseEvent) => {
    // If clicking on checkbox, don't select email
    if ((event.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }

    // Ctrl/Cmd click for multi-select
    if (event.ctrlKey || event.metaKey) {
      toggleEmailSelection(email.id);
    } else {
      // Regular click - clear selection and select email
      useEmailStore.getState().clearSelection();
      onSelectEmail(email);
    }
  };

  return (
    <div className="flex h-full flex-col surface-secondary border-r border-gray-800">
      {/* Search bar */}
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-tertiary" />
          </div>
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-full pl-12 pr-4 py-3 text-sm"
          />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <EmailBulkActions selectedCount={selectedCount} />
      )}

      {/* Sort and Filter */}
      <EmailSortFilter />

      {/* Email list */}
      <div className="flex-1 overflow-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 w-20 h-20 rounded-2xl surface-tertiary flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-10 w-10 text-tertiary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              No emails found
            </h3>
            <p className="text-sm text-tertiary">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {/* Select All Checkbox */}
            {filteredEmails.length > 0 && (
              <div className="px-4 py-2 border-b border-gray-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    ref={checkboxRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-xs text-tertiary">
                    Select all ({filteredEmails.length})
                  </span>
                </label>
              </div>
            )}
            
            {filteredEmails.map((email) => {
              const isSelected = isEmailSelected(email.id);
              const isViewSelected = selectedEmailId === email.id;
              
              return (
                <div
                  key={email.id}
                  onClick={(e) => handleEmailClick(email, e)}
                  className={cn(
                    "email-item cursor-pointer",
                    isViewSelected ? "selected" : "",
                    !email.isRead ? "unread" : "",
                    isSelected ? "bg-blue-500/10 border-l-2 border-blue-500" : "",
                  )}
                >
                  <div className="relative p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        {/* Checkbox for multi-select */}
                        <div className="flex-shrink-0 mr-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleEmailSelection(email.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        
                        {/* Avatar */}
                        <div className="flex-shrink-0 mr-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white transition-all duration-200",
                              !email.isRead
                                ? "bg-gradient-to-br from-blue-500 to-purple-600"
                                : "surface-tertiary text-secondary",
                            )}
                          >
                            {email.from.name.charAt(0).toUpperCase()}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3
                              className={cn(
                                "truncate text-sm font-medium transition-all duration-200",
                                !email.isRead
                                  ? "text-primary font-semibold"
                                  : "text-secondary",
                              )}
                            >
                              {email.from.name}
                              {email.from.verified && (
                                <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-600">
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
                            <p className="text-xs text-tertiary ml-2 flex-shrink-0">
                              {formatDate(email.timestamp)}
                            </p>
                          </div>
                          <h4
                            className={cn(
                              "truncate text-sm mb-1 transition-all duration-200",
                              !email.isRead
                                ? "text-primary font-medium"
                                : "text-secondary",
                            )}
                          >
                            {email.subject}
                          </h4>
                          <div className="truncate text-xs text-tertiary leading-relaxed">
                            {truncateText(
                              email.body.replace(/<[^>]*>/g, ""),
                              100,
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status icons */}
                      <div className="ml-3 flex flex-shrink-0 items-center space-x-2">
                        {email.isStarred && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStar?.(email);
                            }}
                            className="w-6 h-6 rounded-lg surface-tertiary flex items-center justify-center hover:bg-gray-700 transition-colors"
                          >
                            <StarIconSolid className="h-3.5 w-3.5 text-yellow-400" />
                          </button>
                        )}
                        {email.isEncrypted && (
                          <div className="w-6 h-6 rounded-lg surface-tertiary flex items-center justify-center">
                            <LockClosedIcon className="h-3.5 w-3.5 text-purple-400" />
                          </div>
                        )}
                        {email.hasAttachments && (
                          <div className="w-6 h-6 rounded-lg surface-tertiary flex items-center justify-center">
                            <PaperClipIcon className="h-3.5 w-3.5 text-tertiary" />
                          </div>
                        )}
                      </div>
                    </div>

                      {/* Email labels */}
                      {email.labels && email.labels.length > 0 && (
                        <div className="mt-3 flex gap-2">
                          {email.labels.map((label) => (
                            <span key={label} className="badge badge-primary">
                              {label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Unread indicator */}
                      {!email.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailList;
