import { computeTotal } from "./expense"

export function computeActualCosts(
  expenses: Array<{ category: string; qty: number | null; unitCost: number }>
): Record<string, number> {
  const result: Record<string, number> = {}

  for (const expense of expenses) {
    const total = computeTotal(expense.qty, expense.unitCost)
    if (result[expense.category] === undefined) {
      result[expense.category] = 0
    }
    result[expense.category] += total
  }

  return result
}
