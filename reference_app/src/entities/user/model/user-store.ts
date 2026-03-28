import {create} from 'zustand'
import {createJSONStorage, persist} from 'zustand/middleware'
import type {User} from '@shared/config/supabase'
import {supabase} from '@shared/config/supabase'
import {zustandStorage} from '@shared/storage/zustand-storage'

interface UserStoreState {
  user: User | null
  userId: string | null
  setUser(user: User): void
  updateUser(id: string, data: {full_name?: string; avatar_url?: string | null}): Promise<void>
  reset(): Promise<void>
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      user: null,
      userId: null,
      setUser(user) {
        set({user, userId: user?.id ?? null})
      },
      async updateUser(id, updateData) {
        const {data, error} = await supabase
          .from('profiles')
          .update({...updateData, updated_at: new Date().toISOString()})
          .eq('id', id)
          .select()
          .single()
        const user = {...get().user, ...updateData} as User

        if (data) {
          get().setUser(user)
        }
        if (error) {
          throw new Error(error.message)
        }
      },
      async reset() {
        set({user: null, userId: null})
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
)
