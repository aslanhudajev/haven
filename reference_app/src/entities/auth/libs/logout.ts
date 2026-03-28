import {GoogleSignin} from '@react-native-google-signin/google-signin'
import {Platform} from 'react-native'
import {supabase} from '@shared/config/supabase'

export const logout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut()
    if (Platform.OS === 'android') {
      GoogleSignin.configure({})
    }
    await GoogleSignin.signOut()
  } catch (e) {
    console.log('logout', e)
  }
}
