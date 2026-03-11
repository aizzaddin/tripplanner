"use client"

import { useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Icon } from "@iconify/react"

interface MobileNavProps {
  userName: string
  userEmail: string
  isAdmin: boolean
}

export default function MobileNav({ userName, userEmail, isAdmin }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-card border-b shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Icon icon="lucide:map-pin" className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold tracking-tight">Trip Planner</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Open menu"
        >
          <Icon icon="lucide:menu" className="w-5 h-5" />
        </button>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-card border-r z-50 flex flex-col transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="p-5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Icon icon="lucide:map-pin" className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight leading-none">Trip Planner</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Plan your adventures</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-md hover:bg-accent transition-colors"
            aria-label="Close menu"
          >
            <Icon icon="lucide:x" className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Icon icon="lucide:layout-dashboard" className="w-4 h-4" />
              Dashboard
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Icon icon="lucide:shield" className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>
        </nav>

        {/* Copyright */}
        <div className="px-4 py-2 border-t">
          <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
            © wildanaizzaddin
            <Icon icon="lucide:handshake" className="w-3 h-3" />
            claude
          </p>
        </div>

        {/* User section */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium shrink-0">
              {userName[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
          >
            <Icon icon="lucide:log-out" className="w-3.5 h-3.5" />
            Sign out
          </Button>
        </div>
      </div>
    </>
  )
}
