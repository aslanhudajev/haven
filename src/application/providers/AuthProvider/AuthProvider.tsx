import { type User as UserSupabase } from '@supabase/supabase-js';
import * as SplashScreen from 'expo-splash-screen';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, View } from 'react-native';
import { supabase } from '@shared/config/supabase';
import type { ReactNode } from 'react';

AppState.addEventListener('change', (state) => {
  if (!supabase) return;
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

type AuthContextType = {
  user: UserSupabase | null;
  loading: boolean;
  /** Call after email OTP success so React state matches Supabase without waiting onAuthStateChange. */
  refreshSessionUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshSessionUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserSupabase | null>(null);

  const refreshSessionUser = useCallback(async () => {
    if (!supabase) return;
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (__DEV__) {
      console.log('[Haven:auth] refreshSessionUser', {
        hasSession: !!session,
        userId: session?.user?.id ?? null,
        error: error?.message ?? null,
      });
    }
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        if (__DEV__) {
          console.log('[Haven:auth] getSession (initial)', {
            hasSession: !!session,
            userId: session?.user?.id ?? null,
          });
        }
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (__DEV__) {
        console.log('[Haven:auth] onAuthStateChange', {
          event,
          hasSession: !!session,
          userId: session?.user?.id ?? null,
        });
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const onLayoutRootView = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        await SplashScreen.hideAsync();
      });
    });
  }, []);

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, refreshSessionUser }}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        {children}
      </View>
    </AuthContext.Provider>
  );
}
