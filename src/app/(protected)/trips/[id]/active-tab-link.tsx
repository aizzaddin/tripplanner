"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icon } from "@iconify/react"

interface ActiveTabLinkProps {
  href: string
  label: string
  icon: string
}

export default function ActiveTabLink({ href, label, icon }: ActiveTabLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium rounded-md transition-colors shrink-0 whitespace-nowrap",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <Icon icon={icon} className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  )
}
