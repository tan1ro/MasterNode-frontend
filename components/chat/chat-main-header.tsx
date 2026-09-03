"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { PanelLeft, Sparkles } from "lucide-react"
import { NavigationAuth } from "@/components/layout/navigation-auth"
import { ChatPromptQuotaPill } from "@/components/chat/chat-prompt-quota-pill"
import { useAppShell } from "@/components/layout/app-shell-context"
import { ROUTES } from "@/lib/routes"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useEntitlements } from "@/hooks/use-entitlements"
import { cn } from "@/lib/utils"

interface ChatMainHeaderProps {
  title?: string
  showBrand?: boolean
  /** Chat routes: sidebar control + account only (no center title). */
  minimal?: boolean
  sidebarOpen: boolean
  pipelineBadge?: ReactNode
  trailing?: ReactNode
  className?: string
}

export function ChatMainHeader({
  title,
  showBrand = false,
  minimal = false,
  sidebarOpen,
  pipelineBadge,
  trailing,
  className,
}: ChatMainHeaderProps) {
  const { isSignedIn } = useAppAuth()
  const { plan, subscriptionActive } = useEntitlements()
  const shell = useAppShell()
  const showUpgrade = isSignedIn && !subscriptionActive && plan === "free"
  const collapsed = !sidebarOpen

  return (
    <header
      className={cn(
        "h-12 shrink-0 items-center gap-2 border-b border-border/40 px-3 md:px-4 flex",
        className ?? "hidden lg:flex"
      )}
    >
      {collapsed ? (
        <button
          type="button"
          onClick={() => shell.setSidebarOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          aria-label="Expand sidebar"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      ) : (
        <span className="w-9 shrink-0" aria-hidden />
      )}

      <div className="flex min-w-0 flex-1 items-center gap-1">
        {!minimal ? (
          showBrand ? (
            <span className="truncate text-sm font-medium">Chat</span>
          ) : (
            <p className="min-w-0 truncate text-sm font-medium">{title || "Chat"}</p>
          )
        ) : null}
        {pipelineBadge}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {trailing}
        <ChatPromptQuotaPill />
        {showUpgrade ? (
          <Link
            href={ROUTES.billing}
            className={cn(
              "hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/60",
              "px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber" aria-hidden />
            Upgrade
          </Link>
        ) : null}
        {!minimal ? <NavigationAuth compact showLabel /> : null}
      </div>
    </header>
  )
}
