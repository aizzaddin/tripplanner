import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripAccess } from "@/lib/api-helpers"
import { updateItineraryDaySchema } from "@/lib/validations/itinerary"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; dayNumber: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id, dayNumber } = await params

  const { trip, error: tripError } = await requireTripAccess(id, user!.id)
  if (tripError) return tripError

  try {
    const body = await req.json()
    const parsed = updateItineraryDaySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { mainArea, accommodation, activities, todos, notes } = parsed.data

    const dayNum = parseInt(dayNumber, 10)
    if (isNaN(dayNum) || dayNum < 1) {
      return NextResponse.json({ error: "Invalid day number" }, { status: 400 })
    }

    const itineraryDay = await prisma.itineraryDay.upsert({
      where: {
        tripId_dayNumber: {
          tripId: trip!.id,
          dayNumber: dayNum,
        },
      },
      update: {
        mainArea: mainArea ?? null,
        accommodation: accommodation ?? null,
        activities: activities as object[],
        todos: todos as object[],
        notes: notes as string[],
      },
      create: {
        tripId: trip!.id,
        dayNumber: dayNum,
        mainArea: mainArea ?? null,
        accommodation: accommodation ?? null,
        activities: activities as object[],
        todos: todos as object[],
        notes: notes as string[],
      },
    })

    return NextResponse.json({ itineraryDay })
  } catch (err) {
    console.error("PUT /api/trips/[id]/itinerary/[dayNumber] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
