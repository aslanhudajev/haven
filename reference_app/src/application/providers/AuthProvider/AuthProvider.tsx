import {type Session, type User as UserSupabase} from '@supabase/supabase-js'
import {useSegments, useRootNavigationState, Redirect} from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import {useContext, useState, useEffect, createContext, useCallback} from 'react'
import {AppState, View} from 'react-native'
import {useResetStores} from '@features/reset-store'
import {getUser, useUserStore} from '@entities/user'
import {supabase} from '@shared/config/supabase'
import {clearStorage} from '@shared/storage/clearStorage'
import type {ReactNode} from 'react'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
  if (!supabase) {
    return
  }
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

type AuthProviderProps = {
  children: ReactNode
}

type TAuthProvider = {
  userBySession: UserSupabase | null
  loading: boolean
}

const AuthContext = createContext<TAuthProvider>({
  userBySession: null,
  loading: true,
})

export function useAuth() {
  if (!useContext(AuthContext)) {
    throw new Error('useAuth must be used within a <AuthProvider />')
  }

  return useContext(AuthContext)
}

export function AuthProvider({children}: AuthProviderProps) {
  const [loading, setLoading] = useState(true)
  const [userAuth, setAuth] = useState<UserSupabase | null>(null)
  const {handleResetStore} = useResetStores()

  const setUser = useUserStore((state) => state.setUser)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    // https://supabase.com/docs/reference/javascript/auth-onauthstatechange
    const {data: authListener} = supabase.auth.onAuthStateChange((event, session) => {
      setTimeout(async () => {
        try {
          const user = session?.user
          if (user) {
            await handleUser(user)
            setAuth(user)
          } else {
            console.log('onAuthStateChange log-out')
            await handleResetAuth()
          }
        } catch (error) {
          console.error('Error in handleUser:', error)
          await handleResetAuth()
        } finally {
          setLoading(false)
        }
      }, 0)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  const handleUser = async (userAuth: Session['user']) => {
    const user = await getUser(userAuth.id)
    setUser({...user!, email: userAuth.email ?? String(userAuth.user_metadata.email)})
  }

  const handleResetAuth = async () => {
    setAuth(null)
    await clearStorage()
    await handleResetStore()
  }

  const onLayoutRootView = useCallback(() => {
    // Use a double requestAnimationFrame:
    // 1. The first rAF waits for the current layout/paint cycle to finish.
    // 2. The second rAF ensures the first real UI frame is actually rendered.
    // This prevents a white flash between the splash screen and the app content.
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        await SplashScreen.hideAsync()
      })
    })
  }, [])

  if (loading) {
    return null
  }

  return (
    <AuthContext.Provider value={{userBySession: userAuth, loading}}>
      <AuthRedirect user={userAuth} loading={loading} />
      <View style={{flex: 1}} onLayout={onLayoutRootView}>
        {children}
      </View>
    </AuthContext.Provider>
  )
}

function AuthRedirect({user, loading}: {user: UserSupabase | null; loading: boolean}) {
  const segments = useSegments()
  const ready = !!useRootNavigationState()?.key

  if (!ready || loading) {
    return null
  }

  const group = segments[0] // '(auth)' | '(app)' | '(aux)'
  const inAuth = group === '(auth)'
  const inAux = group === '(aux)'

  if (!user && !(inAuth || inAux)) {
    return <Redirect href="/(auth)/login" />
  }

  if (user && inAuth && !inAux) {
    return <Redirect href="/(app)/(tabs)" />
  }

  return null
}
