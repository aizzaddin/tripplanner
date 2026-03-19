"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

const WORDS = ["adventurers.", "couples.", "families.", "backpackers.", "digital nomads."]

export default function TextCycleSection() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % WORDS.length)
        setVisible(true)
      }, 380)
    }, 2600)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.from(".cycle-content", {
        y: 40, opacity: 0, duration: 0.9, ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-28 px-5 sm:px-8 overflow-hidden"
      style={{ background: "#F2EBD9" }}
    >
      {/* Grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px",
          opacity: 0.03,
        }}
      />

      <div className="cycle-content relative max-w-5xl mx-auto text-center">
        <p
          className="text-[11px] font-black tracking-[0.22em] text-amber-700/60 uppercase mb-8"
          style={{ fontFamily: "var(--font-marketing)" }}
        >
          Built for every kind of trip
        </p>

        <h2
          className="text-5xl sm:text-6xl md:text-7xl font-black text-zinc-900 leading-[1.05] mb-10"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Plan trips for the—
          <br />
          <span
            className="inline-block transition-all duration-300"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(10px)",
              color: "#6B5BBF",
              minWidth: "1ch",
            }}
          >
            {WORDS[index]}
          </span>
        </h2>

        <p
          className="text-zinc-600 text-lg max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ fontFamily: "var(--font-marketing)" }}
        >
          Whether you&apos;re solo, traveling with friends, or coordinating a
          family reunion — TripSplit works for every kind of journey.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto rounded-full px-8 py-4 text-sm font-bold text-white hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all"
            style={{ background: "#3D2C8D", fontFamily: "var(--font-marketing)" }}
          >
            Get started free →
          </Link>
          <a
            href="#pricing"
            className="w-full sm:w-auto rounded-full px-8 py-4 text-sm font-medium text-zinc-700 border border-zinc-300 hover:border-zinc-500 transition-all"
            style={{ fontFamily: "var(--font-marketing)" }}
          >
            See pricing
          </a>
        </div>
      </div>
    </section>
  )
}
