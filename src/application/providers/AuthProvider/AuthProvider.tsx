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
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserSupabase | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => {
        setUser(session?.user ?? null);
        setLoading(false);
      }, 0);
    });

    return () => {
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
    <AuthContext.Provider value={{ user, loading }}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        {children}
      </View>
    </AuthContext.Provider>
  );
}
