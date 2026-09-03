"use client"

import { Code2, FileCode2, Layers, PenLine } from "lucide-react"
import { cn } from "@/lib/utils"

function ReactMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="2.2" fill="currentColor" />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        transform="rotate(60 12 12)"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        transform="rotate(120 12 12)"
      />
    </svg>
  )
}

function VueMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 3.5 3 20h4.5l1.5-2.6h6l1.5 2.6H21L12 3.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 9.2 9.8 13h4.4L12 9.2z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  )
}

function SvelteMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M17.2 19.5c-1.4 1.1-3.4 1.2-5 .2l-6.8-4.2c-1.6-1-2.2-3-1.5-4.7.4-.9 1.1-1.6 2-2l6.8-4.2c1.6-1 3.6-.9 5 .2 1.4 1.1 2 2.9 1.5 4.6l-1.2 3.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="16.5" cy="7.8" r="1.4" fill="currentColor" />
    </svg>
  )
}

export type PlanOptionVisualKind =
  | "react"
  | "vue"
  | "svelte"
  | "vanilla"
  | "code"
  | "layers"
  | "other"
  | "letter"

export function inferPlanOptionVisualKind(id: string, label: string): PlanOptionVisualKind {
  const blob = `${id} ${label}`.toLowerCase()
  if (id === "other" || blob.includes("specify your own") || /^other\b/.test(blob)) {
    return "other"
  }
  if (blob.includes("react") || blob.includes("next.js") || blob.includes("nextjs")) {
    return "react"
  }
  if (blob.includes("vue")) return "vue"
  if (blob.includes("svelte")) return "svelte"
  if (
    blob.includes("vanilla") ||
    blob.includes("html") ||
    blob.includes("css") ||
    blob.includes("no framework")
  ) {
    return "vanilla"
  }
  if (blob.includes("angular") || blob.includes("framework")) return "layers"
  if (blob.includes("code") || blob.includes("stack")) return "code"
  return "letter"
}

export function PlanOptionVisual({
  optionId,
  label,
  selected,
  className,
}: {
  optionId: string
  label: string
  selected?: boolean
  className?: string
}) {
  const kind = inferPlanOptionVisualKind(optionId, label)
  const iconClass = cn("h-5 w-5", className)

  const tint = selected ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"

  if (kind === "react") {
    return <ReactMark className={cn(iconClass, "text-sky-400")} />
  }
  if (kind === "vue") {
    return <VueMark className={cn(iconClass, "text-emerald-400")} />
  }
  if (kind === "svelte") {
    return <SvelteMark className={cn(iconClass, "text-orange-400")} />
  }
  if (kind === "vanilla") {
    return <FileCode2 className={cn(iconClass, tint)} />
  }
  if (kind === "layers") {
    return <Layers className={cn(iconClass, tint)} />
  }
  if (kind === "code") {
    return <Code2 className={cn(iconClass, tint)} />
  }
  if (kind === "other") {
    return <PenLine className={cn(iconClass, tint)} />
  }

  const letter =
    optionId.length === 1
      ? optionId.toUpperCase()
      : optionId.slice(0, 1).toUpperCase()

  return (
    <span
      className={cn(
        "text-xs font-semibold tabular-nums",
        selected ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
      )}
    >
      {letter}
    </span>
  )
}
