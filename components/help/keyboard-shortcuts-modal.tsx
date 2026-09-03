"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { ShortcutDefinitionKeycaps } from "@/components/help/shortcut-keycaps"
import {
  KEYBOARD_SHORTCUT_CATEGORIES,
  KEYBOARD_SHORTCUT_DEFINITIONS,
  isMacPlatform,
} from "@/lib/keyboard-shortcuts"
import { cn } from "@/lib/utils"

interface KeyboardShortcutsModalProps {
  open: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  const isMac = isMacPlatform()

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close keyboard shortcuts"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-title"
        className={cn(
          "relative z-10 flex w-full max-w-md flex-col rounded-2xl border border-border bg-card shadow-xl",
          "max-h-[min(560px,calc(100dvh-1.5rem))] overflow-hidden"
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
          <h2 id="keyboard-shortcuts-title" className="text-base font-semibold text-foreground">
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-5">
            {KEYBOARD_SHORTCUT_CATEGORIES.map((category) => {
              const items = KEYBOARD_SHORTCUT_DEFINITIONS.filter(
                (def) => def.category === category.id
              )
              return (
                <section key={category.id}>
                  <h3 className="mb-2 text-sm text-muted-foreground">{category.label}</h3>
                  <dl className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70">
                    {items.map((def) => (
                      <div
                        key={def.id}
                        className="flex items-center justify-between gap-4 bg-muted/15 px-4 py-3"
                      >
                        <dt className="text-sm text-foreground">{def.label}</dt>
                        <dd className="shrink-0">
                          <ShortcutDefinitionKeycaps def={def} isMac={isMac} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
