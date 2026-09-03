"use client"

import Link from "next/link"
import { ROUTES } from "@/lib/routes"
import { APP_VERSION_LABEL, formatAppVersion } from "@/lib/app-version"
import { cn } from "@/lib/utils"

export function AppVersionLine({
  className,
  link = true,
  prefix = "Version",
}: {
  className?: string
  /** Link to the technical changelog when true. */
  link?: boolean
  prefix?: "Version" | "v" | "none"
}) {
  const label = formatAppVersion(prefix)
  const shared = cn("text-xs text-muted-foreground tabular-nums", className)

  if (!link) {
    return (
      <span className={shared} title={`MasterNode ${APP_VERSION_LABEL}`}>
        {label}
      </span>
    )
  }

  return (
    <Link
      href={ROUTES.changelog}
      className={cn(shared, "hover:text-foreground hover:underline underline-offset-2")}
      title={`MasterNode ${APP_VERSION_LABEL} — view changelog`}
    >
      {label}
    </Link>
  )
}
