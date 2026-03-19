"use client"

import { useState } from "react"
import { format } from "date-fns"
import { useGsapEntrance } from "@/lib/hooks/use-gsap-entrance"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon } from "@iconify/react"
import NewTripDialogClient from "@/components/new-trip-dialog-client"

interface Trip {
  id: string
  name: string
  currency: string
  startDate: Date
  endDate: Date
  userId: string
  _count: { members: number }
}

interface DashboardClientProps {
  trips: Trip[]
  currentUserId: string
}

type Filter = "all" | "mine" | "collaborating"

export default function DashboardClient({ trips, currentUserId }: DashboardClientProps) {
  const containerRef = useGsapEntrance()
  const [filter, setFilter] = useState<Filter>("all")

  const myTrips = trips.filter((t) => t.userId === currentUserId)
  const collabTrips = trips.filter((t) => t.userId !== currentUserId)

  const filtered =
    filter === "mine" ? myTrips :
    filter === "collaborating" ? collabTrips :
    trips

  const filterTabs: { key: Filter; label: string; count: number }[] = [
    { key: "all",           label: "All",           count: trips.length },
    { key: "mine",          label: "My Trips",       count: myTrips.length },
    { key: "collaborating", label: "Collaborating",  count: collabTrips.length },
  ]

  return (
    <div ref={containerRef}>
      <div className="gsap-enter flex items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight font-family">Your Trips</h1>
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
        <>
          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  filter === tab.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {tab.label}
                <span
                  className={`text-xs rounded-full px-1.5 py-0.5 leading-none ${
                    filter === tab.key
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Icon icon="lucide:filter-x" className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No trips match this filter.</p>
            </div>
          ) : (
            <div className="gsap-enter grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((trip) => {
                const isCollaborator = trip.userId !== currentUserId
                return (
                  <Link key={trip.id} href={`/trips/${trip.id}/budget`}>
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                            {trip.name}
                          </CardTitle>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isCollaborator && (
                              <Badge variant="outline" className="text-xs gap-1 text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800">
                                <Icon icon="lucide:users" className="w-3 h-3" />
                                Collaborator
                              </Badge>
                            )}
                            <Badge variant="secondary" className="font-mono">
                              {trip.currency}
                            </Badge>
                          </div>
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
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
