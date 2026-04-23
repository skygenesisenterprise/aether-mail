import { create } from "zustand";

interface Config {
  selected: string | null;
}

const useContactsStore = create<
  Config & { setState: (newState: Partial<Config>) => void }
>((set) => ({
  selected: null,
  setState: (newState) => set((state) => ({ ...state, ...newState })),
}));

export function useContacts(): [Config, (newState: Partial<Config>) => void] {
  const selected = useContactsStore((state) => state.selected);
  const setState = useContactsStore((state) => state.setState);
  return [{ selected }, setState];
}