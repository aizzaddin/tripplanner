import { z } from "zod"

export const createTodoSchema = z.object({
  task: z.string().min(1, "Task is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
})

export const updateTodoSchema = z.object({
  task: z.string().min(1, "Task is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
  isDone: z.boolean().optional(),
})

export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>
