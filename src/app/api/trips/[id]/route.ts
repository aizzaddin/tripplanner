import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripOwnership } from "@/lib/api-helpers"
import { updateTripSchema } from "@/lib/validations/trip"

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
    const tripWithMembers = await prisma.trip.findUnique({
      where: { id: trip!.id },
      include: { members: true },
    })

    return NextResponse.json({ trip: tripWithMembers })
  } catch (err) {
    console.error("GET /api/trips/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
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
    const parsed = updateTripSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, currency, startDate, endDate } = parsed.data

    const updatedTrip = await prisma.trip.update({
      where: { id: trip!.id },
      data: {
        ...(name && { name }),
        ...(currency && { currency }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
      },
    })

    return NextResponse.json({ trip: updatedTrip })
  } catch (err) {
    console.error("PUT /api/trips/[id] error:", err)
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
    await prisma.trip.delete({ where: { id: trip!.id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/trips/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
