import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripOwnership } from "@/lib/api-helpers"
import { createExpenseSchema } from "@/lib/validations/expense"

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
    const expenses = await prisma.expense.findMany({
      where: { tripId: trip!.id },
      orderBy: { date: "desc" },
      include: {
        paidBy: true,
        splitWith: {
          include: { member: true },
        },
      },
    })

    return NextResponse.json({ expenses })
  } catch (err) {
    console.error("GET /api/trips/[id]/expenses error:", err)
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

  const { trip, error: tripError } = await requireTripOwnership(id, user!.id)
  if (tripError) return tripError

  try {
    const body = await req.json()
    const parsed = createExpenseSchema.safeParse(body)

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
      const created = await tx.expense.create({
        data: {
          date: new Date(date),
          category,
          description,
          qty: qty ?? null,
          unitCost,
          paymentMethod,
          paymentStatus,
          tripId: trip!.id,
          paidById,
        },
      })

      if (splitMemberIds.length > 0) {
        await tx.expenseSplit.createMany({
          data: splitMemberIds.map((memberId: string) => ({
            expenseId: created.id,
            memberId,
          })),
        })
      }

      return tx.expense.findUnique({
        where: { id: created.id },
        include: {
          paidBy: true,
          splitWith: {
            include: { member: true },
          },
        },
      })
    })

    return NextResponse.json({ expense }, { status: 201 })
  } catch (err) {
    console.error("POST /api/trips/[id]/expenses error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
