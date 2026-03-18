import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripAccess } from "@/lib/api-helpers"
import { createMemberSchema } from "@/lib/validations/member"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id } = await params

  const { trip, error: tripError } = await requireTripAccess(id, user!.id)
  if (tripError) return tripError

  try {
    const body = await req.json()
    const parsed = createMemberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, category, color } = parsed.data

    const member = await prisma.member.create({
      data: {
        name,
        category,
        color,
        tripId: trip!.id,
      },
    })

    return NextResponse.json({ member }, { status: 201 })
  } catch (err) {
    console.error("POST /api/trips/[id]/members error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
