import type React from "react";
import {
  ArrowPathRoundedSquareIcon,
  TrashIcon,
  StarIcon,
  EllipsisHorizontalIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { formatDate, formatFileSize } from "../../lib/utils";
import type { Email } from "./EmailList";

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
  isMobile = false,
}) => {
  if (!email) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-12 text-center relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-glass-primary/5 via-glass-secondary/10 to-glass-accent/5 animate-gradient-shift" />

        {/* Glass card container */}
        <div className="relative glass-card-xl p-8 max-w-sm mx-auto animate-float">
          <div className="glass-icon-container mb-6 animate-pulse-glow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-16 w-16 text-glass-text-primary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-glass-text-primary mb-3 bg-gradient-to-r from-glass-text-primary to-glass-text-secondary bg-clip-text text-transparent">
            Select an email to view
          </h3>
          <p className="text-glass-text-secondary max-w-sm leading-relaxed">
            Choose an email from the list to view its contents and details
          </p>
        </div>
      </div>
    );
  }

  const attachments = email.attachments || [];

  const content = (
    <div className="flex h-full flex-col relative">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-glass-primary/5 via-glass-secondary/10 to-glass-accent/5 animate-gradient-shift" />

      {/* Glass reading pane header */}
      <div className="relative glass-card-lg border-b border-glass-border/20 backdrop-blur-xl">
        {isMobile && (
          <button
            onClick={onClose}
            className="mb-4 glass-button-sm inline-flex items-center"
          >
            <XMarkIcon className="h-5 w-5" />
            <span className="ml-2 text-sm font-medium">Back</span>
          </button>
        )}

        {/* Subject and sender info - Liquid Glass style */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-glass-text-primary mb-4 break-words bg-gradient-to-r from-glass-text-primary to-glass-text-secondary bg-clip-text text-transparent">
            {email.subject}
          </h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Glass avatar with shimmer */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-glass-primary to-glass-secondary flex items-center justify-center text-white text-lg font-bold glass-avatar animate-shimmer">
                  {email.from.name.charAt(0).toUpperCase()}
                </div>
                {email.from.verified && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-glass-success rounded-full flex items-center justify-center animate-pulse-glow">
                    <ShieldCheckIcon className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center">
                  <p className="font-semibold text-glass-text-primary text-lg">
                    {email.from.name}
                  </p>
                  {email.from.verified && (
                    <span className="ml-2 glass-badge-success inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                      <ShieldCheckIcon className="mr-1 h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-glass-text-secondary">
                  {email.from.email}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {email.isEncrypted && (
                <span className="glass-badge-primary inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
                  <LockClosedIcon className="mr-1 h-3 w-3" />
                  Encrypted
                </span>
              )}
              <p className="text-sm text-glass-text-muted glass-badge px-3 py-1 rounded-full">
                {formatDate(email.timestamp)}
              </p>
            </div>
          </div>

          {/* To/CC/BCC fields - Glass style */}
          <div className="mt-4 p-3 glass-card rounded-lg text-sm text-glass-text-secondary space-y-2">
            <p className="flex items-center">
              <span className="font-medium text-glass-text-primary mr-2">
                To:
              </span>
              <span>{email.to || "me"}</span>
            </p>
            {email.cc && (
              <p className="flex items-center">
                <span className="font-medium text-glass-text-primary mr-2">
                  CC:
                </span>
                <span>{email.cc}</span>
              </p>
            )}
            {email.bcc && (
              <p className="flex items-center">
                <span className="font-medium text-glass-text-primary mr-2">
                  BCC:
                </span>
                <span>{email.bcc}</span>
              </p>
            )}
          </div>
        </div>

        {/* Quick actions - Glass toolbar */}
        <div className="flex items-center justify-between pt-4 border-t border-glass-border/20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onReply?.(email)}
              className="glass-button-primary inline-flex items-center px-4 py-2 text-sm font-medium"
            >
              <ArrowPathRoundedSquareIcon className="mr-2 h-4 w-4" />
              Reply
            </button>
            <button
              onClick={() => onForward?.(email)}
              className="glass-button inline-flex items-center px-4 py-2 text-sm font-medium"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"
                />
              </svg>
              Forward
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onStar?.(email)}
              className={`glass-icon-button ${email.isStarred ? "text-glass-warning animate-pulse-glow" : ""}`}
              title={email.isStarred ? "Remove star" : "Add star"}
            >
              {email.isStarred ? (
                <StarIconSolid className="h-5 w-5" />
              ) : (
                <StarIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={() => onDelete?.(email)}
              className="glass-icon-button text-glass-danger hover:text-glass-danger"
              title="Delete"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
            <button className="glass-icon-button">
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Email content - Glass reading pane */}
      <div className="flex-1 overflow-auto relative">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Message body with glass card */}
          <div className="glass-card-xl p-8 mb-6 animate-fade-in">
            <div
              className="prose prose-sm max-w-none dark:prose-invert text-glass-text-primary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          </div>

          {/* Attachments section - Glass style */}
          {attachments.length > 0 && (
            <div className="glass-card-lg p-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-glass-text-primary mb-6 flex items-center">
                <div className="glass-icon-container mr-3">
                  <PaperClipIcon className="h-5 w-5" />
                </div>
                Attachments ({attachments.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attachments.map((attachment, index) => (
                  <div
                    key={`attachment-${attachment.filename}-${index}`}
                    className="glass-card p-4 hover:scale-[1.02] transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="glass-icon-container-sm mr-3 group-hover:animate-pulse-glow">
                          <PaperClipIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-glass-text-primary truncate">
                            {attachment.filename}
                          </p>
                          <p className="text-xs text-glass-text-muted">
                            {formatFileSize(attachment.filesize)}
                          </p>
                        </div>
                      </div>
                      <button className="glass-button-sm ml-3 group-hover:scale-110 transition-transform">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Desktop view with glass background
  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-glass-primary/5 via-glass-secondary/10 to-glass-accent/5 animate-gradient-shift" />
      <div className="relative h-full">{content}</div>
    </div>
  );
};

export default EmailViewer;
