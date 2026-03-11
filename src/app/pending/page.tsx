import { Icon } from "@iconify/react"
import { auth, signOut } from "@/auth"

export default async function PendingPage() {
  const session = await auth()

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <Icon icon="lucide:clock" className="w-8 h-8 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Waiting for Approval</h1>
          <p className="text-muted-foreground mt-2">
            Hi <strong>{session?.user?.name}</strong>, your account is pending approval by an admin.
            You&apos;ll get access once approved.
          </p>
        </div>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/auth/login" })
          }}
        >
          <button
            type="submit"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  )
}
