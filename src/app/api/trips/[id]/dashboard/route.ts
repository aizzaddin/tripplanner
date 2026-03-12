import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripOwnership } from "@/lib/api-helpers"
import { computeBalances, computeSettlements, computeTotal, adjustBalancesForPayments } from "@/lib/business/expense"
import { computeTodoStats } from "@/lib/business/todo"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id } = await params

  const { trip, error: tripError } = await requireTripOwnership(id, user!.id)
  if (tripError) return tripError

  try {
    const [expenses, members, todos, settlementPayments] = await Promise.all([
      prisma.expense.findMany({
        where: { tripId: trip!.id },
        include: { splitWith: true },
      }),
      prisma.member.findMany({ where: { tripId: trip!.id } }),
      prisma.todoItem.findMany({ where: { tripId: trip!.id } }),
      prisma.settlementPayment.findMany({
        where: { tripId: trip!.id },
        include: {
          fromMember: { select: { id: true, name: true, color: true } },
          toMember: { select: { id: true, name: true, color: true } },
        },
        orderBy: { createdAt: "asc" },
      }),
    ])

    const expensesForCalc = expenses.map((expense) => ({
      id: expense.id,
      qty: expense.qty,
      unitCost: expense.unitCost,
      paymentStatus: expense.paymentStatus,
      paidById: expense.paidById,
      splitWith: expense.splitWith.map((split) => ({ memberId: split.memberId })),
    }))

    const rawBalances = computeBalances(expensesForCalc, members)
    const balances = adjustBalancesForPayments(rawBalances, settlementPayments)
    const settlements = computeSettlements(expensesForCalc, members, settlementPayments)

    const taskStats = computeTodoStats(
      todos.map((todo) => ({
        task: todo.task,
        isDone: todo.isDone,
        dueDate: todo.dueDate,
      }))
    )

    const totalExpenses = expenses.reduce((sum: number, expense) => {
      return sum + computeTotal(expense.qty, expense.unitCost)
    }, 0)

    return NextResponse.json({
      totalExpenses,
      balances,
      settlements,
      settlementPayments,
      taskStats,
    })
  } catch (err) {
    console.error("GET /api/trips/[id]/dashboard error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
