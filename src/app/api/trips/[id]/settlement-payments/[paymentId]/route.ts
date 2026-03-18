import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripAccess } from "@/lib/api-helpers"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id, paymentId } = await params
  const { error: tripError } = await requireTripAccess(id, user!.id)
  if (tripError) return tripError

  await prisma.settlementPayment.delete({ where: { id: paymentId } })

  return NextResponse.json({ success: true })
}
