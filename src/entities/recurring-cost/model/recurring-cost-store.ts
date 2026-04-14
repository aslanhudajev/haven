import { create } from 'zustand';
import type { RecurringCost } from './types';

type State = {
  costs: RecurringCost[];
  setCosts: (costs: RecurringCost[]) => void;
  clear: () => void;
};

export const useRecurringCostStore = create<State>((set) => ({
  costs: [],
  setCosts: (costs) => set({ costs }),
  clear: () => set({ costs: [] }),
}));
