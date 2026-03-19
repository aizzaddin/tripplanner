"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"

const HERO_BG = "#7BAFC4"

const GRAIN_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E"

const TRIP_CARDS = [
  {
    title: "Bali Trip 2024",
    sub: "7 nights · 4 travelers",
    budget: "$2,400",
    spent: "$1,890",
    pct: 79,
    icon: "🌴",
    accent: "#FFE4B5",
    items: [
      { label: "Flights", val: "$420" },
      { label: "Hotel", val: "$860" },
      { label: "Food", val: "$380" },
    ],
    animation: "float-a 5s ease-in-out infinite",
  },
  {
    title: "Tokyo Adventure",
    sub: "5 nights · 2 travelers",
    budget: "$3,200",
    spent: "$2,100",
    pct: 66,
    icon: "🗼",
    accent: "#E8EAFD",
    items: [
      { label: "Flights", val: "$980" },
      { label: "Hotel", val: "$720" },
      { label: "Activities", val: "$340" },
    ],
    animation: "float-b 6s ease-in-out infinite",
  },
  {
    title: "Euro Rail Trip",
    sub: "14 nights · 3 travelers",
    budget: "$5,600",
    spent: "$4,200",
    pct: 75,
    icon: "🏰",
    accent: "#FDE8E8",
    items: [
      { label: "Rail pass", val: "$890" },
      { label: "Airbnb", val: "$1,400" },
      { label: "Dining", val: "$680" },
    ],
    animation: "float-c 5.5s ease-in-out infinite",
  },
]

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } })
      tl.from(".hero-badge", { y: 16, opacity: 0, duration: 0.7 })
        .from(".hero-word", { y: 60, opacity: 0, duration: 0.9, stagger: 0.08 }, "-=0.4")
        .from(".hero-sub", { y: 20, opacity: 0, duration: 0.7 }, "-=0.3")
        .from(".hero-cta-btn", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.4")
        .from(".hero-card", { y: 100, opacity: 0, duration: 1, stagger: 0.12, ease: "expo.out" }, "-=0.5")
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ backgroundColor: HERO_BG }}
    >
      {/* Grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          backgroundImage: `url("${GRAIN_URL}")`,
          backgroundRepeat: "repeat",
          backgroundSize: "300px",
          opacity: 0.045,
          mixBlendMode: "overlay",
        }}
      />

      {/* Hero content */}
      <div className="relative z-[2] max-w-5xl mx-auto px-5 sm:px-8 pt-16 pb-12 text-center">
        {/* Social proof badge */}
        <div
          className="hero-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-zinc-800 mb-10 border border-white/40"
          style={{ background: "rgba(255,255,255,0.35)", backdropFilter: "blur(8px)", fontFamily: "var(--font-marketing)" }}
        >
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 animate-pulse" />
          Used by 2,400+ travelers across 48 countries
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-black leading-[1.0] tracking-tight text-zinc-900 mb-8"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <span className="hero-word block overflow-hidden pb-1">
            <span className="block">You deserve to</span>
          </span>
          <span className="hero-word block overflow-hidden pb-1">
            <span className="block">spend less time</span>
          </span>
          <span className="hero-word block overflow-hidden pb-1">
            <span className="block">
              guessing{" "}
              <span className="relative inline-block">
                <span className="relative z-10">how much.</span>
                <span
                  className="absolute -bottom-0.5 left-0 right-0 h-[38%] -z-0 -skew-x-2 rounded-sm"
                  style={{ background: "#B8A8E8", opacity: 0.5 }}
                />
              </span>
            </span>
          </span>
          <span
            className="hero-word block overflow-hidden pb-1"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            <span className="block">
              Or{" "}
              <span
                className="underline decoration-4 underline-offset-4"
                style={{ textDecorationColor: "rgba(255,255,255,0.5)", textDecorationStyle: "wavy" }}
              >
                who owes what.
              </span>
            </span>
          </span>
          <span
            className="hero-word block overflow-hidden pb-1"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            <span className="block">
              Or even{" "}
              <span
                className="underline decoration-4 underline-offset-4"
                style={{ textDecorationColor: "rgba(255,255,255,0.5)", textDecorationStyle: "wavy" }}
              >
                if you can afford it.
              </span>
            </span>
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="hero-sub text-lg sm:text-xl text-zinc-700 max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ fontFamily: "var(--font-marketing)" }}
        >
          TripSplit plans every dollar before you go, splits costs between travelers
          automatically, and tracks spending live — in any currency.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="hero-cta-btn w-full sm:w-auto rounded-full px-8 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-900/20 hover:opacity-90 hover:scale-[1.02] active:scale-95"
            style={{ background: "#3D2C8D", fontFamily: "var(--font-marketing)" }}
          >
            Plan your first trip free →
          </Link>
          <a
            href="#how-it-works"
            className="hero-cta-btn w-full sm:w-auto rounded-full px-8 py-4 text-sm font-medium text-zinc-800 border border-white/50 hover:bg-white/30"
            style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", fontFamily: "var(--font-marketing)" }}
          >
            See how it works ↓
          </a>
        </div>
      </div>

      {/* Floating cards */}
      <div className="relative z-[2] max-w-5xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TRIP_CARDS.map((card) => (
            <div
              key={card.title}
              className="hero-card bg-white rounded-2xl p-5 shadow-2xl shadow-black/15"
              style={{ animation: card.animation }}
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-2xl mb-1">{card.icon}</div>
                  <div
                    className="font-black text-zinc-900 text-sm leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {card.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5" style={{ fontFamily: "var(--font-marketing)" }}>
                    {card.sub}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-zinc-400 mb-0.5" style={{ fontFamily: "var(--font-marketing)" }}>Budget</div>
                  <div className="text-sm font-bold text-zinc-900" style={{ fontFamily: "var(--font-display)" }}>
                    {card.budget}
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1.5" style={{ fontFamily: "var(--font-marketing)" }}>
                  <span>Spent: {card.spent}</span>
                  <span>{card.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F0F0F0" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${card.pct}%`,
                      background: card.pct > 85 ? "#D94F3D" : "#B8A8E8",
                    }}
                  />
                </div>
              </div>

              {/* Line items */}
              <div className="space-y-1.5">
                {card.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#B8A8E8" }} />
                      <span className="text-[11px] text-zinc-400" style={{ fontFamily: "var(--font-marketing)" }}>
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-700" style={{ fontFamily: "var(--font-marketing)" }}>
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Settled badge */}
              <div className="mt-4 pt-3 border-t border-zinc-50 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400" style={{ fontFamily: "var(--font-marketing)" }}>Split between travelers</span>
                <span
                  className="text-[10px] font-bold rounded-full px-2 py-0.5 text-white"
                  style={{ background: "#B8A8E8", fontFamily: "var(--font-marketing)" }}
                >
                  Auto-split ✓
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade to white */}
      <div
        className="relative z-[2] h-24 mt-0"
        style={{ background: "linear-gradient(to bottom, transparent, white)" }}
      />
    </section>
  )
}
