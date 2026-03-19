import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-helpers"
import bcrypt from "bcryptjs"
import { z } from "zod"

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
})

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  try {
    const body = await req.json()
    const parsed = changePasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = parsed.data

    const dbUser = await prisma.user.findUnique({ where: { id: user!.id } })
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const valid = await bcrypt.compare(currentPassword, dbUser.password)
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user!.id },
      data: { password: hashed },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("PATCH /api/user/password error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
