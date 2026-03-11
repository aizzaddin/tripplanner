import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { computeActualCosts } from "@/lib/business/budget"
import BudgetView from "@/components/budget-view"
import type { BudgetPlanWithActual } from "@/types/api"

interface BudgetPageProps {
  params: Promise<{ id: string }>
}

export default async function BudgetPage({ params }: BudgetPageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const { id } = await params

  const trip = await prisma.trip.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!trip) {
    redirect("/dashboard")
  }

  const [budgetPlans, expenses] = await Promise.all([
    prisma.budgetPlan.findMany({
      where: { tripId: id },
      orderBy: { category: "asc" },
    }),
    prisma.expense.findMany({
      where: { tripId: id },
      select: { category: true, qty: true, unitCost: true },
    }),
  ])

  const actualCosts = computeActualCosts(expenses)
  const plannedCategories = new Set(budgetPlans.map((p) => p.category))

  const budgetWithActual: BudgetPlanWithActual[] = [
    ...budgetPlans.map((plan) => {
      const actualCost = actualCosts[plan.category] ?? 0
      return {
        id: plan.id,
        category: plan.category,
        plannedCost: plan.plannedCost,
        actualCost,
        difference: plan.plannedCost - actualCost,
      }
    }),
    ...Object.entries(actualCosts)
      .filter(([category]) => !plannedCategories.has(category))
      .map(([category, actualCost]) => ({
        id: null,
        category,
        plannedCost: 0,
        actualCost,
        difference: -actualCost,
      })),
  ].sort((a, b) => a.category.localeCompare(b.category))

  return (
    <BudgetView
      tripId={id}
      currency={trip!.currency}
      initialBudget={budgetWithActual}
    />
  )
}
