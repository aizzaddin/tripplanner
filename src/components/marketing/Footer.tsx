import Link from "next/link"
import { Icon } from "@iconify/react"

const LINKS: Record<string, string[]> = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Press"],
  Support: ["Help Center", "Documentation", "Contact", "Status"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookies"],
}

export default function Footer() {
  return (
    <footer className="bg-zinc-950 pt-20 pb-10 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-16 border-b border-zinc-800">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "#B8A8E8" }}
              >
                <Icon icon="lucide:split" className="w-3.5 h-3.5 text-white" />
              </div>
              <span
                className="font-black text-sm text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                TripSplit
              </span>
            </Link>
            <p
              className="text-sm text-zinc-500 leading-relaxed"
              style={{ fontFamily: "var(--font-marketing)" }}
            >
              Smart trip budgeting and cost-splitting for modern travelers.
            </p>
            <div className="flex gap-3 mt-5">
              {["twitter", "instagram", "github"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 hover:text-white hover:bg-zinc-800 transition-all"
                >
                  <Icon icon={`lucide:${s}`} className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p
                className="text-[10px] font-black tracking-[0.18em] uppercase text-zinc-500 mb-4"
                style={{ fontFamily: "var(--font-marketing)" }}
              >
                {group}
              </p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-zinc-500 hover:text-white transition-colors"
                      style={{ fontFamily: "var(--font-marketing)" }}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-xs text-zinc-600"
            style={{ fontFamily: "var(--font-marketing)" }}
          >
            © {new Date().getFullYear()} TripSplit. All rights reserved.
          </p>
          <p
            className="text-xs text-zinc-600"
            style={{ fontFamily: "var(--font-marketing)" }}
          >
            Made with ✈️ for travelers everywhere.
          </p>
        </div>
      </div>
    </footer>
  )
}
