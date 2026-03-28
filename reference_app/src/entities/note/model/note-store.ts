import {LayoutAnimation} from 'react-native'
import {create} from 'zustand'
import {createJSONStorage, persist} from 'zustand/middleware'
import {firebaseAnalytics} from '@shared/config/firebase'
import {supabase} from '@shared/config/supabase'
import {zustandStorage} from '@shared/storage/zustand-storage'
// eslint-disable-next-line import/no-restricted-paths
import {useUserStore} from '../../user'
import {removeNoteImage} from '../libs/removeNoteImage'
import {uploadNoteImage} from '../libs/uploadNoteImage'
import type {CreateNote, Note, NoteID, UpdateNote} from './models'

interface NotesStoreState {
  notesLoaded: boolean
  notes: Note[]
  setNotes: (notes: Note[]) => Promise<void>
  getNote: (id: NoteID) => Note | undefined
  fetchNotes: (options?: {
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) => Promise<void>
  createNote: (note: CreateNote, localUri?: string) => Promise<void>
  updateNote: (id: NoteID, note: UpdateNote, localUri?: string) => Promise<void>
  deleteNote: (id: NoteID) => Promise<void>
  reset: () => Promise<void>
}

export const useNotesStore = create<NotesStoreState>()(
  persist(
    (set, get) => ({
      notesLoaded: false,
      notes: [],
      setNotes: async (notes) => {
        set({notes})
      },
      getNote(id) {
        return get().notes.find((note) => note.id === id)
      },
      fetchNotes: async (options?: {
        startDate?: string
        endDate?: string
        page?: number
        limit?: number
      }) => {
        const {startDate, endDate, page = 0, limit = PAGE_SIZE} = options || {}
        const userId = useUserStore.getState().userId

        if (!userId) throw new Error('User ID not found')

        let query = supabase
          .from('notes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', {ascending: false})

        if (startDate && endDate) {
          const start = new Date(startDate)
          start.setUTCHours(0, 0, 0, 0)

          const end = new Date(endDate)
          end.setUTCHours(23, 59, 59, 999)

          query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString())
        }

        // Pagination
        const from = page * limit
        const to = from + limit - 1
        query = query.range(from, to)

        const {data, error} = await query

        if (error) throw new Error(error.message)

        if (data) {
          set((state) => ({
            notes: page === 0 ? data : [...state.notes, ...data],
            notesLoaded: true,
          }))
        }
      },
      createNote: async (newNote, localUri) => {
        const userId = useUserStore.getState().userId

        if (!userId) throw new Error('User ID not found')

        if (localUri && newNote.image_path) {
          await uploadNoteImage(localUri, newNote.image_path)
        }

        const {data, error} = await supabase
          .from('notes')
          .insert({...newNote, user_id: userId})
          .select()
          .single()

        if (error) throw new Error(error.message)

        if (data) {
          set((state) => ({
            notes: [data, ...state.notes],
          }))
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

          await firebaseAnalytics?.logEvent('note_created', {
            note_id: data.id,
            note_date: data.created_at,
          })
        }
      },
      updateNote: async (id, updatedData, localUri) => {
        if (localUri && updatedData.image_path) {
          await uploadNoteImage(localUri, updatedData.image_path)
        }

        const {data, error} = await supabase
          .from('notes')
          .update(updatedData)
          .eq('id', id)
          .select()
          .single()

        if (error) throw new Error(error.message)

        if (data) {
          set((state) => ({
            notes: state.notes.map((note) => (note.id === id ? data : note)),
          }))
          await firebaseAnalytics?.logEvent('note_updated', {
            note_id: id,
            note_date: Date.now(),
          })
        }
      },
      deleteNote: async (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        const {error} = await supabase.from('notes').delete().eq('id', id)

        if (error) throw new Error(error.message)

        const note = get().getNote(id)
        if (note && note.image_path) {
          await removeNoteImage(note.image_path)
        }

        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }))
        await firebaseAnalytics?.logEvent('note_deleted', {note_id: id})
      },
      reset: async () => {
        set({notes: [], notesLoaded: false})
      },
    }),
    {
      name: 'notes-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
)

const PAGE_SIZE = 20
