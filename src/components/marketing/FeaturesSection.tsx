"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

const FEATURES = [
  {
    tag: "FAST PLANNING",
    icon: "⚡",
    headline: "Budget in minutes,\nnot spreadsheets.",
    body: "Set a trip budget, add travelers, and get a full cost breakdown before you even pack your bags.",
  },
  {
    tag: "NO HIDDEN FEES",
    icon: "💸",
    headline: "Split fairly.\nEvery single time.",
    body: "Auto-split equally or by custom percentages. Everyone sees exactly what they owe — no awkward conversations.",
  },
  {
    tag: "100% YOURS",
    icon: "🌍",
    headline: "100+ currencies.\nOne dashboard.",
    body: "Travel anywhere on the planet. TripSplit handles currency conversion automatically so you're always in control.",
  },
]

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.from(".feat-intro", {
        y: 30, opacity: 0, duration: 0.8, ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      })
      gsap.from(".feat-card", {
        y: 50, opacity: 0, duration: 0.85, stagger: 0.15, ease: "expo.out",
        scrollTrigger: { trigger: ".feat-grid", start: "top 82%" },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="features" ref={sectionRef} className="bg-white pt-28 pb-24 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Intro */}
        <div className="feat-intro text-center mb-20">
          <p
            className="text-[11px] font-black tracking-[0.22em] text-zinc-400 uppercase mb-5"
            style={{ fontFamily: "var(--font-marketing)" }}
          >
            All of the savings. None of the stress.
          </p>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-black text-zinc-900 leading-[1.05] tracking-tight max-w-3xl mx-auto"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Trip planning that actually{" "}
            <span className="italic" style={{ color: "#3D2C8D" }}>
              makes sense.
            </span>
          </h2>
          <p
            className="text-zinc-500 text-lg mt-5 max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: "var(--font-marketing)" }}
          >
            Stop guessing, stop arguing about money, stop losing receipts.
            TripSplit keeps every traveler on the same page.
          </p>
        </div>

        {/* Feature grid */}
        <div className="feat-grid grid grid-cols-1 md:grid-cols-3 gap-10">
          {FEATURES.map((f) => (
            <div key={f.tag} className="feat-card group">
              <p
                className="text-[10px] font-black tracking-[0.22em] text-zinc-300 uppercase mb-5"
                style={{ fontFamily: "var(--font-marketing)" }}
              >
                {f.tag}
              </p>
              <div className="text-4xl mb-5">{f.icon}</div>
              <h3
                className="text-2xl font-black text-zinc-900 leading-tight mb-3 whitespace-pre-line"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {f.headline}
              </h3>
              <div
                className="h-0.5 mb-4 rounded-full transition-all duration-500 group-hover:w-14"
                style={{ width: "2rem", background: "#B8A8E8" }}
              />
              <p
                className="text-zinc-500 text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-marketing)" }}
              >
                {f.body}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-indigo-900/10"
            style={{ background: "#3D2C8D", fontFamily: "var(--font-marketing)" }}
          >
            Start planning for free →
          </Link>
          <p
            className="text-zinc-400 text-xs mt-3"
            style={{ fontFamily: "var(--font-marketing)" }}
          >
            No credit card required. Free forever on solo trips.
          </p>
        </div>
      </div>
    </section>
  )
}
