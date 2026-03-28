import {z} from 'zod'

export const createNoteFormSchema = z.object({
  title: z.string().max(30).nullable().optional(),
  content: z.string().nonempty().max(280),
  image_path: z.string().nullable().optional(),
})

type CreateNoteFormData = z.infer<typeof createNoteFormSchema>

export type {CreateNoteFormData}
