import {supabase} from '@shared/config/supabase'
import type {AuthError} from '@supabase/auth-js'

export async function requestOtp(
  email: string
): Promise<{success: boolean; error?: AuthError | null}> {
  const {error} = await supabase.auth.signInWithOtp({email})
  if (error) {
    console.log('Error verifying OTP:', error.message)
    return {success: false, error}
  }

  return {success: true}
}
