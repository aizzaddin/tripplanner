import { z } from "zod"

export const updateItineraryDaySchema = z.object({
  mainArea: z.string().optional(),
  accommodation: z.string().optional(),
  activities: z
    .array(
      z.object({
        order: z.number(),
        name: z.string(),
        estimatedTime: z.string().optional(),
      })
    )
    .default([]),
  todos: z
    .array(
      z.object({
        order: z.number(),
        name: z.string(),
        assignedTo: z.string().optional(),
      })
    )
    .default([]),
  notes: z.array(z.string()).default([]),
})

export type UpdateItineraryDayInput = z.infer<typeof updateItineraryDaySchema>
