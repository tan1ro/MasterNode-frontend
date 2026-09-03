"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createPortal } from "react-dom"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from "react"
// import { useTheme } from "next-themes"
import {
  Clock,
  ChevronDown,
  DollarSign,
  Download,
  LogIn,
  LogOut,
  Settings,
  Sparkles,
  Store,
  User,
} from "lucide-react"
import { DesktopAccountMenuPanel } from "@/components/chat/sidebar/chat-desktop-account-menu"
import { ChatLogoutConfirmDialog } from "@/components/chat/chat-logout-confirm-dialog"
import { ChatAccountHelpMenu } from "@/components/chat/sidebar/chat-account-help-menu"
import { ChatAccountProfileFlyout } from "@/components/chat/sidebar/chat-account-profile-flyout"
import {
  useRailMenuPosition,
  useSidebarMenuPosition,
} from "@/components/chat/sidebar/use-sidebar-menu-position"
import { ChatSidebarGuestFooter } from "@/components/chat/chat-sidebar-guest"
import { ChatSidebarRailTooltip } from "@/components/chat/chat-sidebar-rail-tooltip"
import { AppVersionLine } from "@/components/layout/app-version-line"
import {
  SIDEBAR_MENU_ITEM_CLASS,
  SIDEBAR_MENU_PANEL_CLASS,
  SIDEBAR_MENU_SECTION_BORDER_CLASS,
  SIDEBAR_META_TEXT_CLASS,
  SIDEBAR_TEXT_CLASS,
} from "@/components/chat/sidebar/chat-sidebar-tokens"
import { getNavForContext } from "@/constants/navigation"
import { chatSignInHref } from "@/lib/chat-auth-links"
import { formatChatPlanLabel, planAccent, shouldShowChatPlanUpgrade, type PlanAccent } from "@/lib/plan-display"
import { planDisplayName, type PricingPlanId } from "@/constants/pricing-plans"
import { ROUTES } from "@/lib/routes"
import { usesWorkspaceHub } from "@/lib/workspace-hub"
import {
  closeAppShellSidebarIfMobile,
  useAppShell,
} from "@/components/layout/app-shell-context"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useWorkspaceDisplayName } from "@/hooks/use-workspace-display-name"
import { useEntitlements } from "@/hooks/use-entitlements"
import { cn } from "@/lib/utils"
import { isMasterNodeDesktop } from "@/lib/desktop-runtime"

const MENU_SKIP_HREFS = new Set<string>([ROUTES.billing, ROUTES.settings])

function accountInitials(username?: string | null, email?: string | null): string {
  const raw = (username || email || "?").trim()
  const parts = raw.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase()
  }
  return raw.slice(0, 2).toUpperCase()
}

function formatShortPlanLabel(plan?: string | null): string {
  return planDisplayName((plan || "free") as PricingPlanId)
}

interface MenuItemDef {
  key: string
  label: string
  icon: ComponentType<{ className?: string }>
  href?: string
  onClick?: () => void
  external?: boolean
}

function AccountMenuItem({
  item,
  onClose,
}: {
  item: MenuItemDef
  onClose: () => void
}) {
  const { setSidebarOpen } = useAppShell()
  const Icon = item.icon
  const className = cn(SIDEBAR_MENU_ITEM_CLASS, "text-left")
  const finish = () => {
    closeAppShellSidebarIfMobile(setSidebarOpen)
    onClose()
  }

  if (item.href) {
    return (
      <Link
        href={item.href}
        role="menuitem"
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        onClick={finish}
        className={className}
      >
        <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
        <span className="flex-1 truncate">{item.label}</span>
      </Link>
    )
  }

  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        item.onClick?.()
        finish()
      }}
      className={className}
    >
      <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
      <span className="flex-1 truncate text-left">{item.label}</span>
    </button>
  )
}

interface AccountMenuSections {
  upgrade: MenuItemDef | null
  workspace: MenuItemDef[]
}

