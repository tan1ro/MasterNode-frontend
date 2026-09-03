"use client"

import Link from "next/link"
import {
  ShieldCheck,
  Activity,
  Settings2,
  KeyRound,
  FileText,
  UserCog,
  Gauge,
  Bug,
  MessagesSquare,
  HeartPulse,
  BarChart3,
  CreditCard,
} from "lucide-react"
import { useAppAuth } from "@/hooks/use-app-auth"
import { ROUTES } from "@/lib/routes"
import { PageHeader } from "@/components/shared"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const QUICK_ACTIONS = [
  {
    href: ROUTES.superuserUsers,
    label: "User administration",
    description: "Create users, change account type and plan, and maintain access.",
    icon: UserCog,
  },
  {
    href: ROUTES.superuserBilling,
    label: "Billing & usage",
    description: "Reset token usage and review payment history by region and country.",
    icon: CreditCard,
  },
  {
    href: ROUTES.superuserMonitor,
    label: "Dashboard Monitor",
    description: "Separate pages for pipeline metrics, health, and execution analytics.",
    icon: Gauge,
  },
  {
    href: ROUTES.superuserMonitorHealth,
    label: "Health",
    description: "API readiness, queue, degradation, and component probes.",
    icon: HeartPulse,
  },
  {
    href: ROUTES.superuserMonitorMetrics,
    label: "Pipeline metrics",
    description: "Cross-tenant latency, tokens, cost, and success rates.",
    icon: Activity,
  },
  {
    href: ROUTES.superuserMonitorAnalytics,
    label: "Execution analytics",
    description: "SLO snapshot and execution trends over time.",
    icon: BarChart3,
  },
  {
    href: ROUTES.superuserFeedback,
    label: "User feedback",
    description: "Thumbs, reports, and comments from chat responses.",
    icon: MessagesSquare,
  },
  {
    href: ROUTES.superuserErrors,
    label: "Reported errors",
    description: "Bug reports submitted from the in-app help form.",
    icon: Bug,
  },
  {
    href: ROUTES.superuserAnalytics,
    label: "Product analytics",
    description: "Usage metrics, feedback trends, token usage, and exports.",
    icon: Activity,
  },
  {
    href: ROUTES.superuserModeration,
    label: "Chat moderation",
    description: "Review flagged users and policy violation reports.",
    icon: ShieldCheck,
  },
  {
    href: ROUTES.tasks,
    label: "All Tasks",
    description: "Inspect task runs and execution state across workflows.",
    icon: FileText,
  },
  {
    href: ROUTES.apiKeys,
    label: "API Keys",
    description: "Manage API credentials and wallet-backed usage controls.",
    icon: KeyRound,
  },
  {
    href: ROUTES.settings,
    label: "Workspace Settings",
    description: "Adjust global settings and account-level preferences.",
    icon: Settings2,
  },
] as const

export default function SuperuserTasksPage() {
  const { isSuperUser } = useAppAuth()

  if (!isSuperUser) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <PageHeader
          title="Superuser Tasks"
          description="This page is available only to the superuser account."
        />
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
          Access denied. Sign in as superuser to manage elevated operations.
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <PageHeader
        title="Superuser Tasks"
        description="Central place for elevated monitoring, control, and governance actions."
      />

      <div className="mb-6 rounded-xl border border-amber/40 bg-amber/10 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-amber" />
          <div>
            <p className="text-sm font-semibold text-foreground">Superuser mode active</p>
            <p className="mt-1 text-sm text-muted-foreground">
              You can access both creator and business surfaces, plus superuser-only controls.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {QUICK_ACTIONS.map((item) => {
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
