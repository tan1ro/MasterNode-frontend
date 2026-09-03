"use client"

import { useMemo } from "react"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { PageHeader } from "@/components/shared/page-header"
import { CreatorPlanSummary } from "@/components/billing/creator-plan-summary"
import { CreditsUsageDashboard } from "@/components/billing/credits-usage-dashboard"
import { CurrentUsageCard } from "@/components/billing/current-usage-card"
import { InvoiceHistoryCard } from "@/components/billing/invoice-history-card"
import { PaymentMethodCard } from "@/components/billing/payment-method-card"
import { PageShell } from "@/components/layout/page-shell"
import { useUsage } from "@/hooks"
import { useBillingSubscription } from "@/hooks/use-billing"

function last30DaysUsageParams() {
  const now = new Date()
  const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  return {
    start_date: startDate.toISOString(),
    end_date: now.toISOString(),
    client_channel: "web" as const,
  }
}

export function CreatorBillingDashboard() {
  const activityParams = useMemo(() => last30DaysUsageParams(), [])

  const { data: usage, isLoading: usageLoading, error: usageError } = useUsage(activityParams)
  const { error: subscriptionError } = useBillingSubscription()

  const summary = usage?.summary ?? {}
  const pageError = subscriptionError

  return (
    <PageShell maxWidth="6xl">
      {pageError ? (
        <ApiErrorCallout
          error={pageError}
          title="Billing unavailable"
          fallbackMessage="Could not load your subscription details."
        />
      ) : null}

      <PageHeader
        title="Billing"
        description="Plan credits, invoices, and payment details for your workspace."
      />

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <CreatorPlanSummary />
        <PaymentMethodCard />
      </div>

      <CreditsUsageDashboard variant="creator" className="mb-8" />

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <InvoiceHistoryCard />
        <CurrentUsageCard
          title="Chat activity"
          description="Your chat usage over the last 30 days."
          totalTasks={summary.total_tasks ?? usage?.records?.length ?? 0}
          totalTokens={summary.total_tokens ?? 0}
          totalComputeMs={summary.total_compute_time_ms ?? 0}
          sourceLabel="chat"
          isLoading={usageLoading}
        />
      </div>

      {usageError ? (
        <p className="text-sm text-muted-foreground">
          Chat usage stats are temporarily unavailable.
        </p>
      ) : null}
    </PageShell>
  )
}
