"use client"

import { cn } from "@/lib/utils"

interface ChatQuotaLockBannerProps {
  message: string
  onUpgrade: () => void
  className?: string
}

/** Claude-style line above the composer when the credit window is exhausted. */
export function ChatQuotaLockBanner({ message, onUpgrade, className }: ChatQuotaLockBannerProps) {
  return (
    <div
      className={cn(
        "mb-2 flex w-full items-center justify-between gap-3 px-1 text-[13px] leading-snug",
        className
      )}
    >
      <p className="min-w-0 text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onUpgrade}
        className="shrink-0 font-medium text-foreground underline-offset-2 hover:underline"
      >
        Upgrade
      </button>
    </div>
  )
}
