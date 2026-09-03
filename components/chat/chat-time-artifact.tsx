"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
  formatLocationClockLine,
  formatOffsetVsUserTime,
  getZonedClockParts,
  type ZonedClockParts,
} from "@/lib/live-timezone-clock"
import { cn } from "@/lib/utils"

export interface TimeArtifact {
  location: string
  timezone: string
  time_24h: string
  time_12h: string
  date_label: string
  utc_offset: string
  hour: number
  minute: number
  second?: number
}

function useLiveClock(timeZone: string): ZonedClockParts {
  const [parts, setParts] = useState(() => getZonedClockParts(timeZone))

  useEffect(() => {
    setParts(getZonedClockParts(timeZone))
    const id = window.setInterval(() => {
      setParts(getZonedClockParts(timeZone))
    }, 1000)
    return () => window.clearInterval(id)
  }, [timeZone])

  return parts
}

function AnalogClockFace({
  hour,
  minute,
  second,
  className,
}: {
  hour: number
  minute: number
  second: number
  className?: string
}) {
  const hAngle = ((hour % 12) + minute / 60 + second / 3600) * 30
  const mAngle = (minute + second / 60) * 6
  const sAngle = second * 6

  return (
    <svg viewBox="0 0 100 100" className={cn("h-28 w-28 shrink-0", className)} aria-hidden>
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="1.5"
      />
      {Array.from({ length: 12 }, (_, i) => {
        const n = i === 0 ? 12 : i
        const angle = ((n % 12) * 30 - 90) * (Math.PI / 180)
        const x = 50 + Math.cos(angle) * 36
        const y = 50 + Math.sin(angle) * 36
        return (
          <text
            key={n}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7.5"
            fill="currentColor"
            fillOpacity="0.55"
            fontWeight="500"
          >
            {n}
          </text>
        )
      })}
      <line
        x1="50"
        y1="50"
        x2={50 + Math.sin((hAngle * Math.PI) / 180) * 20}
        y2={50 - Math.cos((hAngle * Math.PI) / 180) * 20}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="50"
        y1="50"
        x2={50 + Math.sin((mAngle * Math.PI) / 180) * 28}
        y2={50 - Math.cos((mAngle * Math.PI) / 180) * 28}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeOpacity="0.9"
      />
      <line
        x1="50"
        y1="50"
        x2={50 + Math.sin((sAngle * Math.PI) / 180) * 32}
        y2={50 - Math.cos((sAngle * Math.PI) / 180) * 32}
        stroke="#ef4444"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="50" cy="50" r="2" fill="currentColor" />
    </svg>
  )
}

interface ChatTimeArtifactProps {
  artifact: TimeArtifact
  className?: string
}

export function ChatTimeArtifact({ artifact, className }: ChatTimeArtifactProps) {
  const timeZone = artifact.timezone || "UTC"
  const live = useLiveClock(timeZone)

  const locationLine = useMemo(
    () => formatLocationClockLine(artifact.location, timeZone),
    [artifact.location, timeZone, live.tzAbbrev]
  )
  const offsetLine = useMemo(
    () => formatOffsetVsUserTime(timeZone),
    [timeZone, live.minute]
  )

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/50 bg-muted/35 shadow-sm",
        "dark:border-white/[0.08] dark:bg-zinc-900/55",
        className
      )}
      role="group"
      aria-label={`Live clock for ${artifact.location}`}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="min-w-0 flex-1">
          <p
            className="text-5xl font-semibold tabular-nums tracking-tight text-foreground sm:text-[3.25rem]"
            aria-live="polite"
            aria-atomic="true"
          >
            {live.time24}
          </p>
          <p className="mt-2 text-sm font-medium text-foreground/90">{locationLine}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{offsetLine}</p>
        </div>
        <div className="text-foreground/85">
          <AnalogClockFace hour={live.hour} minute={live.minute} second={live.second} />
        </div>
      </div>
    </div>
  )
}
