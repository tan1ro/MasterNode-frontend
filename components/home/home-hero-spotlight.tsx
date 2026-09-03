"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type Point = { x: number; y: number }

export function HomeHeroSpotlight({ className }: { className?: string }) {
  const [position, setPosition] = useState<Point>({ x: 50, y: 35 })

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 100
      const y = (event.clientY / window.innerHeight) * 100
      setPosition({ x, y })
    }

    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div
        className="absolute inset-0 transition-[background] duration-300"
        style={{
          background: `radial-gradient(42rem 42rem at ${position.x}% ${position.y}%, hsl(var(--oc)/0.16), transparent 62%)`,
        }}
      />
      <div className="absolute -left-28 top-16 h-56 w-56 rounded-full bg-cyan/12 blur-3xl" />
      <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-amber/12 blur-3xl" />
    </div>
  )
}
