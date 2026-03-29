import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getIsOnboarded,
  setIsOnboarded as persistOnboarded,
  getSubOverride,
  setSubOverride,
} from '@/lib/storage';
import { initRevenueCat, useSubscriptionStatus } from '@/lib/purchases';

type AppContextType = {
  isLoading: boolean;
  isOnboarded: boolean;
  isSubscribed: boolean;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
};

const AppContext = createContext<AppContextType>({
  isLoading: true,
  isOnboarded: false,
  isSubscribed: false,
  completeOnboarding: async () => {},
  resetOnboarding: async () => {},
  refreshSubscription: async () => {},
});

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);
  const [subOverrideActive, setSubOverrideActive] = useState(false);
  const { isSubscribed: subStatus, refresh } = useSubscriptionStatus();

  useEffect(() => {
    initRevenueCat();
  }, []);

  useEffect(() => {
    Promise.all([getIsOnboarded(), getSubOverride()]).then(
      ([onboarded, override]) => {
        setIsOnboarded(onboarded);
        setSubOverrideActive(override);
        setOnboardingLoaded(true);
      },
    );
  }, []);

  const isLoading = !onboardingLoaded || subStatus === null;

  const completeOnboarding = async () => {
    await persistOnboarded(true);
    setIsOnboarded(true);
  };

  const resetOnboarding = async () => {
    await Promise.all([persistOnboarded(false), setSubOverride(true)]);
    setIsOnboarded(false);
    setSubOverrideActive(true);
  };

  const refreshSubscription = async () => {
    await refresh();
    if (subOverrideActive) {
      await setSubOverride(false);
      setSubOverrideActive(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isLoading,
        isOnboarded,
        isSubscribed: (subStatus ?? false) && !subOverrideActive,
        completeOnboarding,
        resetOnboarding,
        refreshSubscription,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
