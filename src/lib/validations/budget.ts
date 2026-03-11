import { z } from "zod"

export const createBudgetPlanSchema = z.object({
  category: z.string().min(1, "Category is required"),
  plannedCost: z.number().min(0, "Planned cost must be non-negative"),
})

export const updateBudgetPlanSchema = z.object({
  plannedCost: z.number().min(0, "Planned cost must be non-negative"),
})

export type CreateBudgetPlanInput = z.infer<typeof createBudgetPlanSchema>
export type UpdateBudgetPlanInput = z.infer<typeof updateBudgetPlanSchema>
