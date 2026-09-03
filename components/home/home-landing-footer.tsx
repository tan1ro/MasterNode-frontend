"use client"

import { SiteFooter } from "@/components/layout/site-footer"
import { HOME_SITE_FOOTER_COLUMNS } from "@/constants/site-footer"

export function HomeLandingFooter() {
  return <SiteFooter variant="home" columns={HOME_SITE_FOOTER_COLUMNS} />
}
