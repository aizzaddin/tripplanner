"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for solo travelers or a one-off trip.",
    features: [
      "1 active trip",
      "Up to 4 travelers",
      "Basic expense tracking",
      "USD only",
    ],
    cta: "Start free",
    href: "/register",
    highlight: false,
  },
  {
    name: "Explorer",
    price: "$6",
    period: "/ month",
    desc: "For frequent travelers who want the full experience.",
    badge: "Most Popular",
    features: [
      "Unlimited trips",
      "Unlimited travelers",
      "Multi-currency (100+)",
      "Budget alerts & insights",
      "CSV & PDF export",
      "Priority support",
    ],
    cta: "Start 14-day trial",
    href: "/register",
    highlight: true,
  },
  {
    name: "Group",
    price: "$12",
    period: "/ month",
    desc: "For travel agencies and group coordinators.",
    features: [
      "Everything in Explorer",
      "Team dashboard",
      "Custom categories",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact us",
    href: "/register",
    highlight: false,
  },
]

export default function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.from(".price-header", {
        y: 30, opacity: 0, duration: 0.8, ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      })
      gsap.from(".price-card", {
        y: 50, opacity: 0, duration: 0.85, stagger: 0.15, ease: "expo.out",
        scrollTrigger: { trigger: ".price-grid", start: "top 80%" },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="py-28 px-5 sm:px-8"
      style={{ background: "#F7F5F2" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="price-header text-center mb-16">
          <p
            className="text-[11px] font-black tracking-[0.22em] text-zinc-400 uppercase mb-4"
            style={{ fontFamily: "var(--font-marketing)" }}
          >
            Pricing
          </p>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-black text-zinc-900 leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Simple, honest pricing.
          </h2>
          <p
            className="text-zinc-500 text-lg mt-4"
            style={{ fontFamily: "var(--font-marketing)" }}
          >
            No hidden fees. Just like your trip budget should be.
          </p>
        </div>

        {/* Plans */}
        <div className="price-grid grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="price-card relative rounded-2xl p-8 hover:-translate-y-1 transition-all duration-300"
              style={
                plan.highlight
                  ? { background: "#3D2C8D", boxShadow: "0 24px 48px rgba(61,44,141,0.25)" }
                  : { background: "white", border: "1px solid #E8E8E8" }
              }
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3.5 py-1 rounded-full text-white whitespace-nowrap"
                  style={{ background: "#B8A8E8", fontFamily: "var(--font-marketing)" }}
                >
                  {plan.badge}
                </div>
              )}

              {/* Plan name */}
              <p
                className="text-[10px] font-black tracking-[0.22em] uppercase mb-4"
                style={{
                  fontFamily: "var(--font-marketing)",
                  color: plan.highlight ? "rgba(255,255,255,0.5)" : "#9CA3AF",
                }}
              >
                {plan.name}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                <span
                  className="text-5xl font-black tracking-tight"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: plan.highlight ? "white" : "#111",
                  }}
                >
                  {plan.price}
                </span>
                <span
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-marketing)",
                    color: plan.highlight ? "rgba(255,255,255,0.5)" : "#9CA3AF",
                  }}
                >
                  {plan.period}
                </span>
              </div>

              <p
                className="text-sm mb-7"
                style={{
                  fontFamily: "var(--font-marketing)",
                  color: plan.highlight ? "rgba(255,255,255,0.65)" : "#6B7280",
                }}
              >
                {plan.desc}
              </p>

              {/* Divider */}
              <div
                className="mb-6 h-px"
                style={{ background: plan.highlight ? "rgba(255,255,255,0.12)" : "#F0F0F0" }}
              />

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-px"
                      style={
                        plan.highlight
                          ? { background: "rgba(255,255,255,0.15)", color: "white" }
                          : { background: "#F0EDF8", color: "#6B5BBF" }
                      }
                    >
                      ✓
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-marketing)",
                        color: plan.highlight ? "rgba(255,255,255,0.75)" : "#374151",
                      }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className="block text-center rounded-full py-3 text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02] active:scale-95"
                style={
                  plan.highlight
                    ? { background: "white", color: "#3D2C8D", fontFamily: "var(--font-marketing)" }
                    : { background: "#3D2C8D", color: "white", fontFamily: "var(--font-marketing)" }
                }
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p
          className="text-center text-xs text-zinc-400 mt-8"
          style={{ fontFamily: "var(--font-marketing)" }}
        >
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  )
}