function AccountMenuPanel({
  open,
  positionStyle,
  initial,
  displayName,
  shortPlan,
  accent,
  email,
  sections,
  onLogoutRequest,
  onClose,
  onManageAccount,
  onKeyboardShortcuts,
  onBugReport,
  useFixedFlyout = true,
}: {
  open: boolean
  positionStyle: CSSProperties | null
  initial: string
  displayName: string
  shortPlan: string
  accent: PlanAccent
  email?: string | null
  sections: AccountMenuSections
  onLogoutRequest: () => void
  onClose: () => void
  onManageAccount: () => void
  onKeyboardShortcuts: () => void
  onBugReport: () => void
  useFixedFlyout?: boolean
}) {
  if (!open || !positionStyle || typeof document === "undefined") return null

  const { upgrade, workspace } = sections

  const panel = (
    <div
      role="menu"
      data-account-menu=""
      className={cn("fixed overflow-visible", SIDEBAR_MENU_PANEL_CLASS)}
      style={positionStyle}
    >
      <ChatAccountProfileFlyout
        initial={initial}
        displayName={displayName}
        shortPlan={shortPlan}
        accent={accent}
        email={email}
        useFixedFlyout={useFixedFlyout}
        onClose={onClose}
        onManageAccount={onManageAccount}
      />

      <div className="py-1">
        {upgrade ? <AccountMenuItem item={upgrade} onClose={onClose} /> : null}
        {workspace.map((item) => (
          <AccountMenuItem key={item.key} item={item} onClose={onClose} />
        ))}
      </div>

      <div className={cn(SIDEBAR_MENU_SECTION_BORDER_CLASS, "py-1")}>
        <ChatAccountHelpMenu
          onClose={onClose}
          useFixedFlyout={useFixedFlyout}
          onAction={(action) => {
            if (action === "keyboard-shortcuts") onKeyboardShortcuts()
            if (action === "report-bug") onBugReport()
          }}
        />
      </div>

      {/* Theme toggle hidden for now
      <div className={cn(SIDEBAR_MENU_SECTION_BORDER_CLASS, "py-1")}>
        <ThemeMenuItem onClose={onClose} />
      </div>
      */}

      <div className={cn(SIDEBAR_MENU_SECTION_BORDER_CLASS, "py-1")}>
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onClose()
            onLogoutRequest()
          }}
          className={SIDEBAR_MENU_ITEM_CLASS}
        >
          <LogOut className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
          <span className="flex-1 truncate text-left">Log out</span>
        </button>
      </div>

      <div className={cn(SIDEBAR_MENU_SECTION_BORDER_CLASS, "px-3 py-2")}>
        <AppVersionLine className="text-[11px]" />
      </div>
    </div>
  )

  return createPortal(panel, document.body)
}

/* Theme toggle hidden for now
function ThemeMenuItem({ onClose }: { onClose: () => void }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && theme === "dark"
  const Icon = isDark ? Sun : Moon
  const label = isDark ? "Light mode" : "Dark mode"

  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        setTheme(isDark ? "light" : "dark")
        onClose()
      }}
      className={SIDEBAR_MENU_ITEM_CLASS}
    >
      <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
      <span className="flex-1 truncate text-left">{label}</span>
    </button>
  )
}
*/

