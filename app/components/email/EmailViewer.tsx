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
      <div className="flex h-full flex-col items-center justify-center p-12 text-center bg-proton-dark">
        <div className="mb-6 rounded-full bg-proton-dark-secondary p-6 shadow-sm border border-proton-border">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-12 w-12 text-proton-text-muted"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-proton-text mb-2">
          Select an email to view
        </h3>
        <p className="text-proton-text-secondary max-w-sm">
          Choose an email from the list to view its contents and details
        </p>
      </div>
    );
  }

  const attachments = email.attachments || [];

  const content = (
    <div className="flex h-full flex-col bg-proton-dark-secondary">
      {/* Email header */}
      <div className="border-b border-proton-border p-6 bg-proton-dark">
        {isMobile && (
          <button
            onClick={onClose}
            className="mb-4 inline-flex items-center rounded-lg p-2 text-proton-text-secondary hover:bg-proton-dark-tertiary transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
            <span className="ml-2 text-sm font-medium">Back</span>
          </button>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-proton-text mb-4 break-words">
              {email.subject}
            </h2>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-proton-primary to-proton-secondary flex items-center justify-center text-white text-lg font-medium">
                  {email.from.name.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-proton-text text-base">
                      {email.from.name}
                      {email.from.verified && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full bg-proton-success/20 text-xs font-medium text-proton-success">
                          <ShieldCheckIcon className="mr-1 h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-proton-text-secondary mt-0.5">
                      {email.from.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {email.isEncrypted && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-proton-primary/20 text-xs font-medium text-proton-primary">
                        <LockClosedIcon className="mr-1.5 h-3 w-3" />
                        Encrypted
                      </span>
                    )}
                    <p className="text-sm text-proton-text-muted">
                      {formatDate(email.timestamp)}
                    </p>
                  </div>
                </div>

                {/* CC/BCC if present */}
                {(email.cc || email.bcc) && (
                  <div className="mt-3 text-sm text-proton-text-secondary">
                    {email.cc && (
                      <p className="mb-1">
                        <strong className="text-proton-text">CC:</strong>{" "}
                        {email.cc}
                      </p>
                    )}
                    {email.bcc && (
                      <p>
                        <strong className="text-proton-text">BCC:</strong>{" "}
                        {email.bcc}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-proton-border">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onReply?.(email)}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-proton-primary text-white text-sm font-medium hover:bg-proton-accent-hover transition-colors"
            >
              <ArrowPathRoundedSquareIcon className="mr-2 h-4 w-4" />
              Reply
            </button>
            <button
              onClick={() => onForward?.(email)}
              className="inline-flex items-center px-4 py-2 rounded-lg border border-proton-border bg-proton-dark text-proton-text text-sm font-medium hover:bg-proton-dark-tertiary transition-colors"
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
              className="rounded-lg p-2 text-proton-text-secondary hover:bg-proton-dark-tertiary transition-colors"
              title={email.isStarred ? "Remove star" : "Add star"}
            >
              {email.isStarred ? (
                <StarIconSolid className="h-5 w-5 text-proton-warning" />
              ) : (
                <StarIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={() => onDelete?.(email)}
              className="rounded-lg p-2 text-proton-text-secondary hover:bg-proton-dark-tertiary transition-colors"
              title="Delete"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
            <button className="rounded-lg p-2 text-proton-text-secondary hover:bg-proton-dark-tertiary transition-colors">
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="prose prose-gray max-w-none">
            {/* Render HTML body */}
            <div
              className="text-proton-text leading-relaxed"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-proton-text mb-4">
                Attachments ({attachments.length})
              </h3>
              <div className="space-y-3">
                {attachments.map((attachment, index) => (
                  <div
                    key={`attachment-${attachment.filename}-${index}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-proton-border bg-proton-dark hover:bg-proton-dark-tertiary transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="rounded-lg bg-proton-dark-secondary p-2 border border-proton-border">
                        <PaperClipIcon className="h-5 w-5 text-proton-text-secondary" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-proton-text">
                          {attachment.filename}
                        </p>
                        <p className="text-xs text-proton-text-muted">
                          {formatFileSize(attachment.filesize)}
                        </p>
                      </div>
                    </div>
                    <button className="rounded-lg p-2 text-proton-text-secondary hover:bg-proton-dark-secondary hover:shadow-sm transition-colors">
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Desktop view
  return <div className="flex-1 bg-proton-dark-secondary">{content}</div>;
};

export default EmailViewer;
