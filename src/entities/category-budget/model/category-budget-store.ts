import { create } from 'zustand';
import type { CategoryBudget } from './types';

type State = {
  budgets: CategoryBudget[];
  setBudgets: (budgets: CategoryBudget[]) => void;
  clear: () => void;
};

export const useCategoryBudgetStore = create<State>((set) => ({
  budgets: [],
  setBudgets: (budgets) => set({ budgets }),
  clear: () => set({ budgets: [] }),
}));
