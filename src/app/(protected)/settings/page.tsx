import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import SettingsClient from "@/components/settings-client"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  })

  if (!user) redirect("/login")

  return (
    <div className="p-4 md:p-8 animate-fade-up">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-black tracking-tight font-sans">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and profile.</p>
      </div>
      <SettingsClient user={user} />
    </div>
  )
}
