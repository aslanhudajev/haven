import { create } from 'zustand';
import type { Category } from './types';

type CategoryStoreState = {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  clear: () => void;
};

export const useCategoryStore = create<CategoryStoreState>((set) => ({
  categories: [],
  setCategories: (categories) => set({ categories }),
  clear: () => set({ categories: [] }),
}));
