"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import { Layers, PenSquare, Search, Shield, UserCircle, Users } from "lucide-react"
import { SidebarNavLabel, SidebarRowIcon } from "@/components/chat/sidebar/chat-sidebar-row"
import { ChatSidebarNavSection } from "@/components/chat/sidebar/chat-sidebar-nav-section"
import {
  SIDEBAR_NAV_SECTION_CLASS,
  sidebarNavItemClass,
  sidebarNewChatItemClass,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import {
  closeAppShellSidebarIfMobile,
  useAppShellOptional,
} from "@/components/layout/app-shell-context"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useEntitlements } from "@/hooks/use-entitlements"
import { getNavForContext, getPublicNavItems, type NavItem } from "@/constants/navigation"
import { usesWorkspaceHub } from "@/lib/workspace-hub"
import { ROUTES } from "@/lib/routes"

function isNavItemActive(pathname: string | null, href: string): boolean {
  const pathOnly = href.split("#")[0] || href
  return pathname === pathOnly || (pathname?.startsWith(`${pathOnly}/`) ?? false)
}

/** Unified nav row — button or link with identical grid layout. */
export function SidebarNavItem({
  label,
  icon: Icon,
  active = false,
  href,
  onClick,
  dataChatTour,
}: {
  label: string
  icon: NavItem["icon"]
  active?: boolean
  href?: string
  onClick?: () => void
  dataChatTour?: string
}) {
  const className = sidebarNavItemClass(active)
  const content = (
    <>
      <SidebarRowIcon icon={Icon as LucideIcon} active={active} />
      <SidebarNavLabel>{label}</SidebarNavLabel>
    </>
  )

  const shell = useAppShellOptional()
  const handleClick = () => {
    if (shell) closeAppShellSidebarIfMobile(shell.setSidebarOpen)
    onClick?.()
  }

  if (href) {
    return (
      <Link
        href={href}
        onClick={handleClick}
        className={className}
        {...(dataChatTour ? { "data-chat-tour": dataChatTour } : {})}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      {...(dataChatTour ? { "data-chat-tour": dataChatTour } : {})}
    >
      {content}
    </button>
  )
}

function NavItemList({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  return (
    <>
      {items.map((item) => {
        const pathOnly = item.href.split("#")[0] || item.href
        const tourId =
          pathOnly === ROUTES.tasks
            ? "workspace-tasks"
            : pathOnly === ROUTES.agents
              ? "workspace-assistants"
              : pathOnly === ROUTES.memory
                ? "workspace-memory"
                : pathOnly === ROUTES.integrations
                  ? "workspace-integrations"
                  : undefined
        return (
          <SidebarNavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isNavItemActive(pathname, item.href)}
            dataChatTour={tourId}
          />
        )
      })}
    </>
  )
}

function sectionHasActiveItem(pathname: string | null, items: NavItem[]): boolean {
  return items.some((item) => isNavItemActive(pathname, item.href))
}

export function ChatSidebarNav({
  onCreateChat,
}: {
  onCreateChat: () => void
}) {
  const pathname = usePathname()
  const { isSignedIn, accountType, isSuperUser } = useAppAuth()
  const entitlements = useEntitlements()
  const shell = useAppShellOptional()

  const isNewChatActive = pathname === ROUTES.chat
  const roleNav = getNavForContext(accountType, entitlements.isSuperUser, {
    accountType: entitlements.accountType,
    plan: entitlements.plan,
    isSuperUser: entitlements.isSuperUser,
    subscriptionActive: entitlements.subscriptionActive,
  })
  const publicNavItems = getPublicNavItems(accountType)
  const hubRole = usesWorkspaceHub(accountType, isSuperUser)

  return (
    <nav className={SIDEBAR_NAV_SECTION_CLASS} aria-label="App navigation">
      <button
        type="button"
        onClick={() => {
          if (shell) closeAppShellSidebarIfMobile(shell.setSidebarOpen)
          onCreateChat()
        }}
        className={sidebarNewChatItemClass(isNewChatActive)}
        data-chat-tour="new-chat"
      >
        <SidebarRowIcon icon={PenSquare} active={isNewChatActive} alwaysAmber />
        <SidebarNavLabel>New chat</SidebarNavLabel>
      </button>
      <SidebarNavItem
        label="Search chats"
        icon={Search}
        onClick={() => shell?.openChatSearch()}
        dataChatTour="search-chats"
      />
      {publicNavItems
        .filter((item) => item.href !== ROUTES.chat)
        .map((item) => (
          <SidebarNavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isNavItemActive(pathname, item.href)}
          />
        ))}

      {isSignedIn && hubRole ? (
        <div data-chat-tour="workspace-nav" className="flex flex-col gap-0.5">
          {roleNav.workspace.length > 0 ? (
            <ChatSidebarNavSection
              label="Workspace"
              icon={Layers}
              defaultOpen
              active={sectionHasActiveItem(pathname, roleNav.workspace)}
            >
              <NavItemList items={roleNav.workspace} />
            </ChatSidebarNavSection>
          ) : null}
          {roleNav.team.length > 0 ? (
            <ChatSidebarNavSection
              label="Team"
              icon={Users}
              defaultOpen
              active={sectionHasActiveItem(pathname, roleNav.team)}
            >
              <NavItemList items={roleNav.team} />
            </ChatSidebarNavSection>
          ) : null}
          {roleNav.account.length > 0 ? (
            <ChatSidebarNavSection
              label="Account"
              icon={UserCircle}
              defaultOpen={false}
              active={sectionHasActiveItem(pathname, roleNav.account)}
            >
              <NavItemList items={roleNav.account} />
            </ChatSidebarNavSection>
          ) : null}
          {roleNav.admin.length > 0 ? (
            <ChatSidebarNavSection
              label="Admin"
              icon={Shield}
              defaultOpen={false}
              active={sectionHasActiveItem(pathname, roleNav.admin)}
            >
              <NavItemList items={roleNav.admin} />
            </ChatSidebarNavSection>
          ) : null}
        </div>
      ) : null}

      {isSignedIn && !hubRole ? (
        <div data-chat-tour="workspace-nav" className="flex flex-col gap-0.5">
          <NavItemList items={roleNav.workspace} />
        </div>
      ) : null}
    </nav>
  )
}

/** Workspace items shown on collapsed rail. */
export function workspaceItemsForRail(workspace: NavItem[]): NavItem[] {
  const paths = new Set<string>([
    ROUTES.dashboard,
    ROUTES.product,
    ROUTES.tasks,
    ROUTES.agents,
    ROUTES.memory,
    ROUTES.integrations,
    ROUTES.analytics,
    ROUTES.team,
  ])
  const seen = new Set<string>()
  const out: NavItem[] = []
  for (const item of workspace) {
    const path = item.href.split("#")[0] || item.href
    if (!paths.has(path) || seen.has(path)) continue
    seen.add(path)
    out.push(item)
  }
  return out
}

/** Hub rail: primary workspace shortcuts + first team / admin entry. */
export function hubItemsForRail(roleNav: {
  workspace: NavItem[]
  team: NavItem[]
  account: NavItem[]
  admin: NavItem[]
}): NavItem[] {
  const primary = workspaceItemsForRail(roleNav.workspace).slice(0, 5)
  const extras: NavItem[] = []
  if (roleNav.team[0]) extras.push(roleNav.team[0])
  if (roleNav.admin[0]) extras.push(roleNav.admin[0])
  const seen = new Set(primary.map((i) => i.href))
  for (const item of extras) {
    if (seen.has(item.href)) continue
    seen.add(item.href)
    primary.push(item)
  }
  return primary
}
