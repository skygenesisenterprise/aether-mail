import { create } from "zustand";
import type { Email } from "../components/email/EmailList";

interface EmailState {
  emails: Email[];
  folders: string[];
  currentFolder: string;
  setEmails: (emails: Email[]) => void;
  addEmail: (email: Email) => void;
  updateEmail: (id: string, updates: Partial<Email>) => void;
  deleteEmail: (id: string) => void;
  setCurrentFolder: (folder: string) => void;
  setFolders: (folders: string[]) => void;
}

export const useEmailStore = create<EmailState>((set) => ({
  emails: [],
  folders: ["Inbox", "Sent", "Drafts", "Trash"],
  currentFolder: "Inbox",
  setEmails: (emails) => set({ emails }),
  addEmail: (email) => set((state) => ({ emails: [...state.emails, email] })),
  updateEmail: (id, updates) =>
    set((state) => ({
      emails: state.emails.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),
  deleteEmail: (id) =>
    set((state) => ({ emails: state.emails.filter((e) => e.id !== id) })),
  setCurrentFolder: (currentFolder) => set({ currentFolder }),
  setFolders: (folders) => set({ folders }),
}));
