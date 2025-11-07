import type React from "react";
import {
  TrashIcon,
  ArchiveBoxIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  StarIcon,
  FolderIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useEmailStore } from "../../store/emailStore";

interface EmailBulkActionsProps {
  selectedCount: number;
}

const EmailBulkActions: React.FC<EmailBulkActionsProps> = ({
  selectedCount,
}) => {
  const {
    selectedEmails,
    clearSelection,
    markAsRead,
    markAsUnread,
    starEmails,
    unstarEmails,
    deleteEmails,
    moveEmails,
    folders,
  } = useEmailStore();

  if (selectedCount === 0) return null;

  const selectedIds = Array.from(selectedEmails);

  const handleMarkAsRead = () => {
    markAsRead(selectedIds);
  };

  const handleMarkAsUnread = () => {
    markAsUnread(selectedIds);
  };

  const handleStar = () => {
    starEmails(selectedIds);
  };

  const handleUnstar = () => {
    unstarEmails(selectedIds);
  };

  const handleDelete = () => {
    if (confirm(`Delete ${selectedCount} email(s)?`)) {
      deleteEmails(selectedIds);
    }
  };

  const handleMoveToFolder = (folder: string) => {
    moveEmails(selectedIds, folder);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-blue-600/10 border-b border-blue-500/20">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">
            {selectedCount} selected
          </span>
          <button
            onClick={clearSelection}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
            aria-label="Clear selection"
          >
            <XMarkIcon className="h-4 w-4 text-tertiary" />
          </button>
        </div>

        <div className="flex items-center gap-1 border-l border-gray-700 pl-4">
          <button
            onClick={handleMarkAsRead}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            title="Mark as read"
          >
            <EnvelopeOpenIcon className="h-4 w-4 text-tertiary" />
          </button>
          <button
            onClick={handleMarkAsUnread}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            title="Mark as unread"
          >
            <EnvelopeIcon className="h-4 w-4 text-tertiary" />
          </button>
          <button
            onClick={handleStar}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            title="Star"
          >
            <StarIcon className="h-4 w-4 text-tertiary" />
          </button>
          <button
            onClick={handleUnstar}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            title="Unstar"
          >
            <StarIconSolid className="h-4 w-4 text-yellow-400" />
          </button>
        </div>

        <div className="flex items-center gap-1 border-l border-gray-700 pl-4">
          <div className="relative group">
            <button
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1"
              title="Move to folder"
            >
              <FolderIcon className="h-4 w-4 text-tertiary" />
              <span className="text-xs text-tertiary">Move</span>
            </button>
            <div className="absolute top-full left-0 mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => handleMoveToFolder(folder)}
                  className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-gray-700 transition-colors"
                >
                  {folder}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-red-400"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailBulkActions;





