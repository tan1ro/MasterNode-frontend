"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, CreditCard, LogIn, LogOut, Settings, UserPlus } from "lucide-react"
import { ROUTES } from "@/lib/routes"
import { settingsPanelHref } from "@/lib/settings-panel-routes"
import { useAppShellOptional } from "@/components/layout/app-shell-context"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useWorkspaceDisplayName } from "@/hooks/use-workspace-display-name"
import { useEntitlements } from "@/hooks/use-entitlements"
import { getNavForContext } from "@/constants/navigation"
import { planDisplayName, type PricingPlanId } from "@/constants/pricing-plans"
import { cn } from "@/lib/utils"

const MENU_SKIP_HREFS = new Set<string>([ROUTES.billing, ROUTES.settings])

function SignedInMenu({
  compact = false,
  showLabel = false,
}: {
  compact?: boolean
  showLabel?: boolean
}) {
  const shell = useAppShellOptional()
  const { user, signOut, accountType, isSuperUser } = useAppAuth()
  const entitlements = useEntitlements()
  const roleNav = getNavForContext(accountType, entitlements.isSuperUser, {
    accountType: entitlements.accountType,
    plan: entitlements.plan,
    isSuperUser: entitlements.isSuperUser,
    subscriptionActive: entitlements.subscriptionActive,
  })
  const extraAccountLinks = roleNav.account.filter((item) => !MENU_SKIP_HREFS.has(item.href))
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const displayName = useWorkspaceDisplayName()
  const initial = (displayName || user?.email || "?").trim().slice(0, 1).toUpperCase()
  const showName = !compact || showLabel

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={cn(
          "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
          compact && !showLabel
            ? "h-9 w-9 justify-center rounded-full p-0"
            : compact && showLabel
              ? "h-9 max-w-[9.5rem] rounded-full border border-border/50 bg-background/80 pl-0.5 pr-2"
              : "rounded-md border border-border bg-background px-2 py-1.5",
          open && "text-foreground bg-muted/50"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-amber/15 font-bold text-amber uppercase",
            compact ? "h-8 w-8 text-xs" : "h-6 w-6 text-[10px]"
          )}
        >
          {initial}
        </span>
        {showName ? (
          <>
            <span
              className={cn(
                "min-w-0 truncate text-foreground",
                compact && showLabel ? "max-w-[5.5rem] text-sm font-medium" : "hidden max-w-[140px] sm:inline"
              )}
            >
              {displayName}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                open && "rotate-180",
                compact && showLabel ? "hidden sm:block" : undefined
              )}
              aria-hidden
            />
          </>
        ) : null}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 min-w-[220px] rounded-md border border-border bg-background/95 backdrop-blur-md shadow-lg z-50 py-1"
        >
          <div className="px-3 py-2 border-b border-border/60">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="text-sm font-medium truncate">{user?.username || user?.email || "Account"}</p>
            <p className="text-xs text-cyan mt-0.5 uppercase tracking-wide">
              {user?.accountType || "user"} ·{" "}
              {planDisplayName((user?.plan || "free") as PricingPlanId)}
            </p>
          </div>
          {extraAccountLinks.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            )
          })}
          <Link
            href={ROUTES.billing}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <CreditCard className="h-4 w-4" aria-hidden />
            Billing
          </Link>
          <Link
            href={settingsPanelHref()}
            role="menuitem"
            onClick={(e) => {
              setOpen(false)
              if (shell) {
                e.preventDefault()
                shell.openSettings()
              }
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Settings className="h-4 w-4" aria-hidden />
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              signOut()
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export function NavigationAuth({
  compact = false,
  showLabel = false,
}: {
  compact?: boolean
  /** Show username beside avatar even when `compact` is true. */
  showLabel?: boolean
}) {
  const { isSignedIn } = useAppAuth()
  if (isSignedIn) {
    return <SignedInMenu compact={compact} showLabel={showLabel} />
  }

  if (compact) {
    return (
      <Link
        href={ROUTES.signIn}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        aria-label="Sign in"
      >
        <LogIn className="h-4 w-4" />
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link href={ROUTES.signIn}>
        <Button variant="outline" size="sm">
          <LogIn className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </Link>
      <Link href={ROUTES.signUp}>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Sign Up
        </Button>
      </Link>
    </div>
  )
}
