import {z} from 'zod'

export const loginWithEmailFormSchema = z.object({
  email: z.string().email().min(1, {message: 'Input your email address'}),
})

export const verifyEmailFormSchema = z.object({
  code: z.string().min(1, {message: 'Input the verification code'}),
})

type LoginWithEmailFormData = z.infer<typeof loginWithEmailFormSchema>
type VerifyEmailFormData = z.infer<typeof verifyEmailFormSchema>

export type {LoginWithEmailFormData, VerifyEmailFormData}
