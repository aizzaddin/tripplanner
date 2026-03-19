import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripAccess, requireTripOwnership } from "@/lib/api-helpers"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id } = await params

  const { error: tripError } = await requireTripAccess(id, user!.id)
  if (tripError) return tripError

  try {
    const collaborators = await prisma.tripCollaborator.findMany({
      where: { tripId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    })

    const trip = await prisma.trip.findUnique({
      where: { id },
      select: { userId: true },
    })

    return NextResponse.json({ collaborators, ownerId: trip!.userId })
  } catch (err) {
    console.error("GET /api/trips/[id]/collaborators error:", err)
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

  // Only the owner can add collaborators
  const { error: ownerError } = await requireTripOwnership(id, user!.id)
  if (ownerError) return ownerError

  try {
    const { email } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const invitedUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, name: true, email: true, status: true },
    })

    if (!invitedUser) {
      return NextResponse.json({ error: "No user found with that email" }, { status: 404 })
    }

    if (invitedUser.status !== "ACTIVE") {
      return NextResponse.json({ error: "That user's account is not active" }, { status: 400 })
    }

    if (invitedUser.id === user!.id) {
      return NextResponse.json({ error: "You are already the trip owner" }, { status: 400 })
    }

    const existing = await prisma.tripCollaborator.findUnique({
      where: { tripId_userId: { tripId: id, userId: invitedUser.id } },
    })

    if (existing) {
      return NextResponse.json({ error: "User is already a collaborator" }, { status: 409 })
    }

    const collaborator = await prisma.tripCollaborator.create({
      data: { tripId: id, userId: invitedUser.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ collaborator }, { status: 201 })
  } catch (err) {
    console.error("POST /api/trips/[id]/collaborators error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
