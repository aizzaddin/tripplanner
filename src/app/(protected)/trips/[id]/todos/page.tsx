import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import TodosView from "@/components/todos-view"

interface TodosPageProps {
  params: Promise<{ id: string }>
}

export default async function TodosPage({ params }: TodosPageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const { id } = await params

  const trip = await prisma.trip.findFirst({
    where: { id, userId: session.user.id },
    include: { members: true },
  })

  if (!trip) {
    redirect("/dashboard")
  }

  const todos = await prisma.todoItem.findMany({
    where: { tripId: id },
    orderBy: { createdAt: "asc" },
    include: { assignedTo: true },
  })

  return (
    <TodosView
      tripId={id}
      members={trip!.members}
      initialTodos={todos.map((todo) => ({
        id: todo.id,
        task: todo.task,
        isDone: todo.isDone,
        priority: todo.priority,
        dueDate: todo.dueDate?.toISOString() ?? null,
        assignedToId: todo.assignedToId,
        assignedTo: todo.assignedTo,
      }))}
    />
  )
}
