"use client"

import { useState } from "react"
import Link from "next/link"

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div
      className="relative flex items-center justify-center gap-3 px-10 py-2.5 text-sm font-medium text-white"
      style={{
        background: "linear-gradient(90deg, #D94F3D 0%, #E8667A 50%, #D94F3D 100%)",
        fontFamily: "var(--font-marketing)",
      }}
    >
      <span className="hidden sm:block">✨ Multi-currency support is now live!</span>
      <span className="sm:hidden">✨ Multi-currency now live!</span>
      <Link
        href="/register"
        className="underline underline-offset-2 font-semibold hover:opacity-80 whitespace-nowrap"
      >
        Try it free →
      </Link>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-xl leading-none w-6 h-6 flex items-center justify-center"
        aria-label="Dismiss announcement"
      >
        ×
      </button>
    </div>
  )
}
