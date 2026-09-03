"use client"

import { usePathname } from "next/navigation"
import { useAppAuth } from "@/hooks/use-app-auth"
import { SiteFooter } from "@/components/layout/site-footer"
import { HOME_SITE_FOOTER_COLUMNS } from "@/constants/site-footer"
import { shouldHideGlobalChrome } from "@/lib/app-shell-routes"

export function Footer() {
  const pathname = usePathname()
  const { isSuperUser, accountType } = useAppAuth()

  if (shouldHideGlobalChrome(pathname, accountType, isSuperUser)) return null

  return <SiteFooter variant="app" columns={HOME_SITE_FOOTER_COLUMNS} />
}
