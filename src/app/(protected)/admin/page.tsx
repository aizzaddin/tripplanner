import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminUsersClient from "./users-client"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/dashboard")

  // Check role directly from DB — don't rely on JWT having role
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (currentUser?.role !== "ADMIN") redirect("/dashboard")

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { trips: true } },
    },
  })

  return (
    <div className="p-8 animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-1">
          {users.length} registered user{users.length !== 1 ? "s" : ""}
        </p>
      </div>
      <AdminUsersClient users={users} currentUserId={session.user.id} />
    </div>
  )
}
