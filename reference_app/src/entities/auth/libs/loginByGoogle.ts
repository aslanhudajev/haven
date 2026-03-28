import {GoogleSignin} from '@react-native-google-signin/google-signin'
import {supabase} from '@shared/config/supabase'
import {Env} from '@shared/lib/env'

if (__DEV__ && !Env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID && !Env.EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME) {
  console.warn('[Google Sign-In]: ⚠️ Disabled — missing iOS Client ID or URL Scheme in .env file.')
}

export const loginByGoogle = async (): Promise<void> => {
  try {
    await GoogleSignin.hasPlayServices()
    GoogleSignin.configure({
      webClientId: Env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: Env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    })

    const response = await GoogleSignin.signIn()
    if (response.type === 'success') {
      const userInfo = response.data

      if (userInfo.idToken) {
        const {error} = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.idToken,
        })

        if (error) throw new Error(error.message)
      } else {
        throw new Error('no ID token present!')
      }
    } else {
      // sign in was cancelled by user
      console.log('sign in was cancelled by user')
    }
  } catch (error) {
    alert((error as Error).message)
  }
}
