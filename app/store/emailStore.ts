import { create } from "zustand";
import type { Email } from "../components/email/EmailList";

export type SortField = "date" | "from" | "subject" | "size";
export type SortOrder = "asc" | "desc";
export type FilterType = "all" | "unread" | "read" | "starred" | "attachments";

interface EmailState {
  emails: Email[];
  folders: string[];
  currentFolder: string;
  selectedEmails: Set<string>;
  sortField: SortField;
  sortOrder: SortOrder;
  filter: FilterType;
  searchQuery: string;
  labels: string[];
  
  // Basic actions
  setEmails: (emails: Email[]) => void;
  addEmail: (email: Email) => void;
  updateEmail: (id: string, updates: Partial<Email>) => void;
  deleteEmail: (id: string) => void;
  deleteEmails: (ids: string[]) => void;
  setCurrentFolder: (folder: string) => void;
  setFolders: (folders: string[]) => void;
  
  // Selection
  toggleEmailSelection: (id: string) => void;
  selectAllEmails: () => void;
  clearSelection: () => void;
  isEmailSelected: (id: string) => boolean;
  
  // Sorting
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;
  toggleSort: (field: SortField) => void;
  
  // Filtering
  setFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  
  // Labels
  addLabel: (label: string) => void;
  removeLabel: (label: string) => void;
  addLabelToEmail: (emailId: string, label: string) => void;
  removeLabelFromEmail: (emailId: string, label: string) => void;
  
  // Bulk actions
  markAsRead: (ids: string[]) => void;
  markAsUnread: (ids: string[]) => void;
  starEmails: (ids: string[]) => void;
  unstarEmails: (ids: string[]) => void;
  moveEmails: (ids: string[], folder: string) => void;
  
  // Computed
  getFilteredAndSortedEmails: () => Email[];
}

export const useEmailStore = create<EmailState>((set, get) => ({
  emails: [],
  folders: ["Inbox", "Sent", "Drafts", "Trash"],
  currentFolder: "Inbox",
  selectedEmails: new Set<string>(),
  sortField: "date",
  sortOrder: "desc",
  filter: "all",
  searchQuery: "",
  labels: [],
  
  // Basic actions
  setEmails: (emails) => set({ emails }),
  addEmail: (email) => set((state) => ({ emails: [...state.emails, email] })),
  updateEmail: (id, updates) =>
    set((state) => ({
      emails: state.emails.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),
  deleteEmail: (id) =>
    set((state) => ({ 
      emails: state.emails.filter((e) => e.id !== id),
      selectedEmails: new Set([...state.selectedEmails].filter((selectedId) => selectedId !== id)),
    })),
  deleteEmails: (ids) =>
    set((state) => ({
      emails: state.emails.filter((e) => !ids.includes(e.id)),
      selectedEmails: new Set([...state.selectedEmails].filter((id) => !ids.includes(id))),
    })),
  setCurrentFolder: (currentFolder) => set({ currentFolder, selectedEmails: new Set() }),
  setFolders: (folders) => set({ folders }),
  
  // Selection
  toggleEmailSelection: (id) =>
    set((state) => {
      const newSelected = new Set(state.selectedEmails);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return { selectedEmails: newSelected };
    }),
  selectAllEmails: () =>
    set((state) => {
      const filtered = get().getFilteredAndSortedEmails();
      return { selectedEmails: new Set(filtered.map((e) => e.id)) };
    }),
  clearSelection: () => set({ selectedEmails: new Set() }),
  isEmailSelected: (id) => get().selectedEmails.has(id),
  
  // Sorting
  setSortField: (field) => set({ sortField: field }),
  setSortOrder: (order) => set({ sortOrder: order }),
  toggleSort: (field) =>
    set((state) => ({
      sortField: field,
      sortOrder: state.sortField === field && state.sortOrder === "desc" ? "asc" : "desc",
    })),
  
  // Filtering
  setFilter: (filter) => set({ filter, selectedEmails: new Set() }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // Labels
  addLabel: (label) =>
    set((state) => ({
      labels: state.labels.includes(label) ? state.labels : [...state.labels, label],
    })),
  removeLabel: (label) =>
    set((state) => ({
      labels: state.labels.filter((l) => l !== label),
    })),
  addLabelToEmail: (emailId, label) =>
    set((state) => ({
      emails: state.emails.map((e) =>
        e.id === emailId
          ? { ...e, labels: [...(e.labels || []), label] }
          : e
      ),
    })),
  removeLabelFromEmail: (emailId, label) =>
    set((state) => ({
      emails: state.emails.map((e) =>
        e.id === emailId
          ? { ...e, labels: (e.labels || []).filter((l) => l !== label) }
          : e
      ),
    })),
  
  // Bulk actions
  markAsRead: (ids) =>
    set((state) => ({
      emails: state.emails.map((e) =>
        ids.includes(e.id) ? { ...e, isRead: true } : e
      ),
      selectedEmails: new Set(),
    })),
  markAsUnread: (ids) =>
    set((state) => ({
      emails: state.emails.map((e) =>
        ids.includes(e.id) ? { ...e, isRead: false } : e
      ),
      selectedEmails: new Set(),
    })),
  starEmails: (ids) =>
    set((state) => ({
      emails: state.emails.map((e) =>
        ids.includes(e.id) ? { ...e, isStarred: true } : e
      ),
    })),
  unstarEmails: (ids) =>
    set((state) => ({
      emails: state.emails.map((e) =>
        ids.includes(e.id) ? { ...e, isStarred: false } : e
      ),
    })),
  moveEmails: (ids, folder) =>
    set((state) => ({
      emails: state.emails.filter((e) => !ids.includes(e.id)),
      selectedEmails: new Set(),
    })),
  
  // Computed - filtered and sorted emails
  getFilteredAndSortedEmails: () => {
    const state = get();
    let filtered = [...state.emails];
    
    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (email) =>
          email.subject.toLowerCase().includes(query) ||
          email.from.name.toLowerCase().includes(query) ||
          email.from.email.toLowerCase().includes(query) ||
          email.body.toLowerCase().includes(query) ||
          email.to?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    switch (state.filter) {
      case "unread":
        filtered = filtered.filter((e) => !e.isRead);
        break;
      case "read":
        filtered = filtered.filter((e) => e.isRead);
        break;
      case "starred":
        filtered = filtered.filter((e) => e.isStarred);
        break;
      case "attachments":
        filtered = filtered.filter((e) => e.hasAttachments);
        break;
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (state.sortField) {
        case "date":
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
          break;
        case "from":
          aValue = a.from.name.toLowerCase();
          bValue = b.from.name.toLowerCase();
          break;
        case "subject":
          aValue = a.subject.toLowerCase();
          bValue = b.subject.toLowerCase();
          break;
        case "size":
          // Estimate size from body length
          aValue = a.body.length;
          bValue = b.body.length;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return state.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return state.sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    
    return filtered;
  },
}));
