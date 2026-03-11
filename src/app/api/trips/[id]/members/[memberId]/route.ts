import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripOwnership } from "@/lib/api-helpers"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id, memberId } = await params

  const { trip, error: tripError } = await requireTripOwnership(id, user!.id)
  if (tripError) return tripError

  try {
    const member = await prisma.member.findFirst({
      where: { id: memberId, tripId: trip!.id },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    await prisma.member.delete({ where: { id: memberId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/trips/[id]/members/[memberId] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
