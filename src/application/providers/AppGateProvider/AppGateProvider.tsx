import { useRootNavigationState, useSegments, Redirect } from 'expo-router';
import { createContext, useContext } from 'react';
import { useAuth } from '../AuthProvider';
import { useAppGate, type AppGateData, type AppGateTarget } from './useAppGate';
import type { ReactNode } from 'react';

const AppGateContext = createContext<AppGateData | null>(null);

export function useAppGateContext(): AppGateData {
  const ctx = useContext(AppGateContext);
  if (!ctx) throw new Error('useAppGateContext must be used within AppGateProvider');
  return ctx;
}

export function AppGateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const gate = useAppGate(user);

  return (
    <AppGateContext.Provider value={gate}>
      <AppGateRedirect />
      {children}
    </AppGateContext.Provider>
  );
}

const ROUTE_TO_GROUP: Record<Exclude<AppGateTarget, 'invite-pending'>, string> & {
  'invite-pending': string;
} = {
  '/(auth)/welcome': '(auth)',
  '/(auth)/login': '(auth)',
  '/paywall': 'paywall',
  '/(onboarding)/profile': '(onboarding)',
  '/(onboarding)/create-family': '(onboarding)',
  '/(onboarding)/sub-expired': '(onboarding)',
  '/(app)/(tabs)': '(app)',
  'invite-pending': 'invite',
};

function currentPathFromSegments(segments: string[]): string {
  return '/' + segments.join('/');
}

function AppGateRedirect() {
  const { targetRoute, isLoading, pendingInvite } = useAppGateContext();
  /** Spread widens expo-router's tuple-typed segments so index `[1]` is valid under all TS versions. */
  const segments: string[] = [...useSegments()];
  const ready = !!useRootNavigationState()?.key;

  if (!ready || isLoading) return null;

  const currentGroup = segments[0] ?? '';

  if (targetRoute === 'invite-pending') {
    if (pendingInvite) {
      if (currentGroup === 'invite' && segments[1] === pendingInvite) {
        return null;
      }
      return <Redirect href={`/invite/${pendingInvite}`} />;
    }
    return null;
  }

  const targetGroup = ROUTE_TO_GROUP[targetRoute] ?? '';
  const currentPath = currentPathFromSegments(segments);

  if (currentGroup === 'invite') {
    if (targetGroup === 'invite') return null;
    return <Redirect href={targetRoute} />;
  }

  if (currentGroup === targetGroup) {
    if (currentGroup === '(onboarding)' && currentPath !== targetRoute) {
      return <Redirect href={targetRoute} />;
    }
    return null;
  }

  if (currentGroup === '' || currentGroup === 'index') {
    return <Redirect href={targetRoute} />;
  }

  const needsRedirect =
    (currentGroup === '(auth)' && targetGroup !== '(auth)') ||
    (currentGroup === '(app)' && targetGroup !== '(app)') ||
    (currentGroup === '(onboarding)' && targetGroup !== '(onboarding)') ||
    (currentGroup === 'paywall' && targetGroup !== 'paywall');

  if (needsRedirect) {
    return <Redirect href={targetRoute} />;
  }

  return null;
}
