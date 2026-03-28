import type {TDateISO} from '@shared/lib/dates'

export type NoteID = string

export type CreateNote = {
  title?: string | null
  content: string
  image_path?: string | null
  groupDatetime?: string
}

export type UpdateNote = Partial<CreateNote>

export type Note = CreateNote & {
  id: NoteID
  user_id: string
  created_at: string
  updated_at?: string | null
}

export type Notes = Record<NoteID, Note>

export interface NotesFilters {
  fromDateTimeRange?: TDateISO
  toDateTimeRange?: TDateISO
}
