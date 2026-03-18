import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { computeActualCosts } from "@/lib/business/budget"
import BudgetView from "@/components/budget-view"
import type { BudgetPlanWithActual } from "@/types/api"
import { EXPENSE_CATEGORIES } from "@/lib/constants"

interface BudgetPageProps {
  params: Promise<{ id: string }>
}

export default async function BudgetPage({ params }: BudgetPageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params

  const trip = await prisma.trip.findFirst({
    where: { id, OR: [{ userId: session.user.id }, { collaborators: { some: { userId: session.user.id } } }] },
    select: { id: true, currency: true, categories: true },
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

  const tripCategories =
    Array.isArray(trip!.categories) && (trip!.categories as string[]).length > 0
      ? (trip!.categories as string[])
      : EXPENSE_CATEGORIES

  return (
    <BudgetView
      tripId={id}
      currency={trip!.currency}
      initialBudget={budgetWithActual}
      categories={tripCategories}
    />
  )
}
