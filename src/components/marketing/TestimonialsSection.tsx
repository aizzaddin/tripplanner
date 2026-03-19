"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

const TESTIMONIALS = [
  {
    name: "Sarah K.",
    handle: "@sarahgoesplaces",
    avatar: "SK",
    avatarBg: "#FFE4B5",
    trip: "Japan · 6 travelers",
    quote:
      "We used TripSplit for a 3-week Japan trip with 6 friends. Zero arguments about money. That alone is worth every penny.",
  },
  {
    name: "Marcus L.",
    handle: "@marcusontheroad",
    avatar: "ML",
    avatarBg: "#E8EAFD",
    trip: "Europe solo",
    quote:
      "I've tried every travel budget app out there. TripSplit is the first one that doesn't feel like a chore to actually use.",
  },
  {
    name: "Priya & Dev",
    handle: "@priya_dev_travel",
    avatar: "PD",
    avatarBg: "#FDE8E8",
    trip: "Maldives · 2 travelers",
    quote:
      "Honeymoon planning was stressful enough already. TripSplit made the budget part actually fun. Wild, I know.",
  },
  {
    name: "Jake T.",
    handle: "@backpackerjake",
    avatar: "JT",
    avatarBg: "#D5F5E3",
    trip: "Southeast Asia · 8 months",
    quote:
      "Been backpacking SE Asia for 8 months across 7 countries. Switched currencies 20+ times. TripSplit handled every single one.",
  },
  {
    name: "Amara O.",
    handle: "@amarawanders",
    avatar: "AO",
    avatarBg: "#F0E6FF",
    trip: "Morocco · 4 travelers",
    quote:
      "The split feature saved our friendship. Seriously. We almost had a falling out over some restaurant bills. TripSplit fixed it.",
  },
  {
    name: "Chen & Family",
    handle: "@thechentrip",
    avatar: "CF",
    avatarBg: "#FFF5D6",
    trip: "New Zealand · 5 travelers",
    quote:
      "Finally a budget app that my parents can actually use. Clean, simple, no confusion. The whole family loves it.",
  },
]

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.from(".testi-headline", {
        y: 30, opacity: 0, duration: 0.8, ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      })
      gsap.from(".testi-card", {
        y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "expo.out",
        scrollTrigger: { trigger: ".testi-grid", start: "top 82%" },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-white py-28 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="testi-headline mb-16">
          <p
            className="text-[11px] font-black tracking-[0.22em] text-zinc-400 uppercase mb-4"
            style={{ fontFamily: "var(--font-marketing)" }}
          >
            What travelers say
          </p>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-black text-zinc-900 leading-[1.05] max-w-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            We don&apos;t gossip but some travelers have been{" "}
            <span className="italic" style={{ color: "#3D2C8D" }}>
              saying things.
            </span>
          </h2>
        </div>

        {/* Cards */}
        <div className="testi-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="testi-card rounded-2xl p-7 border border-zinc-100 hover:border-zinc-200 hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Big quote mark */}
              <div
                className="text-5xl leading-none mb-4 select-none"
                style={{ color: "#E8E8E8", fontFamily: "var(--font-display)" }}
              >
                &ldquo;
              </div>

              {/* Quote */}
              <p
                className="text-zinc-700 text-sm leading-relaxed mb-6"
                style={{ fontFamily: "var(--font-marketing)" }}
              >
                {t.quote}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-zinc-700 shrink-0"
                  style={{ background: t.avatarBg, fontFamily: "var(--font-marketing)" }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div
                    className="text-sm font-semibold text-zinc-900"
                    style={{ fontFamily: "var(--font-marketing)" }}
                  >
                    {t.name}
                  </div>
                  <div
                    className="text-xs text-zinc-400"
                    style={{ fontFamily: "var(--font-marketing)" }}
                  >
                    {t.trip}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
