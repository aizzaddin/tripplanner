"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

type CellVal = true | false | "partial"

const ROWS: { feature: string; tripsplit: CellVal; sheets: CellVal; manual: CellVal }[] = [
  { feature: "Real-time cost tracking",       tripsplit: true,      sheets: false,     manual: false },
  { feature: "Automatic split calculations",  tripsplit: true,      sheets: false,     manual: false },
  { feature: "Multi-currency support",        tripsplit: true,      sheets: "partial", manual: false },
  { feature: "Budget vs. actual alerts",      tripsplit: true,      sheets: false,     manual: false },
  { feature: "Settle debts in one tap",       tripsplit: true,      sheets: false,     manual: false },
  { feature: "Mobile-friendly",               tripsplit: true,      sheets: "partial", manual: true  },
  { feature: "Collaborative editing",         tripsplit: true,      sheets: "partial", manual: false },
  { feature: "Works offline",                 tripsplit: "partial", sheets: true,      manual: true  },
]

function Cell({ val }: { val: CellVal }) {
  if (val === true)
    return (
      <span
        className="inline-flex w-7 h-7 rounded-full items-center justify-center text-white text-xs font-bold"
        style={{ background: "#B8A8E8" }}
      >
        ✓
      </span>
    )
  if (val === "partial")
    return (
      <span className="inline-flex w-7 h-7 rounded-full items-center justify-center text-zinc-400 text-xs border border-zinc-200">
        ≈
      </span>
    )
  return (
    <span className="inline-flex w-7 h-7 rounded-full items-center justify-center text-zinc-300 text-xs">
      ✕
    </span>
  )
}

export default function ComparisonSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      gsap.from(".comp-title", {
        y: 30, opacity: 0, duration: 0.8, ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
      })
      gsap.from(".comp-table", {
        y: 40, opacity: 0, duration: 0.9, ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-white py-28 px-5 sm:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="comp-title text-center mb-16">
          <p
            className="text-[11px] font-black tracking-[0.22em] text-zinc-400 uppercase mb-4"
            style={{ fontFamily: "var(--font-marketing)" }}
          >
            Why TripSplit?
          </p>
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-black text-zinc-900 leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Stop juggling tabs.
            <br />
            <span className="italic" style={{ color: "#3D2C8D" }}>
              Start traveling.
            </span>
          </h2>
          <p
            className="text-zinc-500 text-lg mt-5 max-w-lg mx-auto"
            style={{ fontFamily: "var(--font-marketing)" }}
          >
            We compared how TripSplit stacks up against the alternatives.
            (Spoiler: it&apos;s not even close.)
          </p>
        </div>

        {/* Table */}
        <div className="comp-table overflow-hidden rounded-2xl border border-zinc-100 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr style={{ background: "#FAFAFA" }}>
                  <th
                    className="text-left py-4 px-6 text-xs font-medium text-zinc-400 w-1/2"
                    style={{ fontFamily: "var(--font-marketing)" }}
                  >
                    Feature
                  </th>
                  <th className="py-4 px-4 text-center">
                    <span
                      className="text-xs font-black text-zinc-900 px-3 py-1 rounded-full"
                      style={{ background: "#B8A8E8", color: "white", fontFamily: "var(--font-marketing)" }}
                    >
                      TripSplit
                    </span>
                  </th>
                  <th
                    className="py-4 px-4 text-xs font-medium text-zinc-400 text-center"
                    style={{ fontFamily: "var(--font-marketing)" }}
                  >
                    Spreadsheets
                  </th>
                  <th
                    className="py-4 px-4 text-xs font-medium text-zinc-400 text-center"
                    style={{ fontFamily: "var(--font-marketing)" }}
                  >
                    Manual
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className="border-t border-zinc-50 transition-colors hover:bg-zinc-50/60"
                  >
                    <td
                      className="py-4 px-6 text-sm text-zinc-700"
                      style={{ fontFamily: "var(--font-marketing)" }}
                    >
                      {row.feature}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Cell val={row.tripsplit} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Cell val={row.sheets} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Cell val={row.manual} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div
          className="mt-4 flex items-center gap-6 text-xs text-zinc-400 justify-end"
          style={{ fontFamily: "var(--font-marketing)" }}
        >
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex w-5 h-5 rounded-full items-center justify-center text-white text-[10px]"
              style={{ background: "#B8A8E8" }}
            >
              ✓
            </span>
            Full support
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex w-5 h-5 rounded-full items-center justify-center text-zinc-400 text-[10px] border border-zinc-200">
              ≈
            </span>
            Partial
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex w-5 h-5 rounded-full items-center justify-center text-zinc-300 text-[10px]">
              ✕
            </span>
            Not available
          </div>
        </div>
      </div>
    </section>
  )
}
