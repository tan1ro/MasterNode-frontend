"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Bot, GitBranch, Search, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { quotaExceededBodyText, type CreditQuotaExceededPayload } from "@/lib/chat-quota-error"
import { cn } from "@/lib/utils"

const UPGRADE_FEATURES = [
  {
    icon: GitBranch,
    title: "Parallel agents",
    description: "Hand off research, code, and planning so you can focus elsewhere.",
    mock: "pipeline",
  },
  {
    icon: Bot,
    title: "Code & tasks",
    description: "Build, debug, and ship by describing what you need.",
    mock: "code",
  },
  {
    icon: Upload,
    title: "RAG knowledge",
    description: "Ground answers in your documents with a larger library.",
    mock: "docs",
  },
  {
    icon: Search,
    title: "Web search",
    description: "Fresh sources in chat, without leaving the thread.",
    mock: "search",
  },
] as const

function FeatureMock({ kind }: { kind: (typeof UPGRADE_FEATURES)[number]["mock"] }) {
  if (kind === "code") {
    return (
      <div className="flex h-[4.75rem] flex-col justify-end rounded-lg bg-black/40 px-2.5 py-2 font-mono text-[9px] leading-snug text-emerald-300/90">
        <p className="text-white/55">&gt; Fix the auth bug in signup</p>
        <p className="mt-1 text-amber/80">* Contemplating...</p>
      </div>
    )
  }
  if (kind === "pipeline") {
    return (
      <div className="flex h-[4.75rem] items-end gap-1 rounded-lg bg-black/40 px-2.5 py-2">
        {["Master", "Agents", "Merge"].map((label, i) => (
          <span
            key={label}
            className={cn(
              "flex-1 rounded-md border border-white/10 px-1 py-1.5 text-center text-[8px] font-medium text-white/70",
              i === 1 && "bg-violet-500/25 text-violet-100"
            )}
          >
            {label}
          </span>
        ))}
      </div>
    )
  }
  if (kind === "docs") {
    return (
      <div className="flex h-[4.75rem] flex-col justify-center gap-1 rounded-lg bg-black/40 px-2.5 py-2">
        <span className="h-1.5 w-4/5 rounded-full bg-white/25" />
        <span className="h-1.5 w-3/5 rounded-full bg-white/15" />
        <span className="h-1.5 w-2/3 rounded-full bg-amber/40" />
      </div>
    )
  }
  return (
    <div className="flex h-[4.75rem] items-center justify-center rounded-lg bg-black/40">
      <Search className="h-6 w-6 text-white/50" strokeWidth={1.5} aria-hidden />
    </div>
  )
}

interface ChatQuotaExceededDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExplorePlans: () => void
  payload?: CreditQuotaExceededPayload | null
  windowHours?: number
}

export function ChatQuotaExceededDialog({
  open,
  onOpenChange,
  onExplorePlans,
  payload,
  windowHours = 5,
}: ChatQuotaExceededDialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open || !mounted) return null

  const bodyText = quotaExceededBodyText(payload ?? {}, windowHours)

  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/75"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quota-exceeded-title"
        className={cn(
          "relative z-10 flex w-full max-w-[52rem] flex-col overflow-hidden rounded-2xl",
          "border border-white/10 bg-[#1c1c1c] text-white shadow-2xl"
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/55 hover:bg-white/10 hover:text-white"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-2 pt-8 sm:px-8 sm:pt-10">
          <h2
            id="quota-exceeded-title"
            className="font-serif text-[1.65rem] font-medium tracking-tight text-white sm:text-[1.85rem]"
          >
            Upgrade to keep chatting
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60 sm:text-[0.9375rem]">
            {bodyText}
          </p>
          <p className="mt-6 text-sm font-medium text-white/85">
            Plus, get more ways to use MasterNode:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 px-6 py-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {UPGRADE_FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#262626] p-3"
              >
                <FeatureMock kind={feature.mock} />
                <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-white">
                  <Icon className="h-3.5 w-3.5 text-white/70" strokeWidth={1.75} aria-hidden />
                  {feature.title}
                </p>
                <p className="mt-1 text-[12px] leading-snug text-white/55">{feature.description}</p>
              </div>
            )
          })}
        </div>

        <div className="flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:justify-end sm:px-8 sm:pb-6">
          <Button
            type="button"
            variant="ghost"
            className="text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            Not now
          </Button>
          <Button
            type="button"
            className="bg-white text-[#111] hover:bg-white/90"
            onClick={() => {
              onOpenChange(false)
              onExplorePlans()
            }}
          >
            Explore plans
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
