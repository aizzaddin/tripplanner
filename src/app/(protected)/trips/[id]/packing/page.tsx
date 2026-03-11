import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import PackingView from "@/components/packing-view"

interface PackingPageProps {
  params: Promise<{ id: string }>
}

export default async function PackingPage({ params }: PackingPageProps) {
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

  const items = await prisma.packingItem.findMany({
    where: { tripId: id },
    include: { assignedTo: true },
    orderBy: { id: "asc" },
  })

  return (
    <PackingView
      tripId={id}
      members={trip!.members}
      initialItems={items.map((packingItem) => ({
        id: packingItem.id,
        item: packingItem.item,
        qty: packingItem.qty,
        isDone: packingItem.isDone,
        assignedToId: packingItem.assignedToId,
        assignedTo: packingItem.assignedTo,
      }))}
    />
  )
}
