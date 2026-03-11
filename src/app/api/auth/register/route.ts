import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // First user becomes ADMIN + ACTIVE, rest are USER + PENDING
    const userCount = await prisma.user.count()
    const isFirstUser = userCount === 0

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: isFirstUser ? "ADMIN" : "USER",
        status: isFirstUser ? "ACTIVE" : "PENDING",
      },
    })

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } },
      { status: 201 }
    )
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
