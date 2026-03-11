import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import NewTripDialogClient from "@/components/new-trip-dialog-client"
import { Icon } from "@iconify/react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "desc" },
    include: {
      _count: {
        select: { members: true },
      },
    },
  })

  return (
    <div className="p-4 md:p-8 animate-fade-up">
      <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl font-bold">Your Trips</h1>
          <p className="text-muted-foreground mt-1">
            {trips.length === 0
              ? "No trips yet. Create your first one!"
              : `${trips.length} trip${trips.length === 1 ? "" : "s"} planned`}
          </p>
        </div>
        <NewTripDialogClient />
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <Icon icon="lucide:plane" className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first trip to start planning your adventure.
          </p>
          <NewTripDialogClient />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}/budget`}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                      {trip.name}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0 font-mono">
                      {trip.currency}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Icon icon="lucide:calendar" className="w-3.5 h-3.5 shrink-0" />
                      {format(new Date(trip.startDate), "MMM d")} –{" "}
                      {format(new Date(trip.endDate), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Icon icon="lucide:users" className="w-3.5 h-3.5 shrink-0" />
                      {trip._count.members} member{trip._count.members !== 1 ? "s" : ""}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
