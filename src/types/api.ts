import type { BalanceEntry, Settlement } from "@/lib/business/expense"
import type { TodoStats } from "@/lib/business/todo"

export type { BalanceEntry, Settlement }

export interface MemberData {
  id: string
  name: string
  category: string
  color: string
}

export interface TripSummary {
  id: string
  name: string
  currency: string
  startDate: string
  endDate: string
  membersCount: number
  createdAt: string
}

export interface TripDetail extends TripSummary {
  members: MemberData[]
}

export interface ExpenseWithRelations {
  id: string
  date: string
  category: string
  description: string
  qty: number | null
  unitCost: number
  paymentMethod: string
  paymentStatus: string
  createdAt: string
  updatedAt: string
  tripId: string
  paidById: string
  paidBy: MemberData
  splitWith: MemberData[]
}

export interface DashboardData {
  totalExpenses: number
  balances: BalanceEntry[]
  settlements: Settlement[]
  taskStats: TodoStats
}

export interface BudgetPlanWithActual {
  id: string | null   // null = no plan set, expense-only row
  category: string
  plannedCost: number
  actualCost: number
  difference: number
}
