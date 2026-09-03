"use client"

import { Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function ChatImageAttachmentCard({
  filename,
  previewUrl,
  busy = false,
  disabled = false,
  error = false,
  onOpen,
  onRemove,
  className,
}: {
  filename: string
  previewUrl?: string
  busy?: boolean
  disabled?: boolean
  error?: boolean
  onOpen?: () => void
  onRemove?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "group relative shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/30",
        error && "border-destructive/60",
        className
      )}
    >
      <button
        type="button"
        onClick={() => !disabled && !busy && onOpen?.()}
        disabled={disabled || busy || !onOpen}
        className={cn(
          "relative block h-[5.5rem] w-[5.5rem] sm:h-[6rem] sm:w-[6rem]",
          onOpen && !disabled && !busy && "cursor-pointer hover:opacity-95",
          (!onOpen || disabled) && "cursor-default"
        )}
        aria-label={filename ? `Open ${filename}` : "Open image"}
        title={filename}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted/60" />
        )}
        {busy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" aria-hidden />
          </div>
        ) : null}
      </button>
      {onRemove ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className={cn(
            "absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full",
            "border border-border/50 bg-background/90 text-muted-foreground shadow-sm opacity-0 transition-opacity",
            "group-hover:opacity-100 hover:bg-background hover:text-foreground focus-visible:opacity-100"
          )}
          aria-label={`Remove ${filename}`}
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  )
}
