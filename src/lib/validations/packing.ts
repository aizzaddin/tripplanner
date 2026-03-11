import { z } from "zod"

export const createPackingItemSchema = z.object({
  item: z.string().min(1, "Item name is required"),
  qty: z.number().int().min(1).default(1),
  assignedToId: z.string().optional(),
})

export const updatePackingItemSchema = z.object({
  item: z.string().min(1, "Item name is required"),
  qty: z.number().int().min(1).default(1),
  assignedToId: z.string().optional(),
  isDone: z.boolean().optional(),
})

export type CreatePackingItemInput = z.infer<typeof createPackingItemSchema>
export type UpdatePackingItemInput = z.infer<typeof updatePackingItemSchema>
