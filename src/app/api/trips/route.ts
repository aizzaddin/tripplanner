import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-helpers"
import { createTripSchema } from "@/lib/validations/trip"

export async function GET() {
  const { user, error } = await requireAuth()
  if (error) return error

  try {
    const trips = await prisma.trip.findMany({
      where: {
        OR: [
          { userId: user!.id },
          { collaborators: { some: { userId: user!.id } } },
        ],
      },
      orderBy: { startDate: "desc" },
      include: {
        _count: { select: { members: true } },
      },
    })

    return NextResponse.json({ trips })
  } catch (err) {
    console.error("GET /api/trips error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  try {
    const body = await req.json()
    const parsed = createTripSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, currency, startDate, endDate } = parsed.data

    const start = new Date(startDate)
    const end = new Date(endDate)

    const numberOfDays = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1

    const trip = await prisma.trip.create({
      data: {
        name,
        currency,
        startDate: start,
        endDate: end,
        userId: user!.id,
        itineraries: {
          create: Array.from({ length: numberOfDays }, (_, i) => ({
            dayNumber: i + 1,
            activities: [],
            todos: [],
            notes: [],
          })),
        },
      },
    })

    return NextResponse.json({ trip }, { status: 201 })
  } catch (err) {
    console.error("POST /api/trips error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
