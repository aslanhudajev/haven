import {supabase} from '@shared/config/supabase'

export const loginByEmail = async ({email, code}: {email: string; code: string}): Promise<void> => {
  try {
    const {error} = await handleLogin({
      email: email,
      code: code,
    })

    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    alert((error as Error).message)
  }
}

// PARTS

async function handleLogin({email, code}: TProps) {
  try {
    const {data, error} = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    return {data, error}
  } catch (e) {
    throw new Error(`Login error: ${e}`)
  }
}

// TYPES

type TProps = {
  email: string
  code: string
}
