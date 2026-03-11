import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripOwnership } from "@/lib/api-helpers"
import crypto from "crypto"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id } = await params

  const { trip, error: tripError } = await requireTripOwnership(id, user!.id)
  if (tripError) return tripError

  try {
    const shareToken = crypto.randomBytes(32).toString("hex")

    await prisma.trip.update({
      where: { id: trip!.id },
      data: { shareToken },
    })

    return NextResponse.json({ shareToken })
  } catch (err) {
    console.error("POST /api/trips/[id]/share error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id } = await params

  const { trip, error: tripError } = await requireTripOwnership(id, user!.id)
  if (tripError) return tripError

  try {
    await prisma.trip.update({
      where: { id: trip!.id },
      data: { shareToken: null },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/trips/[id]/share error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
