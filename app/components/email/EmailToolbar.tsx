import type React from "react";
import {
  ArrowUturnLeftIcon,
  ArrowRightIcon,
  TrashIcon,
  ArchiveBoxIcon,
  FlagIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import type { Email } from "./EmailList";

interface EmailToolbarProps {
  selectedEmail: Email | null;
  onReply?: (email: Email) => void;
  onForward?: (email: Email) => void;
  onDelete?: (email: Email) => void;
  onArchive?: (email: Email) => void;
  onFlag?: (email: Email) => void;
}

const EmailToolbar: React.FC<EmailToolbarProps> = ({
  selectedEmail,
  onReply,
  onForward,
  onDelete,
  onArchive,
  onFlag,
}) => {
  if (!selectedEmail) {
    return (
      <div className="flex h-12 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Select an email to see actions
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-12 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center space-x-2">
        {/* Reply */}
        <button
          onClick={() => onReply?.(selectedEmail)}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ArrowUturnLeftIcon className="mr-2 h-4 w-4" />
          Reply
        </button>

        {/* Forward */}
        <button
          onClick={() => onForward?.(selectedEmail)}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ArrowRightIcon className="mr-2 h-4 w-4" />
          Forward
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete?.(selectedEmail)}
          className="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
        >
          <TrashIcon className="mr-2 h-4 w-4" />
          Delete
        </button>

        {/* Archive */}
        <button
          onClick={() => onArchive?.(selectedEmail)}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <ArchiveBoxIcon className="mr-2 h-4 w-4" />
          Archive
        </button>

        {/* Flag */}
        <button
          onClick={() => onFlag?.(selectedEmail)}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <FlagIcon className="mr-2 h-4 w-4" />
          Flag
        </button>
      </div>

      <div className="flex items-center space-x-2">
        {/* More actions */}
        <button className="rounded-md border border-gray-300 bg-white p-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default EmailToolbar;
