"use client"

import { usePathname } from "next/navigation"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useEntitlements } from "@/hooks/use-entitlements"
import { useSuperuserHealthBundle } from "@/hooks/use-superuser-health-bundle"
import {
  buildBackendHealthChips,
  buildPageHealthChips,
  formatHealthCheckedAt,
  mergeSuperuserHealthChips,
  type HealthChip,
  type HealthChipStatus,
} from "@/lib/superuser-page-health"
import { SuperuserHealthAdminDropdown } from "@/components/layout/superuser-health-admin-dropdown"
import { shouldHideGlobalChrome } from "@/lib/app-shell-routes"
import { cn } from "@/lib/utils"

const STATUS_STYLES: Record<HealthChipStatus, string> = {
  ok: "border-emerald/40 bg-emerald/10 text-emerald",
  warn: "border-amber/40 bg-amber/10 text-amber",
  error: "border-destructive/40 bg-destructive/10 text-destructive",
  loading: "border-border/50 bg-muted/40 text-muted-foreground",
  unknown: "border-border/50 bg-muted/30 text-muted-foreground",
}

function HealthChipBadge({ chip }: { chip: HealthChip }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] tabular-nums",
        STATUS_STYLES[chip.status]
      )}
      title={chip.detail}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          chip.status === "ok" && "bg-emerald",
          chip.status === "warn" && "bg-amber",
          chip.status === "error" && "bg-destructive",
          chip.status === "loading" && "bg-muted-foreground animate-pulse"
        )}
        aria-hidden
      />
      <span className="font-semibold uppercase tracking-wide">{chip.label}</span>
      <span className="max-w-[12rem] truncate font-normal normal-case opacity-90 hidden sm:inline">
        {chip.detail ?? "—"}
      </span>
    </span>
  )
}

/** Compact superuser health summary; open **Health** for the full admin dropdown. */
export function SuperuserHealthStrip() {
  const pathname = usePathname() ?? "/"
  const { hydrated, accountType } = useAppAuth()
  const { isSuperUser } = useEntitlements()

  const bundle = useSuperuserHealthBundle(Boolean(hydrated && isSuperUser))

  if (!hydrated || !isSuperUser) return null
  // App shell uses the sidebar — avoid a second top chrome strip.
  if (shouldHideGlobalChrome(pathname, accountType, Boolean(isSuperUser))) return null

  const chips = mergeSuperuserHealthChips(
    buildPageHealthChips(hydrated),
    buildBackendHealthChips(bundle.health, {
      loading: bundle.healthLoading,
      error: bundle.healthError,
    })
  )

  return (
    <div
      className="border-b border-border/40 bg-muted/20"
      role="region"
      aria-label="Superuser health summary"
    >
      <div className="container mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-1.5 sm:px-6">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber">
          Ops health
        </span>
        <span className="hidden text-[10px] text-muted-foreground lg:inline font-mono">{pathname}</span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <HealthChipBadge key={chip.id} chip={chip} />
          ))}
        </div>
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
          {bundle.isFetching ? "…" : formatHealthCheckedAt(bundle.healthUpdatedAt)}
        </span>
        <SuperuserHealthAdminDropdown placement="strip" />
      </div>
    </div>
  )
}
