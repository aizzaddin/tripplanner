import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import Link from "next/link"
import ActiveTabLink from "./active-tab-link"
import { Icon } from "@iconify/react"
import ShareButton from "@/components/share-button"
import TripHeaderEditor from "@/components/trip-header-editor"

interface TripLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

const tabs = [
  { label: "Budget",    icon: "lucide:wallet",       href: (id: string) => `/trips/${id}/budget` },
  { label: "Expenses",  icon: "lucide:receipt",      href: (id: string) => `/trips/${id}/expenses` },
  { label: "Itinerary", icon: "lucide:map",          href: (id: string) => `/trips/${id}/itinerary` },
  { label: "To-Do",     icon: "lucide:check-square", href: (id: string) => `/trips/${id}/todos` },
  { label: "Packing",   icon: "lucide:backpack",     href: (id: string) => `/trips/${id}/packing` },
]

export default async function TripLayout({ children, params }: TripLayoutProps) {
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

  return (
    <div className="flex flex-col min-h-full">
      {/* Trip Header */}
      <div className="bg-card border-b px-4 py-4 md:px-8 md:py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
          <Link href="/dashboard" className="hover:text-foreground transition-colors flex items-center gap-1">
            <Icon icon="lucide:layout-dashboard" className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Icon icon="lucide:chevron-right" className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium truncate">{trip.name}</span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold truncate">{trip.name}</h1>
              <TripHeaderEditor
                tripId={id}
                name={trip.name}
                currency={trip.currency}
                startDate={trip.startDate.toISOString()}
                endDate={trip.endDate.toISOString()}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 text-muted-foreground">
              <span className="flex items-center gap-1.5 text-sm">
                <Icon icon="lucide:calendar" className="w-4 h-4 shrink-0" />
                {format(new Date(trip.startDate), "MMM d, yyyy")} –{" "}
                {format(new Date(trip.endDate), "MMM d, yyyy")}
              </span>
              <span className="hidden sm:inline text-border">·</span>
              <span className="flex items-center gap-1.5 text-sm">
                <Icon icon="lucide:wallet" className="w-4 h-4 shrink-0 sm:hidden" />
                <span className="font-mono font-medium">{trip.currency}</span>
              </span>
              <span className="hidden sm:inline text-border">·</span>
              <span className="flex items-center gap-1.5 text-sm">
                <Icon icon="lucide:users" className="w-4 h-4 shrink-0" />
                {trip.members.length} member{trip.members.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <ShareButton tripId={id} initialShareToken={trip.shareToken ?? null} />
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex gap-1 mt-4 md:mt-6 overflow-x-auto pb-px scrollbar-hide">
          {tabs.map((tab) => (
            <ActiveTabLink
              key={tab.label}
              href={tab.href(id)}
              label={tab.label}
              icon={tab.icon}
            />
          ))}
        </nav>
      </div>

      {/* Page Content */}
      <div className="flex-1 p-4 md:p-8 animate-fade-up">
        {children}
      </div>
    </div>
  )
}
