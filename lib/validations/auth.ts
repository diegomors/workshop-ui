import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("email_invalid"),
  password: z.string().min(1, "password_required"),
})

export const signUpSchema = z.object({
  name: z.string().min(2, "name_required"),
  email: z.string().email("email_invalid"),
  phone: z.string().optional(),
  password: z.string().min(6, "password_weak"),
})

export const resetPasswordSchema = z.object({
  email: z.string().email("email_invalid"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
