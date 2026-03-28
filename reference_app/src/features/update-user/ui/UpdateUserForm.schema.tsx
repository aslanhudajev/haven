import {z} from 'zod'

export const updateUserFormSchema = z.object({
  photoURL: z.string().nullable(),
  name: z.string(),
  email: z.string().email(),
})

type UpdateUserFormData = z.infer<typeof updateUserFormSchema>

export type {UpdateUserFormData}
