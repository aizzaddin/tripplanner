import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripAccess } from "@/lib/api-helpers"
import { updatePackingItemSchema } from "@/lib/validations/packing"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id, itemId } = await params

  const { trip, error: tripError } = await requireTripAccess(id, user!.id)
  if (tripError) return tripError

  try {
    const body = await req.json()
    const parsed = updatePackingItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existingItem = await prisma.packingItem.findFirst({
      where: { id: itemId, tripId: trip!.id },
    })

    if (!existingItem) {
      return NextResponse.json({ error: "Packing item not found" }, { status: 404 })
    }

    const { item, qty, assignedToId, isDone } = parsed.data

    const packingItem = await prisma.packingItem.update({
      where: { id: itemId },
      data: {
        item,
        qty,
        assignedToId: assignedToId || null,
        ...(isDone !== undefined && { isDone }),
      },
      include: { assignedTo: true },
    })

    return NextResponse.json({ item: packingItem })
  } catch (err) {
    console.error("PUT /api/trips/[id]/packing/[itemId] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id, itemId } = await params

  const { trip, error: tripError } = await requireTripAccess(id, user!.id)
  if (tripError) return tripError

  try {
    const existingItem = await prisma.packingItem.findFirst({
      where: { id: itemId, tripId: trip!.id },
    })

    if (!existingItem) {
      return NextResponse.json({ error: "Packing item not found" }, { status: 404 })
    }

    await prisma.packingItem.delete({ where: { id: itemId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/trips/[id]/packing/[itemId] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
