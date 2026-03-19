import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants"
import TripSettingsView from "@/components/trip-settings-view"

interface TripSettingsPageProps {
  params: Promise<{ id: string }>
}

export default async function TripSettingsPage({ params }: TripSettingsPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { id } = await params

  const trip = await prisma.trip.findFirst({
    where: { id, OR: [{ userId: session.user.id }, { collaborators: { some: { userId: session.user.id } } }] },
    select: { categories: true, paymentMethods: true },
  })

  if (!trip) redirect("/dashboard")

  const categories =
    Array.isArray(trip.categories) && trip.categories.length > 0
      ? (trip.categories as string[])
      : EXPENSE_CATEGORIES

  const paymentMethods =
    Array.isArray(trip.paymentMethods) && trip.paymentMethods.length > 0
      ? (trip.paymentMethods as string[])
      : PAYMENT_METHODS.map((p) => p.value)

  return (
    <TripSettingsView
      tripId={id}
      initialCategories={categories}
      initialPaymentMethods={paymentMethods}
    />
  )
}
