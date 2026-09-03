"use client"

import Link from "next/link"
import { Activity, BarChart3, HeartPulse, ShieldCheck } from "lucide-react"
import { useAppAuth } from "@/hooks/use-app-auth"
import { SuperuserAccessDenied } from "@/components/superuser/superuser-gate"
import { PageHeader } from "@/components/shared"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/lib/routes"

const MONITOR_PAGES = [
  {
    href: ROUTES.superuserMonitorHealth,
    label: "Health",
    description: "API readiness, queue, degradation level, and component probes.",
    icon: HeartPulse,
  },
  {
    href: ROUTES.superuserMonitorMetrics,
    label: "Pipeline metrics",
    description: "Cross-tenant task latency, tokens, cost, and success rates.",
    icon: Activity,
  },
  {
    href: ROUTES.superuserMonitorAnalytics,
    label: "Execution analytics",
    description: "SLO snapshot and product execution trends over time.",
    icon: BarChart3,
  },
] as const

export default function SuperuserMonitorHubPage() {
  const { isSuperUser } = useAppAuth()

  if (!isSuperUser) {
    return <SuperuserAccessDenied title="Dashboard Monitor" />
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <PageHeader
        title="Dashboard Monitor"
        description="View pipeline metrics, health, and execution analytics."
      />

      <div className="mb-6 rounded-xl border border-amber/40 bg-amber/10 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-amber" />
          <div>
            <p className="text-sm font-semibold text-foreground">Superuser monitoring</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Each area opens on its own page so health, metrics, and analytics stay focused.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {MONITOR_PAGES.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Card className="h-full border-border/60 transition-colors hover:border-amber/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4 text-amber" />
                    {item.label}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Open</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
