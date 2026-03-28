import {supabase} from '@shared/config/supabase'

export async function getUser(userId: string) {
  try {
    const {data, error} = await supabase
      .from('profiles')
      .select()
      .eq('id', userId)
      .single()
      .throwOnError()

    if (error) throw error

    return data
  } catch (error) {
    console.error('🔴 Error fetching user:', error)
    return null
  }
}