function useSidebarAccountMenuSections(
  onOpenSettings: () => void,
  onOpenPersonalization: () => void,
  onOpenProfile: () => void,
  entitlements: ReturnType<typeof useEntitlements>
): AccountMenuSections {
  const { accountType, isSuperUser } = useAppAuth()
  const roleNav = getNavForContext(accountType, entitlements.isSuperUser, {
    accountType: entitlements.accountType,
    plan: entitlements.plan,
    isSuperUser: entitlements.isSuperUser,
    subscriptionActive: entitlements.subscriptionActive,
  })
  const hubRole = usesWorkspaceHub(accountType, isSuperUser)

  return useMemo(() => {
    const workspace: MenuItemDef[] = [
      {
        key: "personalization",
        label: "Personalization",
        icon: Clock,
        onClick: onOpenPersonalization,
      },
      {
        key: "profile",
        label: "Profile",
        icon: User,
        onClick: onOpenProfile,
      },
      {
        key: "settings",
        label: "Settings",
        icon: Settings,
        onClick: onOpenSettings,
      },
    ]

    // Hub account links live in the sidebar Account section; still expose
    // non-billing extras here for creators (and skip duplicates for hub).
    if (!hubRole) {
      for (const link of roleNav.account.filter((i) => !MENU_SKIP_HREFS.has(i.href))) {
        workspace.push({
          key: link.href,
          label: link.label,
          icon: link.icon,
          href: link.href,
        })
      }
    }

    workspace.push({
      key: "billing",
      label: "Billing",
      icon: DollarSign,
      href: ROUTES.billing,
    })

    const upgrade =
      !entitlements.subscriptionActive && (entitlements.plan === "free" || !entitlements.plan)
        ? {
            key: "upgrade",
            label: "Upgrade plan",
            icon: Sparkles,
            href: ROUTES.billing,
          }
        : null

    return {
      upgrade,
      workspace,
    }
  }, [
    accountType,
    entitlements,
    hubRole,
    isSuperUser,
    roleNav.account,
    onOpenSettings,
    onOpenPersonalization,
    onOpenProfile,
  ])
}

