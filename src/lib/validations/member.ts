import { z } from "zod"

export const createMemberSchema = z.object({
  name: z.string().min(1, "Member name is required"),
  category: z.enum(["ADULT", "CHILD", "BABY"]).default("ADULT"),
  color: z.string().min(1, "Color is required"),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>
