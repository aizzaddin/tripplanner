import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripAccess } from "@/lib/api-helpers"
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants"
import { z } from "zod"

const ALL_PAYMENT_VALUES = PAYMENT_METHODS.map((p) => p.value)

const settingsSchema = z.object({
  categories: z.array(z.string().min(1).max(60)).max(50),
  paymentMethods: z.array(z.string()).refine(
    (arr) => arr.every((v) => ALL_PAYMENT_VALUES.includes(v)),
    { message: "Invalid payment method value" }
  ),
})

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
    const trip = await prisma.trip.findUnique({
      where: { id },
      select: { categories: true, paymentMethods: true },
    })

    const categories =
      Array.isArray(trip?.categories) && trip.categories.length > 0
        ? (trip.categories as string[])
        : EXPENSE_CATEGORIES

    const paymentMethods =
      Array.isArray(trip?.paymentMethods) && trip.paymentMethods.length > 0
        ? (trip.paymentMethods as string[])
        : ALL_PAYMENT_VALUES

    return NextResponse.json({ categories, paymentMethods })
  } catch (err) {
    console.error("GET /api/trips/[id]/settings error:", err)
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
  const { trip, error: tripError } = await requireTripAccess(id, user!.id)
  if (tripError) return tripError

  try {
    const body = await req.json()
    const parsed = settingsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await prisma.trip.update({
      where: { id: trip!.id },
      data: {
        categories: parsed.data.categories,
        paymentMethods: parsed.data.paymentMethods,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("PUT /api/trips/[id]/settings error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
