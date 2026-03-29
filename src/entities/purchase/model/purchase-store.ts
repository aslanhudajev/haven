import { create } from 'zustand';
import type { Purchase } from './types';

type PurchaseState = {
  purchases: Purchase[];
  setPurchases: (purchases: Purchase[]) => void;
  addPurchase: (purchase: Purchase) => void;
  removePurchase: (id: string) => void;
  clear: () => void;
};

export const usePurchaseStore = create<PurchaseState>((set) => ({
  purchases: [],
  setPurchases: (purchases) => set({ purchases }),
  addPurchase: (purchase) =>
    set((state) => ({ purchases: [purchase, ...state.purchases] })),
  removePurchase: (id) =>
    set((state) => ({ purchases: state.purchases.filter((p) => p.id !== id) })),
  clear: () => set({ purchases: [] }),
}));
