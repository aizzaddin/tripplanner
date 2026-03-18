import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripAccess } from "@/lib/api-helpers"
import { updateExpenseSchema } from "@/lib/validations/expense"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id, expenseId } = await params

  const { trip, error: tripError } = await requireTripAccess(id, user!.id)
  if (tripError) return tripError

  try {
    const body = await req.json()
    const parsed = updateExpenseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      date,
      category,
      description,
      qty,
      unitCost,
      paidById,
      paymentMethod,
      paymentStatus,
      splitWith,
    } = parsed.data

    const existingExpense = await prisma.expense.findFirst({
      where: { id: expenseId, tripId: trip!.id },
    })

    if (!existingExpense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    // If splitWith is empty and paymentStatus is SPLIT_EQUAL, default to all trip members
    let splitMemberIds = splitWith
    if (splitMemberIds.length === 0 && paymentStatus === "SPLIT_EQUAL") {
      const allMembers = await prisma.member.findMany({
        where: { tripId: trip!.id },
        select: { id: true },
      })
      splitMemberIds = allMembers.map((member: { id: string }) => member.id)
    }

    const expense = await prisma.$transaction(async (tx) => {
      const updated = await tx.expense.update({
        where: { id: expenseId },
        data: {
          date: new Date(date),
          category,
          description,
          qty: qty ?? null,
          unitCost,
          paymentMethod,
          paymentStatus,
          paidById,
        },
      })

      // Delete old split records and create new ones
      await tx.expenseSplit.deleteMany({ where: { expenseId } })

      if (splitMemberIds.length > 0) {
        await tx.expenseSplit.createMany({
          data: splitMemberIds.map((memberId: string) => ({
            expenseId: updated.id,
            memberId,
          })),
        })
      }

      return tx.expense.findUnique({
        where: { id: updated.id },
        include: {
          paidBy: true,
          splitWith: {
            include: { member: true },
          },
        },
      })
    })

    return NextResponse.json({ expense })
  } catch (err) {
    console.error("PUT /api/trips/[id]/expenses/[expenseId] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id, expenseId } = await params

  const { trip, error: tripError } = await requireTripAccess(id, user!.id)
  if (tripError) return tripError

  try {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, tripId: trip!.id },
    })

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 })
    }

    await prisma.expense.delete({ where: { id: expenseId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/trips/[id]/expenses/[expenseId] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
