import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripAccess } from "@/lib/api-helpers"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id } = await params
  const { error: tripError } = await requireTripAccess(id, user!.id)
  if (tripError) return tripError

  const { fromMemberId, toMemberId, amount, note } = await req.json()

  if (!fromMemberId || !toMemberId || !amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid payment data" }, { status: 400 })
  }

  const payment = await prisma.settlementPayment.create({
    data: { tripId: id, fromMemberId, toMemberId, amount, note },
    include: {
      fromMember: { select: { id: true, name: true, color: true } },
      toMember: { select: { id: true, name: true, color: true } },
    },
  })

  return NextResponse.json({ payment }, { status: 201 })
}
