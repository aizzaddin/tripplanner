import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripOwnership } from "@/lib/api-helpers"
import { createPackingItemSchema } from "@/lib/validations/packing"

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
    const items = await prisma.packingItem.findMany({
      where: { tripId: trip!.id },
      include: { assignedTo: true },
      orderBy: { id: "asc" },
    })

    return NextResponse.json({ items })
  } catch (err) {
    console.error("GET /api/trips/[id]/packing error:", err)
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
    const parsed = createPackingItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { item, qty, assignedToId } = parsed.data

    const packingItem = await prisma.packingItem.create({
      data: {
        item,
        qty,
        assignedToId: assignedToId || null,
        tripId: trip!.id,
      },
      include: { assignedTo: true },
    })

    return NextResponse.json({ item: packingItem }, { status: 201 })
  } catch (err) {
    console.error("POST /api/trips/[id]/packing error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
