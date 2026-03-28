import {supabase} from '@shared/config/supabase'

export async function deleteUser(): Promise<void> {
  const {error} = await supabase.functions.invoke('user-self-deletion')

  if (error) {
    console.log('Error deleting user:', error)
    throw new Error(`Error deleting user: ${error}`)
  } else {
    console.log('User account deleted')
  }
}
