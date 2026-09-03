"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, PanelLeft, PanelLeftClose } from "lucide-react"
import { BrandPiMark } from "@/components/layout/brand-logo"
import { ChatComposerModeToggle } from "@/components/chat/chat-composer-mode-toggle"
import { useAppShellOptional } from "@/components/layout/app-shell-context"
import { ChatSidebarRailTooltip } from "@/components/chat/chat-sidebar-rail-tooltip"
import {
  SIDEBAR_HEADER_CLASS,
  SIDEBAR_PI_MARK_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { isMasterNodeDesktop } from "@/lib/desktop-runtime"
import { isChatConversationRoute } from "@/lib/app-shell-routes"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function SidebarHeaderIconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg p-0 leading-none",
        "text-foreground/55 transition-colors hover:bg-muted/70 hover:text-foreground",
        "disabled:pointer-events-none disabled:opacity-30"
      )}
    >
      {children}
    </button>
  )
}

export function ChatSidebarHeader({ onToggle }: { onToggle: () => void }) {
  const pathname = usePathname()
  const shell = useAppShellOptional()
  const [desktopShell, setDesktopShell] = useState(false)
  const isChatRoute = isChatConversationRoute(pathname)
  const showModeToggle = isChatRoute && shell

  useEffect(() => {
    setDesktopShell(isMasterNodeDesktop())
  }, [])

  if (desktopShell) {
    const showModeToggleDesktop = showModeToggle
    return (
      <header
        data-mn-sidebar-header=""
        data-show-mode-toggle={showModeToggleDesktop ? "" : undefined}
        className={cn(
          "flex w-full min-w-0 shrink-0 flex-nowrap items-center gap-2",
          "shrink-0 px-2"
        )}
      >
        <div
          data-mn-sidebar-header-start=""
          className="flex min-w-0 shrink-0 flex-nowrap items-center gap-0.5"
        >
          <SidebarHeaderIconButton label="Collapse sidebar" onClick={onToggle}>
            <PanelLeft className="block h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
          </SidebarHeaderIconButton>
          <div
            data-mn-sidebar-nav-history=""
            className="flex shrink-0 flex-nowrap items-center gap-0.5"
          >
            <SidebarHeaderIconButton label="Back" onClick={() => window.history.back()}>
              <ChevronLeft className="block h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
            </SidebarHeaderIconButton>
            <SidebarHeaderIconButton label="Forward" onClick={() => window.history.forward()}>
              <ChevronRight className="block h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
            </SidebarHeaderIconButton>
          </div>
        </div>
        <div className="min-w-0 flex-1" aria-hidden />
        {showModeToggleDesktop ? (
          <ChatComposerModeToggle
            mode={shell.composerMode}
            onChange={shell.setComposerMode}
            className="ml-auto shrink-0"
          />
        ) : null}
      </header>
    )
  }

  return (
    <header className={cn("flex items-center justify-between gap-2", SIDEBAR_HEADER_CLASS)}>
      <Link
        href={ROUTES.chat}
        className="inline-flex shrink-0 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50"
        aria-label="Chat home"
      >
        <BrandPiMark size="sm" markClassName={SIDEBAR_PI_MARK_CLASS} />
      </Link>
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground/60 hover:bg-muted/60 hover:text-foreground"
        aria-label="Collapse sidebar"
      >
        <PanelLeftClose className="h-5 w-5" strokeWidth={1.75} />
      </button>
    </header>
  )
}

/** Collapsed rail — π logo opens the sidebar. */
export function ChatSidebarRailHeader({ onToggle }: { onToggle: () => void }) {
  return (
    <div
      data-mn-sidebar-rail-header=""
      className={cn(SIDEBAR_HEADER_CLASS, "flex items-center justify-center")}
    >
      <ChatSidebarRailTooltip label="Open sidebar">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            "transition-colors hover:bg-muted/60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50"
          )}
          aria-label="Open sidebar"
        >
          <BrandPiMark size="sm" markClassName={SIDEBAR_PI_MARK_CLASS} showBeta={false} />
        </button>
      </ChatSidebarRailTooltip>
    </div>
  )
}
