"use client"

import Link from "next/link"
import { CreditCard, Receipt, TrendingUp } from "lucide-react"
import { useAppShell } from "@/components/layout/app-shell-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsSectionCard } from "@/components/settings/settings-pref-controls"
import { ROUTES } from "@/lib/routes"

function BillingSettingsLink({
  href,
  children,
  className,
}: {
  href: string
  children: React.ReactNode
  className?: string
}) {
  const { closeSettings } = useAppShell()

  return (
    <Link
      href={href}
      onClick={closeSettings}
      className={
        className ??
        "inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
      }
    >
      {children}
    </Link>
  )
}

export function BillingSettingsSection() {
  return (
    <Card variant="minimal" interactive={false} id="billing" accent="emerald">
      <CardHeader className="space-y-1 p-4 pb-2">
        <div className="flex items-start gap-2">
          <CreditCard className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold leading-snug">Billing</CardTitle>
            <CardDescription className="mt-1">Usage, invoices, and plan management.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <SettingsSectionCard
          icon={TrendingUp}
          title="Usage this month"
          description="Tasks, messages, tokens, and cost accrued."
          accent="emerald"
        >
          <p className="text-sm text-muted-foreground mb-3">
            View current-month usage charts, token breakdown, and wallet balance on the billing dashboard.
          </p>
          <BillingSettingsLink href={ROUTES.billingUsage}>Open billing dashboard</BillingSettingsLink>
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={Receipt}
          title="Invoices & plan"
          description="Invoice history, cost per task, and upgrade/downgrade."
          accent="emerald"
        >
          <p className="text-sm text-muted-foreground mb-3">
            Invoices, per-task cost breakdown, and plan changes are on the billing page.
          </p>
          <div className="flex flex-wrap gap-2">
            <BillingSettingsLink href={ROUTES.billingInvoices}>Usage & invoices</BillingSettingsLink>
            <BillingSettingsLink href={ROUTES.billingPlans}>Compare plans</BillingSettingsLink>
          </div>
        </SettingsSectionCard>
      </CardContent>
    </Card>
  )
}
