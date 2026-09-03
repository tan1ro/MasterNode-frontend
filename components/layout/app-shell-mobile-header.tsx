"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu,
  MoreHorizontal,
  PenSquare,
  Search,
  Settings,
  Share2,
  Sparkles,
} from "lucide-react"
import { IncognitoChatIcon } from "@/components/chat/chat-incognito-chrome"
import { BrandPiMark } from "@/components/layout/brand-logo"
import { NavigationAuth } from "@/components/layout/navigation-auth"
import { useAppShell } from "@/components/layout/app-shell-context"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useEntitlements } from "@/hooks/use-entitlements"
import { useToast } from "@/hooks/use-toast"
import { BRANDING } from "@/constants/branding"
import {
  SIDEBAR_MENU_ITEM_CLASS,
  SIDEBAR_MENU_PANEL_CLASS,
  SIDEBAR_MENU_SEPARATOR_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import {
  parseChatConversationIdFromPathname,
  plansPricingHref,
  requestBeginDraftChat,
} from "@/lib/chat-path"
import { shareChatConversation } from "@/lib/chat-share"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"

function ChatMobileMoreMenu({
  conversationId,
}: {
  conversationId: string | null
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const { openSettings, openChatSearch, openIncognitoIntro, ghostModeEnabled } = useAppShell()
  const { isSignedIn } = useAppAuth()
  const { showToast, ToastSlot } = useToast()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const close = () => setOpen(false)

  const handleShare = async () => {
    if (!conversationId) return
    close()
    try {
      const result = await shareChatConversation([], conversationId)
      showToast(
        result === "shared" ? "Share link ready." : "Share link copied.",
        "success"
      )
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "Could not share this chat."
      showToast(message, "error")
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        aria-label="More options"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className={cn(
            "absolute right-0 top-[calc(100%+0.35rem)] z-[80] min-w-[13.5rem]",
            SIDEBAR_MENU_PANEL_CLASS
          )}
        >
          {conversationId ? (
            <button
              type="button"
              role="menuitem"
              className={SIDEBAR_MENU_ITEM_CLASS}
              onClick={() => void handleShare()}
            >
              <Share2 className="h-4 w-4 shrink-0" aria-hidden />
              <span>Share</span>
            </button>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className={SIDEBAR_MENU_ITEM_CLASS}
            onClick={() => {
              close()
              openChatSearch()
            }}
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            <span>Search chats</span>
          </button>
          {isSignedIn && !ghostModeEnabled ? (
            <button
              type="button"
              role="menuitem"
              className={SIDEBAR_MENU_ITEM_CLASS}
              onClick={() => {
                close()
                openIncognitoIntro()
              }}
            >
              <IncognitoChatIcon className="h-4 w-4" />
              <span>Incognito chat</span>
            </button>
          ) : null}
          <div className={SIDEBAR_MENU_SEPARATOR_CLASS} role="separator" />
          <button
            type="button"
            role="menuitem"
            className={SIDEBAR_MENU_ITEM_CLASS}
            onClick={() => {
              close()
              openSettings()
            }}
          >
            <Settings className="h-4 w-4 shrink-0" aria-hidden />
            <span>Settings</span>
          </button>
        </div>
      ) : null}
      <ToastSlot />
    </div>
  )
}

function ChatMobileHeader() {
  const pathname = usePathname() ?? ""
  const router = useRouter()
  const { setSidebarOpen } = useAppShell()
  const { isSignedIn } = useAppAuth()
  const { plan, subscriptionActive } = useEntitlements()
  const conversationId = parseChatConversationIdFromPathname(pathname)
  const showUpgrade = isSignedIn && !subscriptionActive && plan === "free"

  const handleNewChat = () => {
    requestBeginDraftChat()
    router.push(ROUTES.chat)
  }

  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center gap-1 border-b border-border/40 px-2",
        "lg:hidden"
      )}
    >
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      <Link
        href={ROUTES.chat}
        className="inline-flex shrink-0 items-center rounded-lg p-1.5 text-foreground hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50"
        aria-label={BRANDING.productName}
      >
        <BrandPiMark size="sm" markClassName="h-7 w-7" />
      </Link>

      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        {showUpgrade ? (
          <Link
            href={plansPricingHref(conversationId)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border border-border/60",
              "px-2.5 py-1.5 text-xs font-medium text-foreground",
              "hover:bg-muted/50"
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber" aria-hidden />
            Upgrade
          </Link>
        ) : null}

        <button
          type="button"
          onClick={handleNewChat}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          aria-label="New chat"
        >
          <PenSquare className="h-5 w-5" aria-hidden />
        </button>

        <ChatMobileMoreMenu conversationId={conversationId} />
      </div>
    </header>
  )
}

/**
 * Mobile top bar for workspace shell.
 * Menu + π mark left; chat routes get Upgrade / New chat / more on the right,
 * other routes get the account avatar.
 */
export function AppShellMobileHeader({ chatRoute = false }: { chatRoute?: boolean }) {
  const { setSidebarOpen } = useAppShell()

  if (chatRoute) {
    return <ChatMobileHeader />
  }

  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center gap-1 border-b border-border/40 px-2",
        "lg:hidden"
      )}
    >
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      <Link
        href={ROUTES.chat}
        className="inline-flex shrink-0 items-center rounded-lg p-1.5 text-foreground hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/50"
        aria-label={BRANDING.productName}
      >
        <BrandPiMark size="sm" markClassName="h-7 w-7" showBeta={false} />
      </Link>

      <div className="ml-auto flex shrink-0 items-center justify-end">
        <NavigationAuth compact />
      </div>
    </header>
  )
}
