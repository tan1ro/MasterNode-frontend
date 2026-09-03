"use client"

import { useMemo } from "react"
import { useUsage, useTenantUsage, useApiKeys, useAutoCreateApiKey, useWallet } from "@/hooks"
import { resolveWalletWorkspaceTenantId, isAppWallet, isKeyWallet } from "@/lib/wallet-workspace"
import { useAppAuth } from "@/hooks/use-app-auth"
import { PageHeader } from "@/components/shared/page-header"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { useBillingSubscription } from "@/hooks/use-billing"
import { PageShell } from "@/components/layout/page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  RecentUsageCard,
  PaymentMethodCard,
  InvoiceHistoryCard,
  BillingCreditsOverview,
  CurrentPlanCard,
  CreditsUsageDashboard,
} from "@/components/billing"
import { useAppearancePrefs } from "@/hooks/use-appearance-prefs"
import { useLocaleDisplayPrefs } from "@/hooks/use-locale-display-prefs"
import { usageParamsForCreditsRange } from "@/lib/billing-usage-analytics"

export function BusinessBillingDashboard() {
  const { accountType, isSuperUser } = useAppAuth()
  const { showTokenCostHints } = useAppearancePrefs()
  useLocaleDisplayPrefs()
  useAutoCreateApiKey()
  const canSwitchUsageSource = isSuperUser || accountType === "business"

  const recentUsageParams = useMemo(() => usageParamsForCreditsRange("30d", "web"), [])

  const { data: usage, isLoading, error: usageError } = useUsage(recentUsageParams)
  const { error: subscriptionError } = useBillingSubscription()
  const { data: apiKeys } = useApiKeys()
  const { data: wallet } = useWallet()
  const workspaceTenantId = useMemo(
    () => resolveWalletWorkspaceTenantId(wallet, apiKeys),
    [wallet, apiKeys]
  )
  const { data: tenantUsage, isLoading: tenantLoading } = useTenantUsage(
    workspaceTenantId ?? "api-tenant"
  )

  const activeWalletRow = useMemo(() => {
    if (!wallet) return null
    if (isAppWallet(wallet)) {
      return wallet.wallets?.find((w) => w.tenant_id === workspaceTenantId) ?? wallet.wallets?.[0] ?? null
    }
    if (isKeyWallet(wallet) && wallet.wallet_required) return wallet
    return null
  }, [wallet, workspaceTenantId])

  const pageError = usageError ?? subscriptionError

  return (
    <PageShell maxWidth="6xl">
      {pageError ? (
        <ApiErrorCallout
          error={pageError}
          title="Billing data unavailable"
          fallbackMessage="Could not load billing information."
        />
      ) : null}

      <PageHeader
        title="Billing"
        description="API prepaid credits, subscription plans, and usage analytics."
      />

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <CurrentPlanCard />
        <PaymentMethodCard />
      </div>

      <div className="mb-8">
        <BillingCreditsOverview apiKeys={apiKeys} />
      </div>

      <CreditsUsageDashboard
        variant="business"
        canSwitchChannel={canSwitchUsageSource}
        availableCreditsUsd={activeWalletRow?.available_usd}
        className="mb-8"
      />

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Workspace usage (API key)</CardTitle>
            <CardDescription>
              API usage tied to your active key — this is what reduces your available balance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {tenantLoading ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tasks</span>
                  <span className="font-medium tabular-nums">{tenantUsage?.task_count ?? 0}</span>
                </div>
                {showTokenCostHints ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tokens</span>
                      <span className="font-medium tabular-nums">
                        {(tenantUsage?.total_tokens ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Accrued cost</span>
                      <span className="font-medium tabular-nums">
                        ${(tenantUsage?.total_cost_usd ?? 0).toFixed(4)}
                      </span>
                    </div>
                  </>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>
        <RecentUsageCard records={usage?.records ?? []} isLoading={isLoading} />
      </div>

      <InvoiceHistoryCard />
    </PageShell>
  )
}
