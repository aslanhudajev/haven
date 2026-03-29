import { create } from 'zustand';

type SubscriptionState = {
  isSubscribed: boolean;
  isLoading: boolean;
  setSubscribed: (value: boolean) => void;
  setLoading: (value: boolean) => void;
};

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isSubscribed: false,
  isLoading: true,
  setSubscribed: (isSubscribed) => set({ isSubscribed }),
  setLoading: (isLoading) => set({ isLoading }),
}));
