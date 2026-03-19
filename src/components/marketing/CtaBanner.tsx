"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function CtaBanner() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([".cta-title", ".cta-sub", ".cta-btn"], {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: "expo.out",
        stagger: 0.12,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 px-4 border-t border-white/5">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="cta-title text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
          Siap trip bareng
          <br />
          <span className="text-zinc-500">tanpa ribet?</span>
        </h2>
        <p className="cta-sub text-zinc-500 text-sm mb-8">
          Tidak perlu kartu kredit. Gratis selamanya untuk trip kecil.
        </p>
        <Link
          href="/register"
          className="cta-btn inline-flex items-center gap-2 bg-white text-zinc-950 font-semibold rounded-xl px-8 py-3 hover:bg-zinc-100 transition-colors text-sm"
        >
          Daftar Sekarang — Gratis
        </Link>
      </div>
    </section>
  )
}
