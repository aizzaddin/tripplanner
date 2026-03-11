import { z } from "zod"

export const createExpenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  qty: z.number().optional(),
  unitCost: z.number().min(0, "Unit cost must be non-negative"),
  paidById: z.string().min(1, "Paid by is required"),
  paymentMethod: z.enum(["CASH", "DEBIT", "CREDIT", "TRANSFER", "QRIS"]),
  paymentStatus: z.enum(["SPLIT_EQUAL", "PERSONAL"]),
  splitWith: z.array(z.string()).default([]),
})

export const updateExpenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  qty: z.number().optional(),
  unitCost: z.number().min(0, "Unit cost must be non-negative"),
  paidById: z.string().min(1, "Paid by is required"),
  paymentMethod: z.enum(["CASH", "DEBIT", "CREDIT", "TRANSFER", "QRIS"]),
  paymentStatus: z.enum(["SPLIT_EQUAL", "PERSONAL"]),
  splitWith: z.array(z.string()).default([]),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
