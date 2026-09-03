"use client"

import { NavigationAuth } from "@/components/layout/navigation-auth"
import { NavLink } from "./nav-link"
import type { NavItem } from "@/constants/navigation"

interface MobileNavProps {
  publicItems: NavItem[]
  /** @deprecated Kept for API compat; top-level nav no longer renders primary links. */
  protectedPrimary?: NavItem[]
  workspaceItems: NavItem[]
  teamItems?: NavItem[]
  /** API Keys, Billing, Logs — grouped under "Account" on mobile. */
  accountItems: NavItem[]
  adminItems?: NavItem[]
  onClose: () => void
}

function NavSection({
  title,
  items,
  onClose,
}: {
  title: string
  items: NavItem[]
  onClose: () => void
}) {
  if (items.length === 0) return null
  return (
    <div className="pt-2 mt-1 border-t border-border/60">
      <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {items.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          variant="mobile"
          onClick={onClose}
        />
      ))}
    </div>
  )
}

export function MobileNav({
  publicItems,
  protectedPrimary = [],
  workspaceItems,
  teamItems = [],
  accountItems,
  adminItems = [],
  onClose,
}: MobileNavProps) {
  return (
    <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4 space-y-1">
      {publicItems.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          variant="mobile"
          onClick={onClose}
        />
      ))}
      {protectedPrimary.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          variant="mobile"
          onClick={onClose}
        />
      ))}
      <NavSection title="Workspace" items={workspaceItems} onClose={onClose} />
      <NavSection title="Team" items={teamItems} onClose={onClose} />
      <NavSection title="Account" items={accountItems} onClose={onClose} />
      <NavSection title="Admin" items={adminItems} onClose={onClose} />
      <div className="pt-2 border-t border-border/50 mt-2">
        <div className="sm:hidden px-3 py-2">
          <NavigationAuth />
        </div>
      </div>
    </div>
  )
}
