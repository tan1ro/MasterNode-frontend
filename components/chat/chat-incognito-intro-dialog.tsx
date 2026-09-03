"use client"

import { useEffect, useState, type LucideIcon } from "react"
import { createPortal } from "react-dom"
import { Ban, Brain, History } from "lucide-react"
import { IncognitoChatIcon } from "@/components/chat/chat-incognito-chrome"
import {
  SIDEBAR_DIALOG_BACKDROP_CLASS,
  SIDEBAR_DIALOG_SHELL_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChatIncognitoIntroDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContinue: () => void
}

function IntroIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon className="h-[1.125rem] w-[1.125rem] shrink-0 text-foreground/90" strokeWidth={1.75} aria-hidden />
  )
}

function IntroRow({
  icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center pt-0.5">
        <IntroIcon icon={icon} />
      </div>
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-semibold leading-snug text-foreground">{title}</p>
        <p className="text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export function ChatIncognitoIntroDialog({
  open,
  onOpenChange,
  onContinue,
}: ChatIncognitoIntroDialogProps) {
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

  return createPortal(
    <div className="fixed inset-0 z-[125] flex items-center justify-center p-4">
      <button
        type="button"
        className={SIDEBAR_DIALOG_BACKDROP_CLASS}
        onClick={() => onOpenChange(false)}
        aria-label="Dismiss"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="incognito-intro-title"
        className={cn(SIDEBAR_DIALOG_SHELL_CLASS, "max-w-[24rem] px-5 py-5")}
      >
        <div className="flex items-center gap-3">
          <IncognitoChatIcon className="h-9 w-9" variant="hero" />
          <h2
            id="incognito-intro-title"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            Incognito chat
          </h2>
        </div>

        <div className="mt-5 space-y-4">
          <IntroRow
            icon={History}
            title="Not in history"
            description="Incognito chats won't appear in your sidebar or chat history."
          />
          <IntroRow
            icon={Ban}
            title="No model training"
            description="Incognito chats aren't used to improve models or added to training data."
          />
          <IntroRow
            icon={Brain}
            title="Memory off"
            description="Memory, RAG, and pipeline mode are unavailable while incognito is on."
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            className="shadow-none"
            onClick={() => {
              onContinue()
              onOpenChange(false)
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
