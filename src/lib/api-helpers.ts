import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  return { user: session.user, error: null }
}

export async function requireTripOwnership(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({
    where: {
      id: tripId,
      userId,
    },
  })

  if (!trip) {
    return { trip: null, error: NextResponse.json({ error: "Trip not found" }, { status: 404 }) }
  }

  return { trip, error: null }
}
