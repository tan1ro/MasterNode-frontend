"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { LLM_PROVIDERS, PREFERRED_PROVIDER_OPTIONS } from "@/constants/settings"
import { loadSettingsPreferences } from "@/lib/settings-preferences"
import { cn } from "@/lib/utils"

const SHORT_LABELS: Record<string, string> = {
  "": "Auto",
  openai: "OpenAI",
  google: "Gemini",
  anthropic: "Claude",
  groq: "Groq",
  deepseek: "DeepSeek",
  mistral: "Mistral",
  cohere: "Cohere",
  together: "Together",
}

function labelFor(id: string): string {
  if (SHORT_LABELS[id]) return SHORT_LABELS[id]
  return LLM_PROVIDERS.find((p) => p.id === id)?.name || PREFERRED_PROVIDER_OPTIONS[0].label
}

interface ChatComposerModelPickerProps {
  value?: string
  onChange?: (providerId: string) => void
  disabled?: boolean
}

/** Compact provider chip for the desktop landing composer. */
export function ChatComposerModelPicker({
  value,
  onChange,
  disabled,
}: ChatComposerModelPickerProps) {
  const [open, setOpen] = useState(false)
  const [fallback, setFallback] = useState("")
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setFallback(loadSettingsPreferences().defaultPreferredProvider || "")
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  const selected = value ?? fallback

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Preferred model"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex max-w-[9.5rem] items-center gap-0.5 rounded-full px-2 py-1",
          "text-xs text-muted-foreground transition-colors hover:bg-background/50 hover:text-foreground",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <span className="truncate">{labelFor(selected)}</span>
        <ChevronDown className="h-3 w-3 shrink-0 opacity-70" strokeWidth={1.75} aria-hidden />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute bottom-full right-0 z-30 mb-1 min-w-[10.5rem] overflow-hidden rounded-xl border border-border/60 bg-popover py-1 shadow-xl"
        >
          {PREFERRED_PROVIDER_OPTIONS.map((opt) => (
            <li key={opt.value || "auto"}>
              <button
                type="button"
                role="option"
                aria-selected={selected === opt.value}
                className={cn(
                  "flex w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-muted/70",
                  selected === opt.value ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => {
                  onChange?.(opt.value)
                  setOpen(false)
                }}
              >
                {labelFor(opt.value)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