export function ChatSidebarFooter({ variant = "expanded" }: { variant?: "expanded" | "rail" }) {
  const pathname = usePathname()
  const { isSignedIn, user, signOut } = useAppAuth()
  const displayName = useWorkspaceDisplayName()
  const entitlements = useEntitlements()
  const { openSettings, openKeyboardShortcuts, openBugReport } = useAppShell()
  const [open, setOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [logoutPending, setLogoutPending] = useState(false)
  const [desktopShell, setDesktopShell] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setDesktopShell(isMasterNodeDesktop())
  }, [])

  const sidebarMenuStyle = useSidebarMenuPosition(
    containerRef,
    open && variant === "expanded",
    { insetX: 0 }
  )
  const railMenuStyle = useRailMenuPosition(triggerRef, open && variant === "rail")

  const closeAndOpenSettings = (section?: string) => {
    setOpen(false)
    openSettings(section)
  }

  const menuSections = useSidebarAccountMenuSections(
    () => closeAndOpenSettings(),
    () => closeAndOpenSettings("chat-behavior"),
    () => closeAndOpenSettings("account"),
    entitlements
  )

  const handleLogoutConfirm = async () => {
    setLogoutPending(true)
    try {
      await signOut()
      setLogoutOpen(false)
    } finally {
      setLogoutPending(false)
    }
  }

  const showUpgrade = shouldShowChatPlanUpgrade(entitlements.plan, entitlements.isSuperUser)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (containerRef.current?.contains(target)) return
      if (target instanceof Element && target.closest("[data-account-menu]")) return
      setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  if (!isSignedIn) {
    const signInHref = chatSignInHref(pathname)
    if (variant === "rail") {
      return (
        <ChatSidebarRailTooltip label="Sign in">
          <Link
            href={signInHref}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-full",
              "border border-border/60 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
            aria-label="Sign in"
          >
            <LogIn className="h-4 w-4" />
          </Link>
        </ChatSidebarRailTooltip>
      )
    }
    return <ChatSidebarGuestFooter />
  }

  const initial = accountInitials(displayName, user?.email)
  const shortPlan = formatShortPlanLabel(user?.plan)
  const accent = planAccent(user?.plan)

  if (variant === "rail") {
    const accountSubtitle = formatChatPlanLabel(user?.plan)
    const railTooltipLabel = `${displayName} · ${accountSubtitle}`

    return (
      <div className="relative overflow-visible" ref={containerRef}>
        <ChatSidebarRailTooltip
          label={displayName}
          description={accountSubtitle}
          hidden={open}
        >
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={`Account menu, ${railTooltipLabel}`}
            title={railTooltipLabel}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full",
              "text-sm font-semibold transition-colors ring-1",
              accent.avatar,
              accent.ring,
              "hover:brightness-110",
              open && "ring-2"
            )}
          >
            {initial}
          </button>
        </ChatSidebarRailTooltip>
        {desktopShell ? (
          <DesktopAccountMenuPanel
            open={open}
            positionStyle={railMenuStyle}
            email={user?.email}
            showUpgrade={showUpgrade}
            onClose={() => setOpen(false)}
            onOpenSettings={() => closeAndOpenSettings()}
            onLogoutRequest={() => setLogoutOpen(true)}
            onKeyboardShortcuts={() => {
              setOpen(false)
              openKeyboardShortcuts()
            }}
            onBugReport={() => {
              setOpen(false)
              openBugReport()
            }}
          />
        ) : (
          <AccountMenuPanel
            open={open}
            positionStyle={railMenuStyle}
            initial={initial}
            displayName={displayName}
            shortPlan={shortPlan}
            accent={accent}
            email={user?.email}
            sections={menuSections}
            onLogoutRequest={() => setLogoutOpen(true)}
            onClose={() => setOpen(false)}
            onManageAccount={() => closeAndOpenSettings("account")}
            onKeyboardShortcuts={() => {
              setOpen(false)
              openKeyboardShortcuts()
            }}
            onBugReport={() => {
              setOpen(false)
              openBugReport()
            }}
          />
        )}
        <ChatLogoutConfirmDialog
          open={logoutOpen}
          onOpenChange={setLogoutOpen}
          isPending={logoutPending}
          onConfirm={() => void handleLogoutConfirm()}
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative flex w-full min-w-0 items-center gap-1 rounded-[10px] px-1 py-1 transition-colors",
        "hover:bg-muted/90",
        open && "bg-muted"
      )}
      ref={containerRef}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1.5 py-1 text-left"
      >
        <span
          aria-hidden
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1",
            accent.avatar,
            accent.ring
          )}
        >
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          {desktopShell ? (
            <span className={cn("block truncate font-medium text-foreground", SIDEBAR_TEXT_CLASS)}>
              {displayName}
              <span className="text-foreground/60"> · {shortPlan}</span>
            </span>
          ) : (
            <>
              <span className={cn("block truncate font-medium text-foreground", SIDEBAR_TEXT_CLASS)}>
                {displayName}
              </span>
              <span className={cn("block truncate font-medium", SIDEBAR_META_TEXT_CLASS, accent.text)}>
                {shortPlan}
              </span>
            </>
          )}
        </span>
        {desktopShell ? (
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
            aria-hidden
          />
        ) : null}
      </button>

      {showUpgrade ? (
        <Link
          href={desktopShell ? ROUTES.helpDownloadApps : ROUTES.billing}
          className={cn(
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            "text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          )}
          aria-label={desktopShell ? "Download apps" : "Upgrade plan"}
        >
          {desktopShell ? <Download className="h-4 w-4" /> : <Store className="h-4 w-4" />}
        </Link>
      ) : null}

      {desktopShell ? (
        <DesktopAccountMenuPanel
          open={open}
          positionStyle={sidebarMenuStyle}
          email={user?.email}
          showUpgrade={showUpgrade}
          onClose={() => setOpen(false)}
          onOpenSettings={() => closeAndOpenSettings()}
          onLogoutRequest={() => setLogoutOpen(true)}
          onKeyboardShortcuts={() => {
            setOpen(false)
            openKeyboardShortcuts()
          }}
          onBugReport={() => {
            setOpen(false)
            openBugReport()
          }}
        />
      ) : (
        <AccountMenuPanel
          open={open}
          positionStyle={sidebarMenuStyle}
          initial={initial}
          displayName={displayName}
          shortPlan={shortPlan}
          accent={accent}
          email={user?.email}
          sections={menuSections}
          onLogoutRequest={() => setLogoutOpen(true)}
          onClose={() => setOpen(false)}
          onManageAccount={() => closeAndOpenSettings("account")}
          onKeyboardShortcuts={() => {
            setOpen(false)
            openKeyboardShortcuts()
          }}
          onBugReport={() => {
            setOpen(false)
            openBugReport()
          }}
        />
      )}
      <ChatLogoutConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        isPending={logoutPending}
        onConfirm={() => void handleLogoutConfirm()}
      />
    </div>
  )
}
