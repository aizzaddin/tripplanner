"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Icon } from "@iconify/react"

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.06)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "#B8A8E8" }}
            >
              <Icon icon="lucide:split" className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-black text-base tracking-tight text-zinc-900"
              style={{ fontFamily: "var(--font-display)" }}
            >
              TripSplit
            </span>
          </Link>

          {/* Nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                style={{ fontFamily: "var(--font-marketing)" }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:block text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
              style={{ fontFamily: "var(--font-marketing)" }}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-bold rounded-full px-5 py-2 text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
              style={{ background: "#3D2C8D", fontFamily: "var(--font-marketing)" }}
            >
              Start free
            </Link>
            {/* Mobile menu button */}
            <button
              className="md:hidden p-1 text-zinc-600"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <Icon icon={mobileOpen ? "lucide:x" : "lucide:menu"} className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden border-t border-zinc-100 bg-white/98 backdrop-blur-sm px-5 py-4 space-y-3"
          style={{ fontFamily: "var(--font-marketing)" }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-sm text-zinc-600 hover:text-zinc-900 py-1.5"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 border-t border-zinc-100 flex gap-3">
            <Link href="/login" className="text-sm text-zinc-500 py-1.5">
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-bold rounded-full px-5 py-2 text-white"
              style={{ background: "#3D2C8D" }}
            >
              Start free
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
