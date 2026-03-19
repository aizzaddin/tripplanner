import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-helpers"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
})

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  try {
    const body = await req.json()
    const parsed = updateProfileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email } = parsed.data

    // Check email uniqueness if changed
    if (email !== user!.email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json({ error: "Email is already in use" }, { status: 409 })
      }
    }

    const updated = await prisma.user.update({
      where: { id: user!.id },
      data: { name, email },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    })

    return NextResponse.json({ user: updated })
  } catch (err) {
    console.error("PATCH /api/user/profile error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
