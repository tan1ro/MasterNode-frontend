"use client"

import { useEffect, useRef, useState } from "react"
import { Bot, Gauge, ShieldCheck, Workflow } from "lucide-react"
import { cn } from "@/lib/utils"

const ITEMS = [
  {
    title: "Parallel Agents",
    detail: "Split one prompt into specialized workers.",
    icon: Bot,
    accent: "text-oc border-oc/20 bg-oc/10",
  },
  {
    title: "Workflow Visibility",
    detail: "Track every stage from decomposition to supervision.",
    icon: Workflow,
    accent: "text-cyan border-cyan/20 bg-cyan/10",
  },
  {
    title: "Fast Execution",
    detail: "Reduce cycle time with concurrent orchestration.",
    icon: Gauge,
    accent: "text-amber border-amber/20 bg-amber/10",
  },
  {
    title: "Secure by Design",
    detail: "Tenant-safe execution with guardrails and audits.",
    icon: ShieldCheck,
    accent: "text-emerald border-emerald/20 bg-emerald/10",
  },
]

export function HomeCapabilityStrip({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={cn("grid grid-cols-1 gap-3 md:grid-cols-2", className)}>
      {ITEMS.map((item, index) => {
        const Icon = item.icon
        return (
          <div
            key={item.title}
            className={cn(
              "rounded-md border border-border bg-background/80 p-4 transition-all duration-500 sm:p-5",
              visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            )}
            style={{ transitionDelay: `${index * 80}ms` }}
          >
            <div className="flex items-start gap-3">
              <span className={cn("rounded-md border p-2", item.accent)}>
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-medium text-foreground sm:text-base">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {item.detail}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
