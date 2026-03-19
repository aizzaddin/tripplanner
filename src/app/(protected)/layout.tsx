import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"
import { prisma } from "@/lib/prisma"
import MobileNav from "@/components/mobile-nav"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Check role from DB — reliable regardless of JWT state
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  const isAdmin = currentUser?.role === "ADMIN"

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex w-64 bg-card border-r flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Icon icon="lucide:split" className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight leading-none font-sans">TripSplit</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Plan your adventures</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Icon icon="lucide:layout-dashboard" className="w-4 h-4" />
              Dashboard
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Icon icon="lucide:shield" className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>
        </nav>

        <div className="px-4 py-2 border-t">
          <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
            © wildanaizzaddin
            <Icon icon="lucide:handshake" className="w-3 h-3" />
            claude
          </p>
        </div>

        <div className="p-4 border-t">
          <Link
            href="/settings"
            className="flex items-center gap-3 mb-3 rounded-lg px-2 py-1.5 -mx-2 hover:bg-accent transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium shrink-0">
              {session.user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
            </div>
            <Icon icon="lucide:settings" className="w-3.5 h-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <Button variant="outline" size="sm" type="submit" className="w-full gap-2">
              <Icon icon="lucide:log-out" className="w-3.5 h-3.5" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile nav + main */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <MobileNav
          userName={session.user.name ?? "User"}
          userEmail={session.user.email ?? ""}
          isAdmin={isAdmin}
        />
        <main className="flex-1 overflow-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
