import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripOwnership } from "@/lib/api-helpers"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id, userId: targetUserId } = await params

  // Only the owner can remove collaborators
  const { error: ownerError } = await requireTripOwnership(id, user!.id)
  if (ownerError) return ownerError

  try {
    const collaborator = await prisma.tripCollaborator.findUnique({
      where: { tripId_userId: { tripId: id, userId: targetUserId } },
    })

    if (!collaborator) {
      return NextResponse.json({ error: "Collaborator not found" }, { status: 404 })
    }

    await prisma.tripCollaborator.delete({
      where: { tripId_userId: { tripId: id, userId: targetUserId } },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/trips/[id]/collaborators/[userId] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
