import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireTripAccess } from "@/lib/api-helpers"
import { updateTodoSchema } from "@/lib/validations/todo"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; todoId: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id, todoId } = await params

  const { trip, error: tripError } = await requireTripAccess(id, user!.id)
  if (tripError) return tripError

  try {
    const body = await req.json()
    const parsed = updateTodoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const existingTodo = await prisma.todoItem.findFirst({
      where: { id: todoId, tripId: trip!.id },
    })

    if (!existingTodo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    const { task, priority, dueDate, assignedToId, isDone } = parsed.data

    const todo = await prisma.todoItem.update({
      where: { id: todoId },
      data: {
        task,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId: assignedToId || null,
        ...(isDone !== undefined && { isDone }),
      },
      include: { assignedTo: true },
    })

    return NextResponse.json({ todo })
  } catch (err) {
    console.error("PUT /api/trips/[id]/todos/[todoId] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; todoId: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id, todoId } = await params

  const { trip, error: tripError } = await requireTripAccess(id, user!.id)
  if (tripError) return tripError

  try {
    const todo = await prisma.todoItem.findFirst({
      where: { id: todoId, tripId: trip!.id },
    })

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 })
    }

    await prisma.todoItem.delete({ where: { id: todoId } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/trips/[id]/todos/[todoId] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
