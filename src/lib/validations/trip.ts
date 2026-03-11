import { z } from "zod"

export const createTripSchema = z
  .object({
    name: z.string().min(1, "Trip name is required"),
    currency: z.string().default("IDR"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      return end >= start
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  )

export const updateTripSchema = z
  .object({
    name: z.string().min(1, "Trip name is required").optional(),
    currency: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        return end >= start
      }
      return true
    },
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  )

export type CreateTripInput = z.infer<typeof createTripSchema>
export type UpdateTripInput = z.infer<typeof updateTripSchema>
