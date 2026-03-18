import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripAccess } from "@/lib/api-helpers"
import { createBudgetPlanSchema } from "@/lib/validations/budget"
import { computeActualCosts } from "@/lib/business/budget"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id } = await params

  const { trip, error: tripError } = await requireTripAccess(id, user!.id)
  if (tripError) return tripError

  try {
    const [budgetPlans, expenses] = await Promise.all([
      prisma.budgetPlan.findMany({
        where: { tripId: trip!.id },
        orderBy: { category: "asc" },
      }),
      prisma.expense.findMany({
        where: { tripId: trip!.id },
        select: { category: true, qty: true, unitCost: true },
      }),
    ])

    const actualCosts = computeActualCosts(expenses)

    const plannedCategories = new Set(budgetPlans.map((p) => p.category))

    const budgetWithActual = [
      // Rows with a budget plan
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
      // Expense-only rows (no budget plan set)
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

    return NextResponse.json({ budget: budgetWithActual })
  } catch (err) {
    console.error("GET /api/trips/[id]/budget error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id } = await params

  const { trip, error: tripError } = await requireTripAccess(id, user!.id)
  if (tripError) return tripError

  try {
    const body = await req.json()
    const parsed = createBudgetPlanSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { category, plannedCost } = parsed.data

    const budgetPlan = await prisma.budgetPlan.create({
      data: {
        category,
        plannedCost,
        tripId: trip!.id,
      },
    })

    return NextResponse.json({ budgetPlan }, { status: 201 })
  } catch (err) {
    console.error("POST /api/trips/[id]/budget error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
