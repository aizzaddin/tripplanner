import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Role, UserStatus } from "@/generated/prisma/enums"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { userId } = await params
  const body = await req.json()
  const { status, role } = body

  // Prevent admin from modifying themselves
  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 })
  }

  const updateData: { status?: UserStatus; role?: Role } = {}
  if (status && ["PENDING", "ACTIVE", "BANNED"].includes(status)) updateData.status = status as UserStatus
  if (role && ["USER", "ADMIN"].includes(role)) updateData.role = role as Role

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  })

  return NextResponse.json({ user })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { userId } = await params

  if (userId === session.user.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: userId } })

  return NextResponse.json({ success: true })
}
