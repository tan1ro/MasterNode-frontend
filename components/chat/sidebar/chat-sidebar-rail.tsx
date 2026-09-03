"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import type { LucideIcon } from "lucide-react"
import { MessageSquare, PenSquare, Search } from "lucide-react"
import { ChatSidebarFooter } from "@/components/chat/sidebar/chat-sidebar-footer"
import { ChatSidebarRailHeader } from "@/components/chat/sidebar/chat-sidebar-header"
import {
  hubItemsForRail,
  workspaceItemsForRail,
} from "@/components/chat/sidebar/chat-sidebar-nav"
import { ChatSidebarRailTooltip } from "@/components/chat/chat-sidebar-rail-tooltip"
import {
  SIDEBAR_ICON_CLASS,
  SIDEBAR_NAV_SECTION_CLASS,
  SIDEBAR_RAIL_ROW_CLASS,
  SIDEBAR_RAIL_WIDTH_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useEntitlements } from "@/hooks/use-entitlements"
import { getNavForContext } from "@/constants/navigation"
import { usesWorkspaceHub } from "@/lib/workspace-hub"
import { ROUTES } from "@/lib/routes"
import { cn } from "@/lib/utils"
function SidebarRailButton({
  label,
  icon: Icon,
  onClick,
  href,
  active = false,
}: {
  label: string
  icon: LucideIcon
  onClick?: () => void
  href?: string
  active?: boolean
}) {
  const className = cn(
    SIDEBAR_RAIL_ROW_CLASS,
    active
      ? "bg-muted/70 text-amber"
      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
  )
  const iconClass = cn(SIDEBAR_ICON_CLASS, active && "text-amber")
  const control = href ? (
    <Link href={href} className={className} aria-label={label}>
      <Icon className={iconClass} aria-hidden strokeWidth={1.75} />
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className} aria-label={label}>
      <Icon className={iconClass} aria-hidden strokeWidth={1.75} />
    </button>
  )
  return <ChatSidebarRailTooltip label={label}>{control}</ChatSidebarRailTooltip>
}

export function ChatSidebarRail({
  onToggle,
  onCreateChat,
  onOpenSearch,
}: {
  onToggle: () => void
  onCreateChat: () => void
  onOpenSearch: () => void
}) {
  const pathname = usePathname()
  const { isSignedIn, accountType, isSuperUser } = useAppAuth()
  const entitlements = useEntitlements()
  const roleNav = getNavForContext(accountType, entitlements.isSuperUser, {
    accountType: entitlements.accountType,
    plan: entitlements.plan,
    isSuperUser: entitlements.isSuperUser,
    subscriptionActive: entitlements.subscriptionActive,
  })
  const hubRole = usesWorkspaceHub(accountType, isSuperUser)

  const workspaceItems = useMemo(() => {
    if (!isSignedIn) return []
    if (hubRole) return hubItemsForRail(roleNav)
    return workspaceItemsForRail(roleNav.workspace)
  }, [hubRole, isSignedIn, roleNav])

  const isChatActive =
    pathname === ROUTES.chat || (pathname?.startsWith("/chat/") ?? false)

  const isPathActive = (href: string) => {
    const path = href.split("#")[0] || href
    return pathname === path || (pathname?.startsWith(`${path}/`) ?? false)
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-visible",
        SIDEBAR_RAIL_WIDTH_CLASS,
        "bg-background"
      )}
    >
      <ChatSidebarRailHeader onToggle={onToggle} />

      <nav className={SIDEBAR_NAV_SECTION_CLASS} aria-label="App navigation">
        <SidebarRailButton label="New chat" icon={PenSquare} onClick={onCreateChat} />
        <SidebarRailButton label="Search chats" icon={Search} onClick={onOpenSearch} />
        <SidebarRailButton
          label="Recents"
          icon={MessageSquare}
          onClick={onToggle}
          active={isChatActive}
        />
        {workspaceItems.map((item) => (
          <SidebarRailButton
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isPathActive(item.href)}
          />
        ))}
      </nav>

      <div className="min-h-6 flex-1" aria-hidden />

      <div className="mt-auto overflow-visible border-t border-border/40 p-2">
        <ChatSidebarFooter variant="rail" />
      </div>
    </div>
  )
}
