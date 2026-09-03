"use client"

import { X } from "lucide-react"
import { ChatHoverTooltip } from "@/components/chat/chat-hover-tooltip"
import { IncognitoGhostIcon } from "@/components/chat/incognito-ghost-icon"
import { useAppShell } from "@/components/layout/app-shell-context"
import { useAppAuth } from "@/hooks/use-app-auth"
import { CHAT_STICKY_BELOW_MOBILE_HEADER } from "@/constants/chat-layout"
import { cn } from "@/lib/utils"

const INCOGNITO_ENTER_TOOLTIP =
  "Use for sensitive or one-off questions you do not want saved. Not for pipeline runs, memory/RAG, or chats you may revisit later."

/** Incognito chat mark — same π asset as sidebar / greeting. */
export function IncognitoChatIcon({
  className,
  variant = "mark",
}: {
  className?: string
  variant?: "mark" | "hero"
}) {
  return <IncognitoGhostIcon className={className} variant={variant} />
}

/** Top-right control to enter incognito mode (signed-in only). */
export function ChatIncognitoEnterButton({ className }: { className?: string }) {
  const { isSignedIn, hydrated } = useAppAuth()
  const { ghostModeEnabled, openIncognitoIntro } = useAppShell()

  if (!hydrated || !isSignedIn || ghostModeEnabled) return null

  return (
    <ChatHoverTooltip
      label="Incognito chat"
      description={INCOGNITO_ENTER_TOOLTIP}
      side="bottom"
      align="end"
      className={className}
    >
      <button
        type="button"
        onClick={() => openIncognitoIntro()}
        aria-label="Start incognito chat"
        className={cn(
          "inline-flex h-12 w-11 items-center justify-center rounded-lg px-1.5 pb-1 pt-2.5",
          "bg-transparent text-foreground/85 hover:text-foreground"
        )}
      >
        <IncognitoChatIcon className="h-7 w-7" />
        <span className="sr-only">Start incognito chat</span>
      </button>
    </ChatHoverTooltip>
  )
}

/** Full-width bar shown while incognito mode is active (Claude-style). */
export function ChatIncognitoBar({ className }: { className?: string }) {
  const { ghostModeEnabled, setGhostModeEnabled } = useAppShell()

  if (!ghostModeEnabled) return null

  return (
    <header
      className={cn(
        "sticky z-20 flex h-11 shrink-0 items-center gap-2 border-b border-border/40",
        CHAT_STICKY_BELOW_MOBILE_HEADER,
        "bg-background/95 px-3 backdrop-blur-sm sm:px-4",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
        <span className="inline-flex h-7 w-7 items-center justify-center">
          <IncognitoChatIcon className="h-6 w-6" />
        </span>
        <span>Incognito chat</span>
      </div>
      <button
        type="button"
        onClick={() => setGhostModeEnabled(false)}
        className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        aria-label="Exit incognito chat"
        title="Exit incognito chat"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </header>
  )
}

/** Centered hero for empty incognito chat (Claude + ChatGPT mix). */
export function ChatIncognitoHero({ className }: { className?: string }) {
  const { ghostModeEnabled } = useAppShell()
  if (!ghostModeEnabled) return null

  return (
    <div className={cn("flex w-full flex-col items-center gap-3 text-center", className)}>
      <span className="mn-incognito-ghost-bob inline-flex">
        <IncognitoChatIcon className="h-12 w-12 sm:h-14 sm:w-14" variant="hero" />
      </span>
      <h1 className="max-w-xl px-1 font-heading text-[1.7rem] font-medium leading-tight tracking-tight text-foreground sm:text-4xl md:text-[2.35rem]">
        You&apos;re incognito
      </h1>
      <p className="max-w-lg px-1 text-sm leading-relaxed text-muted-foreground">
        This chat won&apos;t appear in your history and won&apos;t influence future answers. Use
        incognito for sensitive or throwaway questions — switch back for pipeline runs, memory, and
        chats you want to keep.
      </p>
    </div>
  )
}

/** Footer disclaimer (Claude-style, below composer). */
export function ChatIncognitoDisclaimer({ className }: { className?: string }) {
  const { ghostModeEnabled } = useAppShell()
  if (!ghostModeEnabled) return null

  return (
    <p className={cn("text-center text-xs leading-relaxed text-muted-foreground", className)}>
      Incognito chats aren&apos;t saved to history or used to personalize responses. Pipeline mode
      and memory are unavailable while incognito is on.
    </p>
  )
}
