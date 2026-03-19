"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

const HOW_BG = "#C94B3B"

const GRAIN_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E"

const STEPS = [
  {
    num: 1,
    icon: "📍",
    title: "Add your destination",
    desc: "Tell us where you're going, when, and who's coming along. Takes about 30 seconds. No sign-up required for your first trip.",
  },
  {
    num: 2,
    icon: "💰",
    title: "Input your budget & travelers",
    desc: "Enter your total budget, choose expense categories, set how costs are split. Everyone gets invited via a link.",
  },
  {
    num: 3,
    icon: "📊",
    title: "Get your full cost breakdown",
    desc: "See exactly what each person owes, track spending live, get alerts when you're going over budget, and settle up with one tap.",
  },
]

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.from(".how-headline", {
        y: 40, opacity: 0, duration: 0.9, ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      })
      gsap.from(".step-card", {
        x: 30, opacity: 0, duration: 0.85, stagger: 0.18, ease: "expo.out",
        scrollTrigger: { trigger: ".steps-col", start: "top 78%" },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative overflow-hidden py-28 px-5 sm:px-8"
      style={{ background: HOW_BG }}
    >
      {/* Grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          backgroundImage: `url("${GRAIN_URL}")`,
          backgroundRepeat: "repeat",
          backgroundSize: "300px",
          opacity: 0.06,
          mixBlendMode: "overlay",
        }}
      />

      <div className="relative z-[2] max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: headline */}
          <div className="how-headline">
            <p
              className="text-[11px] font-black tracking-[0.22em] text-red-200/70 uppercase mb-6"
              style={{ fontFamily: "var(--font-marketing)" }}
            >
              How it works
            </p>
            <h2
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.0] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              From idea to
              <br />
              <span style={{ color: "#FFD580" }}>packed bags</span>
              <br />
              in 3 steps.
            </h2>
            <p
              className="text-red-100/75 text-lg mt-7 max-w-sm leading-relaxed"
              style={{ fontFamily: "var(--font-marketing)" }}
            >
              No complicated setup. No spreadsheets. No arguments.
              Just clear, honest numbers for your next adventure.
            </p>

            {/* Mini stat */}
            <div className="mt-10 flex gap-8">
              {[
                { val: "2,400+", label: "travelers" },
                { val: "48", label: "countries" },
                { val: "$2.1M", label: "trips planned" },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    className="text-2xl font-black text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {s.val}
                  </div>
                  <div
                    className="text-xs text-red-200/70 mt-0.5"
                    style={{ fontFamily: "var(--font-marketing)" }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: steps */}
          <div className="steps-col space-y-4">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="step-card bg-white rounded-2xl p-6 shadow-2xl shadow-black/25"
              >
                <div className="flex items-start gap-5">
                  {/* Number badge */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0 mt-0.5"
                    style={{ background: HOW_BG, fontFamily: "var(--font-display)" }}
                  >
                    {step.num}
                  </div>
                  <div>
                    <div className="text-xl mb-2">{step.icon}</div>
                    <h3
                      className="font-black text-zinc-900 text-lg mb-1.5 leading-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-zinc-500 text-sm leading-relaxed"
                      style={{ fontFamily: "var(--font-marketing)" }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
