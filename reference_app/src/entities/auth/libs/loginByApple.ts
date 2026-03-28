import * as AppleAuthentication from 'expo-apple-authentication'
import {supabase} from '@shared/config/supabase'

export const loginByApple = async (): Promise<void> => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    })

    if (credential.identityToken) {
      const {error} = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      })

      if (error) {
        throw new Error(error.message)
      }
    } else {
      throw new Error('No identityToken.')
    }
  } catch (e) {
    if ((e as Error & {code?: string}).code !== 'ERR_REQUEST_CANCELED') {
      alert((e as Error).message)
    }
  }
}
