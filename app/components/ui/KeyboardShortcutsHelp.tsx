import type React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: "Navigation",
      keys: ["Ctrl ↓", "Cmd ↓"],
      description: "Select next email",
    },
    {
      category: "Navigation",
      keys: ["Ctrl ↑", "Cmd ↑"],
      description: "Select previous email",
    },
    {
      category: "Navigation",
      keys: ["Ctrl Home", "Cmd Home"],
      description: "Select first email",
    },
    {
      category: "Navigation",
      keys: ["Ctrl End", "Cmd End"],
      description: "Select last email",
    },
    {
      category: "Email Actions",
      keys: ["Delete"],
      description: "Delete selected email",
    },
    {
      category: "Email Actions",
      keys: ["R"],
      description: "Reply to selected email",
    },
    {
      category: "Email Actions",
      keys: ["F"],
      description: "Forward selected email",
    },
    {
      category: "Email Actions",
      keys: ["S"],
      description: "Toggle star on selected email",
    },
    {
      category: "Email Actions",
      keys: ["Ctrl Enter", "Cmd Enter"],
      description: "Reply to selected email",
    },
    {
      category: "Global Actions",
      keys: ["N"],
      description: "Compose new email",
    },
    {
      category: "Global Actions",
      keys: ["/"],
      description: "Focus search box",
    },
    { category: "Global Actions", keys: ["F5"], description: "Refresh emails" },
    {
      category: "Global Actions",
      keys: ["Ctrl E", "Cmd E"],
      description: "Compose new email",
    },
  ];

  const categories = [...new Set(shortcuts.map((s) => s.category))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-proton-dark rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-proton-border">
          <h2 className="text-xl font-semibold text-proton-text">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-proton-text-secondary hover:bg-proton-dark-tertiary transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {categories.map((category) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-semibold text-proton-text mb-3 uppercase tracking-wider">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((shortcut) => shortcut.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm text-proton-text-secondary">
                        {shortcut.description}
                      </span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <div
                            key={keyIndex}
                            className="flex items-center gap-1"
                          >
                            {key.split(" ").map((part, partIndex) => (
                              <span
                                key={partIndex}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-proton-text bg-proton-dark-tertiary border border-proton-border rounded"
                              >
                                {part}
                              </span>
                            ))}
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-xs text-proton-text-muted mx-1">
                                or
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-proton-border bg-gray-50 dark:bg-proton-dark">
          <p className="text-xs text-proton-text-muted text-center">
            These shortcuts are inspired by Microsoft Outlook for a familiar
            experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
