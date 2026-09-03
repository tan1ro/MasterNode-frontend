"use client"

import { ArrowUp, Loader2, Square, X } from "lucide-react"
import { cn } from "@/lib/utils"

const WAVE_BARS = [4, 10, 16, 22, 14, 24, 12, 20, 8, 18, 14, 22, 10, 16, 6, 12, 20, 8, 14, 18]

interface ChatComposerVoiceBarProps {
  mode: "listening" | "requesting" | "transcribing"
  onCancel: () => void
  onStop: () => void
  onSend: () => void
  canSend?: boolean
}

/** ChatGPT-style voice session chrome inside the composer shell. */
export function ChatComposerVoiceBar({
  mode,
  onCancel,
  onStop,
  onSend,
  canSend = false,
}: ChatComposerVoiceBarProps) {
  const isListening = mode === "listening" || mode === "requesting"
  const isTranscribing = mode === "transcribing"

  return (
    <div className="flex w-full items-center gap-2 px-2 py-1.5 sm:px-2.5">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 text-foreground hover:bg-background/60"
        aria-label="Cancel voice input"
      >
        <X className="h-4 w-4" strokeWidth={2} />
      </button>

      <div className="flex min-w-0 flex-1 items-center justify-center px-1">
        {isTranscribing ? (
          <span className="text-sm font-medium text-black dark:text-white">Transcribing</span>
        ) : (
          <div className="flex h-8 w-full max-w-md items-center justify-center gap-[3px]" aria-hidden>
            {WAVE_BARS.map((height, index) => (
              <span
                key={index}
                className={cn(
                  "w-[2.5px] rounded-full bg-foreground/55",
                  isListening && "chat-voice-wave-bar"
                )}
                style={{
                  height: `${Math.max(4, height * 0.35)}px`,
                  animationDelay: `${(index % 8) * 0.08}s`,
                  ["--voice-bar-h" as string]: `${height}px`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {isListening ? (
        <button
          type="button"
          onClick={onStop}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 text-foreground hover:bg-background/60"
          aria-label="Stop listening"
        >
          <Square className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
        </button>
      ) : (
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        </span>
      )}

      <button
        type="button"
        onClick={onSend}
        disabled={!canSend && isTranscribing}
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all",
          canSend || isListening
            ? "bg-white text-black hover:brightness-95"
            : "bg-foreground/15 text-muted-foreground",
          "disabled:pointer-events-none disabled:opacity-40"
        )}
        aria-label="Send message"
      >
        <ArrowUp className="h-4 w-4" strokeWidth={2.25} />
      </button>
    </div>
  )
}
