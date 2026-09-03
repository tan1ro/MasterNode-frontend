"use client"

import { ChatIncognitoEnterButton } from "@/components/chat/chat-incognito-chrome"
import { ChatPlanUpgradeBanner } from "@/components/chat/chat-plan-upgrade-banner"
import { ChatShareButton } from "@/components/chat/chat-share-button"
import { CHAT_PLAN_BANNER_FIXED_TOP_CLASS } from "@/constants/chat-layout"
import type { ChatMessage } from "@/types/api"
import { cn } from "@/lib/utils"

interface ChatWorkspaceTopBarProps {
  showPlanBanner?: boolean
  conversationId?: string | null
  messages?: ChatMessage[]
  conversationTitle?: string
  shareDisabled?: boolean
  showShare?: boolean
  showIncognito?: boolean
  className?: string
}

/**
 * Plan pill centered (sm+ only); Share / desktop-incognito on the right.
 * Absolute overlay with a transparent backdrop — the thread scrolls underneath
 * all the way to the top of the page; only the pill itself is solid.
 * Mobile chat header owns Share / New chat / Upgrade, so plan banner and Share
 * stay hidden below `sm` / `lg`.
 */
export function ChatWorkspaceTopBar({
  showPlanBanner = true,
  conversationId,
  messages = [],
  conversationTitle,
  shareDisabled,
  showShare = false,
  showIncognito = false,
  className,
}: ChatWorkspaceTopBarProps) {
  const hasShare = showShare && Boolean(conversationId)
  const hasDesktopIncognito = showIncognito
  const hasActions = hasShare || hasDesktopIncognito
  if (!showPlanBanner && !hasActions) return null

  return (
    <div
      data-chat-top-bar=""
      className={cn(
        "pointer-events-none absolute inset-x-0 z-30 flex items-center justify-center bg-transparent px-3 py-2 sm:px-4",
        CHAT_PLAN_BANNER_FIXED_TOP_CLASS,
        className
      )}
    >
      {showPlanBanner ? (
        <ChatPlanUpgradeBanner
          layout="inline"
          className="pointer-events-auto hidden sm:block"
        />
      ) : null}

      {hasActions ? (
        <div
          data-chat-top-actions=""
          className="pointer-events-auto absolute right-3 top-1/2 mt-1.5 flex -translate-y-1/2 items-center gap-2.5 sm:right-4"
        >
          {hasShare && conversationId ? (
            <ChatShareButton
              conversationId={conversationId}
              messages={messages}
              title={conversationTitle}
              disabled={shareDisabled}
              className="hidden lg:inline-flex"
            />
          ) : null}
          {hasDesktopIncognito ? (
            <div className="hidden lg:block">
              <ChatIncognitoEnterButton />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
