import { useEffect, useCallback } from "react";
import type { Email } from "../components/email/EmailList";

interface UseKeyboardShortcutsProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (email: Email) => void;
  onDelete?: (email: Email) => void;
  onReply?: (email: Email) => void;
  onForward?: (email: Email) => void;
  onStar?: (email: Email) => void;
  onNewEmail?: () => void;
  onSearch?: () => void;
  onRefresh?: () => void;
}

export const useKeyboardShortcuts = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  onDelete,
  onReply,
  onForward,
  onStar,
  onNewEmail,
  onSearch,
  onRefresh,
}: UseKeyboardShortcutsProps) => {
  const getCurrentEmailIndex = useCallback(() => {
    if (!selectedEmailId) return -1;
    return emails.findIndex((email) => email.id === selectedEmailId);
  }, [emails, selectedEmailId]);

  const selectNextEmail = useCallback(() => {
    const currentIndex = getCurrentEmailIndex();
    if (currentIndex < emails.length - 1) {
      onSelectEmail(emails[currentIndex + 1]);
    }
  }, [getCurrentEmailIndex, emails, onSelectEmail]);

  const selectPreviousEmail = useCallback(() => {
    const currentIndex = getCurrentEmailIndex();
    if (currentIndex > 0) {
      onSelectEmail(emails[currentIndex - 1]);
    }
  }, [getCurrentEmailIndex, emails, onSelectEmail]);

  const selectFirstEmail = useCallback(() => {
    if (emails.length > 0) {
      onSelectEmail(emails[0]);
    }
  }, [emails, onSelectEmail]);

  const selectLastEmail = useCallback(() => {
    if (emails.length > 0) {
      onSelectEmail(emails[emails.length - 1]);
    }
  }, [emails, onSelectEmail]);

  const deleteCurrentEmail = useCallback(() => {
    const currentIndex = getCurrentEmailIndex();
    if (currentIndex >= 0 && onDelete) {
      onDelete(emails[currentIndex]);
    }
  }, [getCurrentEmailIndex, emails, onDelete]);

  const replyToCurrentEmail = useCallback(() => {
    const currentIndex = getCurrentEmailIndex();
    if (currentIndex >= 0 && onReply) {
      onReply(emails[currentIndex]);
    }
  }, [getCurrentEmailIndex, emails, onReply]);

  const forwardCurrentEmail = useCallback(() => {
    const currentIndex = getCurrentEmailIndex();
    if (currentIndex >= 0 && onForward) {
      onForward(emails[currentIndex]);
    }
  }, [getCurrentEmailIndex, emails, onForward]);

  const toggleStarCurrentEmail = useCallback(() => {
    const currentIndex = getCurrentEmailIndex();
    if (currentIndex >= 0 && onStar) {
      onStar(emails[currentIndex]);
    }
  }, [getCurrentEmailIndex, emails, onStar]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        return;
      }

      // Prevent default for our shortcuts
      let handled = false;

      switch (event.key) {
        // Navigation
        case "ArrowDown":
          if (event.ctrlKey || event.metaKey) {
            selectNextEmail();
            handled = true;
          }
          break;
        case "ArrowUp":
          if (event.ctrlKey || event.metaKey) {
            selectPreviousEmail();
            handled = true;
          }
          break;
        case "Home":
          if (event.ctrlKey || event.metaKey) {
            selectFirstEmail();
            handled = true;
          }
          break;
        case "End":
          if (event.ctrlKey || event.metaKey) {
            selectLastEmail();
            handled = true;
          }
          break;

        // Email actions
        case "Delete":
          deleteCurrentEmail();
          handled = true;
          break;
        case "r":
          if (!event.ctrlKey && !event.metaKey) {
            replyToCurrentEmail();
            handled = true;
          }
          break;
        case "f":
          if (!event.ctrlKey && !event.metaKey) {
            forwardCurrentEmail();
            handled = true;
          }
          break;
        case "s":
          if (!event.ctrlKey && !event.metaKey) {
            toggleStarCurrentEmail();
            handled = true;
          }
          break;

        // Global actions
        case "n":
          if (!event.ctrlKey && !event.metaKey) {
            onNewEmail?.();
            handled = true;
          }
          break;
        case "/":
          if (!event.ctrlKey && !event.metaKey) {
            onSearch?.();
            handled = true;
          }
          break;
        case "F5":
          onRefresh?.();
          handled = true;
          break;

        // Outlook-style shortcuts
        case "Enter":
          if (event.ctrlKey || event.metaKey) {
            replyToCurrentEmail();
            handled = true;
          }
          break;
        case "e":
          if (event.ctrlKey || event.metaKey) {
            onNewEmail?.();
            handled = true;
          }
          break;
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectNextEmail,
    selectPreviousEmail,
    selectFirstEmail,
    selectLastEmail,
    deleteCurrentEmail,
    replyToCurrentEmail,
    forwardCurrentEmail,
    toggleStarCurrentEmail,
    onNewEmail,
    onSearch,
    onRefresh,
  ]);
};
