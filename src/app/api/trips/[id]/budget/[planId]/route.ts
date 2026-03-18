import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripAccess } from "@/lib/api-helpers"
import { updateBudgetPlanSchema } from "@/lib/validations/budget"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id, planId } = await params

  const { trip, error: tripError } = await requireTripAccess(id, user!.id)
  if (tripError) return tripError

  try {
    const body = await req.json()
    const parsed = updateBudgetPlanSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existingPlan = await prisma.budgetPlan.findFirst({
      where: { id: planId, tripId: trip!.id },
    })

    if (!existingPlan) {
      return NextResponse.json({ error: "Budget plan not found" }, { status: 404 })
    }

    const { plannedCost } = parsed.data

    const budgetPlan = await prisma.budgetPlan.update({
      where: { id: planId },
      data: { plannedCost },
    })

    return NextResponse.json({ budgetPlan })
  } catch (err) {
    console.error("PUT /api/trips/[id]/budget/[planId] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id, planId } = await params

  const { trip, error: tripError } = await requireTripAccess(id, user!.id)
  if (tripError) return tripError

  try {
    const existingPlan = await prisma.budgetPlan.findFirst({
      where: { id: planId, tripId: trip!.id },
    })

    if (!existingPlan) {
      return NextResponse.json({ error: "Budget plan not found" }, { status: 404 })
    }

    await prisma.budgetPlan.delete({ where: { id: planId } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/trips/[id]/budget/[planId] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
