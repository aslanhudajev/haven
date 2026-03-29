import { create } from 'zustand';
import type { Family, FamilyMember } from './types';

type FamilyState = {
  family: Family | null;
  members: FamilyMember[];
  setFamily: (family: Family | null) => void;
  setMembers: (members: FamilyMember[]) => void;
  clear: () => void;
};

export const useFamilyStore = create<FamilyState>((set) => ({
  family: null,
  members: [],
  setFamily: (family) => set({ family }),
  setMembers: (members) => set({ members }),
  clear: () => set({ family: null, members: [] }),
}));
