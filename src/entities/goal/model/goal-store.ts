import { create } from 'zustand';
import type { Goal } from './types';

type State = {
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  clear: () => void;
};

export const useGoalStore = create<State>((set) => ({
  goals: [],
  setGoals: (goals) => set({ goals }),
  clear: () => set({ goals: [] }),
}));
