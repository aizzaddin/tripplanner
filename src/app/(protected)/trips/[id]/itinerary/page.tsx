import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ItineraryView from "@/components/itinerary-view"

interface ItineraryPageProps {
  params: Promise<{ id: string }>
}

type ItineraryActivity = { order: number; name: string; estimatedTime?: string }
type ItineraryTodo = { order: number; name: string; assignedTo?: string }

export default async function ItineraryPage({ params }: ItineraryPageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }

  const { id } = await params

  const trip = await prisma.trip.findFirst({
    where: { id, OR: [{ userId: session.user.id }, { collaborators: { some: { userId: session.user.id } } }] },
  })

  if (!trip) {
    redirect("/dashboard")
  }

  const itinerary = await prisma.itineraryDay.findMany({
    where: { tripId: id },
    orderBy: { dayNumber: "asc" },
  })

  return (
    <ItineraryView
      tripId={id}
      startDate={trip!.startDate.toISOString()}
      initialDays={itinerary.map((day) => ({
        id: day.id,
        dayNumber: day.dayNumber,
        mainArea: day.mainArea,
        accommodation: day.accommodation,
        activities: (day.activities as ItineraryActivity[]) ?? [],
        todos: (day.todos as ItineraryTodo[]) ?? [],
        notes: (day.notes as string[]) ?? [],
      }))}
    />
  )
}
