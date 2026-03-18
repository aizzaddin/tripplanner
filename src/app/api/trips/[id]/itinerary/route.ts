import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripAccess } from "@/lib/api-helpers"

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
    const itinerary = await prisma.itineraryDay.findMany({
      where: { tripId: trip!.id },
      orderBy: { dayNumber: "asc" },
    })

    return NextResponse.json({ itinerary })
  } catch (err) {
    console.error("GET /api/trips/[id]/itinerary error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
