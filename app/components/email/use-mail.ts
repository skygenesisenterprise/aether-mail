import { create } from "zustand";

interface MailItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  text: string;
  html?: string;
  date: string;
  read: boolean;
  starred?: boolean;
  labels: string[];
  folderId?: string;
}

interface Config {
  selected: MailItem["id"] | null;
}

const useMailStore = create<
  Config & { setState: (newState: Partial<Config>) => void }
>((set) => ({
  selected: null,
  setState: (newState) => set((state) => ({ ...state, ...newState })),
}));

export function useMail(): [Config, (newState: Partial<Config>) => void] {
  const selected = useMailStore((state) => state.selected);
  const setState = useMailStore((state) => state.setState);
  return [{ selected }, setState];
}
