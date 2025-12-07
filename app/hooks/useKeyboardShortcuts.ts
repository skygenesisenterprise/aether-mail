import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ShortcutOptions {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
}

interface KeyboardShortcut {
  key: string;
  action: () => void;
  options?: ShortcutOptions;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const { key, action, options = {} } = shortcut;

        // Vérifier si la touche correspond
        if (event.key.toLowerCase() !== key.toLowerCase()) continue;

        // Vérifier les modificateurs
        if (options.ctrlKey && !event.ctrlKey) continue;
        if (options.shiftKey && !event.shiftKey) continue;
        if (options.altKey && !event.altKey) continue;
        if (options.metaKey && !event.metaKey) continue;

        // Empêcher le comportement par défaut si demandé
        if (options.preventDefault !== false) {
          event.preventDefault();
        }

        // Exécuter l'action
        action();
        break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

export function useGlobalShortcuts() {
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = [
    // Navigation principale
    {
      key: "1",
      action: () => router.push("/"),
      options: { ctrlKey: true },
    },
    {
      key: "2",
      action: () => router.push("/calendar"),
      options: { ctrlKey: true },
    },
    {
      key: "3",
      action: () => router.push("/contacts"),
      options: { ctrlKey: true },
    },
    {
      key: "4",
      action: () => router.push("/notes"),
      options: { ctrlKey: true },
    },
    {
      key: "5",
      action: () => router.push("/tasks"),
      options: { ctrlKey: true },
    },
    {
      key: "6",
      action: () => router.push("/drive"),
      options: { ctrlKey: true },
    },
    // Recherche
    {
      key: "k",
      action: () => {
        const searchInput = document.querySelector(
          'input[type="text"]',
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      options: { ctrlKey: true },
    },
    // Zoom
    {
      key: "=",
      action: () => {
        document.body.style.zoom = `${parseFloat(document.body.style.zoom || "1") + 0.1}`;
      },
      options: { ctrlKey: true },
    },
    {
      key: "-",
      action: () => {
        document.body.style.zoom = `${parseFloat(document.body.style.zoom || "1") - 0.1}`;
      },
      options: { ctrlKey: true },
    },
    {
      key: "0",
      action: () => {
        document.body.style.zoom = "1";
      },
      options: { ctrlKey: true },
    },
    // Plein écran
    {
      key: "F11",
      action: () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);
}
