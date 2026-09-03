"use client"

import { cn } from "@/lib/utils"

/** Short footer under the composer — nudge to verify, keep it one line on phones. */
export function ChatComposerDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "mt-1.5 px-1 text-center text-[10px] leading-tight text-black dark:text-white max-lg:mt-1",
        className
      )}
    >
      <span className="max-lg:hidden">
        Answers are drafts — double-check names, numbers, and anything you act on.
      </span>
      <span className="lg:hidden">Drafts — verify before you act.</span>
    </p>
  )
}
