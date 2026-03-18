import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardClient from "@/components/dashboard-client"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const trips = await prisma.trip.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { collaborators: { some: { userId: session.user.id } } },
      ],
    },
    orderBy: { startDate: "desc" },
    include: {
      _count: { select: { members: true } },
    },
  })

  return (
    <div className="p-4 md:p-8 animate-fade-up">
      <DashboardClient trips={trips} currentUserId={session.user.id} />
    </div>
  )
}
