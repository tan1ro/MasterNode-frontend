"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useEntitlements } from "@/hooks/use-entitlements"
import { parseChatConversationIdFromPathname, plansPricingHref } from "@/lib/chat-path"
import { formatChatPlanLabel, shouldShowChatPlanUpgrade } from "@/lib/plan-display"
import { CHAT_DOCK_PILL_CLASS } from "@/constants/chat-layout"
import { cn } from "@/lib/utils"

interface ChatPlanUpgradeBannerProps {
  className?: string
  /** `banner` = full-width centered row; `inline` = pill only (for top toolbar). */
  layout?: "banner" | "inline"
}

/** Centered pill: "{Plan} plan · Upgrade" (hidden at Infinity+). Opens `/chat/pricing`. */
export function ChatPlanUpgradeBanner({
  className,
  layout = "banner",
}: ChatPlanUpgradeBannerProps) {
  const pathname = usePathname()
  const { isSignedIn, isSuperUser } = useAppAuth()
  const { plan } = useEntitlements()

  if (!shouldShowChatPlanUpgrade(plan, isSuperUser)) return null

  const planLabel = formatChatPlanLabel(isSignedIn ? plan : "free")
  const pricingHref = plansPricingHref(parseChatConversationIdFromPathname(pathname ?? ""))

  const pill = (
    <Link
      href={pricingHref}
      className={cn(
        CHAT_DOCK_PILL_CLASS,
        "chat-plan-upgrade-pill bg-muted/55 text-foreground hover:bg-muted/70"
      )}
    >
      <span>{planLabel}</span>
      <span aria-hidden className="text-muted-foreground">
        ·
      </span>
      <span className="font-medium text-foreground underline-offset-2 hover:underline">
        Upgrade
      </span>
    </Link>
  )

  if (layout === "inline") {
    return <div className={className}>{pill}</div>
  }

  return (
    <div className={cn("flex w-full justify-center px-4", className)}>{pill}</div>
  )
}
