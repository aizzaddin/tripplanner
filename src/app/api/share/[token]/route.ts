import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { computeActualCosts } from "@/lib/business/budget"
import { computeBalances, computeSettlements } from "@/lib/business/expense"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  try {
    const trip = await prisma.trip.findUnique({
      where: { shareToken: token },
      include: {
        members: true,
        expenses: {
          include: {
            paidBy: true,
            splitWith: {
              include: { member: true },
            },
          },
          orderBy: { date: "desc" },
        },
        budgetPlans: {
          orderBy: { category: "asc" },
        },
      },
    })

    if (!trip) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const expensesForCosts = trip.expenses.map((e) => ({
      category: e.category,
      qty: e.qty,
      unitCost: e.unitCost,
    }))

    const actualCosts = computeActualCosts(expensesForCosts)

    const plannedCategories = new Set(trip.budgetPlans.map((p) => p.category))

    const budgetWithActual = [
      ...trip.budgetPlans.map((plan) => {
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

    const expensesForBalances = trip.expenses.map((e) => ({
      id: e.id,
      qty: e.qty,
      unitCost: e.unitCost,
      paymentStatus: e.paymentStatus,
      paidById: e.paidById,
      splitWith: e.splitWith.map((s) => ({ memberId: s.memberId })),
    }))

    const balances = computeBalances(expensesForBalances, trip.members)
    const settlements = computeSettlements(balances)

    return NextResponse.json({
      trip: {
        id: trip.id,
        name: trip.name,
        currency: trip.currency,
        startDate: trip.startDate,
        endDate: trip.endDate,
      },
      members: trip.members,
      expenses: trip.expenses,
      budgetPlans: trip.budgetPlans,
      budgetWithActual,
      actualCosts,
      balances,
      settlements,
    })
  } catch (err) {
    console.error("GET /api/share/[token] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
