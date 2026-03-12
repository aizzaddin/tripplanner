import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const passwordRules = [
  { id: "length",    label: "At least 8 characters",       test: (p: string) => p.length >= 8 },
  { id: "uppercase", label: "At least one uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "At least one lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "number",    label: "At least one number",           test: (p: string) => /[0-9]/.test(p) },
  { id: "special",   label: "At least one special character",test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(64, "Name is too long"),
    email: z.string().email("Invalid email address").max(254, "Email is too long"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must include an uppercase letter")
      .regex(/[a-z]/, "Must include a lowercase letter")
      .regex(/[0-9]/, "Must include a number")
      .regex(/[^A-Za-z0-9]/, "Must include a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
