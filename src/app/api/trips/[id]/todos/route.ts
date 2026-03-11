import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripOwnership } from "@/lib/api-helpers"
import { createTodoSchema } from "@/lib/validations/todo"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id } = await params

  const { trip, error: tripError } = await requireTripOwnership(id, user!.id)
  if (tripError) return tripError

  try {
    const todos = await prisma.todoItem.findMany({
      where: { tripId: trip!.id },
      orderBy: { createdAt: "asc" },
      include: { assignedTo: true },
    })

    return NextResponse.json({ todos })
  } catch (err) {
    console.error("GET /api/trips/[id]/todos error:", err)
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

  const { trip, error: tripError } = await requireTripOwnership(id, user!.id)
  if (tripError) return tripError

  try {
    const body = await req.json()
    const parsed = createTodoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { task, priority, dueDate, assignedToId } = parsed.data

    const todo = await prisma.todoItem.create({
      data: {
        task,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: assignedToId || null,
        tripId: trip!.id,
      },
      include: { assignedTo: true },
    })

    return NextResponse.json({ todo }, { status: 201 })
  } catch (err) {
    console.error("POST /api/trips/[id]/todos error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
