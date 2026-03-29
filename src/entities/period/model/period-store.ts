import { create } from 'zustand';
import type { Period } from './types';

type PeriodState = {
  activePeriod: Period | null;
  archivedPeriods: Period[];
  setActivePeriod: (period: Period | null) => void;
  setArchivedPeriods: (periods: Period[]) => void;
  clear: () => void;
};

export const usePeriodStore = create<PeriodState>((set) => ({
  activePeriod: null,
  archivedPeriods: [],
  setActivePeriod: (activePeriod) => set({ activePeriod }),
  setArchivedPeriods: (archivedPeriods) => set({ archivedPeriods }),
  clear: () => set({ activePeriod: null, archivedPeriods: [] }),
}));
