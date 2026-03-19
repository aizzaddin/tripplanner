"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

interface GsapEntranceOptions {
  selector?: string
  y?: number
  duration?: number
  stagger?: number
  delay?: number
  ease?: string
}

export function useGsapEntrance(options: GsapEntranceOptions = {}) {
  const {
    selector = ".gsap-enter",
    y = 22,
    duration = 0.55,
    stagger = 0.07,
    delay = 0,
    ease = "expo.out",
  } = options

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const targets = containerRef.current?.querySelectorAll(selector)
      if (!targets?.length) return
      gsap.from(targets, { y, opacity: 0, duration, stagger, delay, ease, clearProps: "all" })
    }, containerRef)

    return () => ctx.revert()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return containerRef
}
