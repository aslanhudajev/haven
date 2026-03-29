import { create } from 'zustand';

type LedgerTabBadgeState = {
  unsettledArchivedCount: number;
  setUnsettledArchivedCount: (n: number) => void;
  clear: () => void;
};

export const useLedgerTabBadgeStore = create<LedgerTabBadgeState>((set) => ({
  unsettledArchivedCount: 0,
  setUnsettledArchivedCount: (unsettledArchivedCount) => set({ unsettledArchivedCount }),
  clear: () => set({ unsettledArchivedCount: 0 }),
}));
