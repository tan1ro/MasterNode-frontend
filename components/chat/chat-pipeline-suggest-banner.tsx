"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Workflow, X } from "lucide-react"
import { chatSignInHref, chatSignUpHref } from "@/lib/chat-auth-links"
import { cn } from "@/lib/utils"

interface ChatPipelineSuggestBannerProps {
  isSignedIn: boolean
  onEnable: () => void
  onDismiss: () => void
  className?: string
}

export function ChatPipelineSuggestBanner({
  isSignedIn,
  onEnable,
  onDismiss,
  className,
}: ChatPipelineSuggestBannerProps) {
  const pathname = usePathname()
  const signUpHref = chatSignUpHref(pathname)
  const signInHref = chatSignInHref(pathname)

  return (
    <div
      className={cn(
        "rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 shadow-sm",
        className
      )}
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
          <Workflow className="h-4 w-4 text-amber-700 dark:text-amber-300" />
        </div>
        <div className="min-w-0 flex-1">
          {isSignedIn ? (
            <>
              <p className="text-sm font-medium text-foreground">Enable pipeline mode?</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                For builds, analysis, and multi-step work, turn on pipeline mode from the{" "}
                <span className="font-medium text-foreground">+</span> menu next to the message box.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onEnable}
                  className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-400"
                >
                  Enable pipeline mode
                </button>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="inline-flex items-center rounded-lg border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60"
                >
                  Not now
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-foreground">Sign up to use pipeline mode</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Pipeline mode runs multi-agent workflows for builds, analysis, and complex tasks. Create
                a free account to unlock it from the{" "}
                <span className="font-medium text-foreground">+</span> menu next to the message box.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link
                  href={signUpHref}
                  className="inline-flex items-center rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-400"
                >
                  Sign up free
                </Link>
                <Link
                  href={signInHref}
                  className="inline-flex items-center rounded-lg border border-border/60 bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60"
                >
                  Sign in
                </Link>
                <button
                  type="button"
                  onClick={onDismiss}
                  className="inline-flex items-center rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Not now
                </button>
              </div>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
