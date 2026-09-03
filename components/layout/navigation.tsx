"use client"

import { Menu, X } from "lucide-react"
import { NavigationAuth } from "@/components/layout/navigation-auth"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useMounted } from "@/hooks/use-mounted"
import { cn } from "@/lib/utils"
import { getPublicNavItems } from "@/constants/navigation"
import { shouldHideGlobalChrome } from "@/lib/app-shell-routes"
import { NavLink, MobileNav } from "@/components/layout"
import { BrandLogoNav } from "@/components/layout/brand-logo"

/**
 * Residual top chrome for rare signed-in pages outside the app shell.
 * Business / superuser / creator workspace routes hide this entirely and
 * use the sidebar instead.
 */
function NavigationInner() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isSignedIn, accountType, isSuperUser } = useAppAuth()
  const publicNavItems = getPublicNavItems(accountType)

  return (
    <nav className={cn("sticky top-0 z-50", "border-0 bg-transparent")}>
      <div className="container mx-auto px-4 sm:px-6 py-3 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <BrandLogoNav />
            <div className="hidden lg:flex items-center gap-1">
              {publicNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {isSignedIn && accountType ? (
              <span className="hidden md:inline-flex items-center rounded-full border border-cyan/35 bg-cyan/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-cyan">
                {accountType}
              </span>
            ) : null}
            {isSuperUser ? (
              <span className="hidden sm:inline-flex items-center rounded-full border border-amber/40 bg-amber/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber">
                Superuser
              </span>
            ) : null}
            <div className="hidden sm:block">
              <NavigationAuth />
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-muted-foreground hover:bg-amber/10 hover:text-amber"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <MobileNav
            publicItems={publicNavItems}
            protectedPrimary={[]}
            workspaceItems={[]}
            teamItems={[]}
            accountItems={[]}
            adminItems={[]}
            onClose={() => setMobileMenuOpen(false)}
          />
        ) : null}
      </div>
    </nav>
  )
}

export function Navigation() {
  const pathname = usePathname() ?? ""
  const { accountType, isSuperUser } = useAppAuth()
  const mounted = useMounted()

  if (!pathname) {
    return null
  }

  const hideChrome = shouldHideGlobalChrome(
    pathname,
    mounted ? accountType : null,
    mounted ? isSuperUser : false
  )

  if (hideChrome) {
    return null
  }

  return <NavigationInner />
}
