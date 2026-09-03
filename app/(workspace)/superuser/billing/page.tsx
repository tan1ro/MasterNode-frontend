"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreditCard, RotateCcw } from "lucide-react"
import { useAppAuth } from "@/hooks/use-app-auth"
import { SuperuserAccessDenied } from "@/components/superuser/superuser-gate"
import { PageHeader } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { adminBillingService } from "@/services/admin-billing"
import { authService } from "@/services/auth"
import { planDisplayName } from "@/constants/pricing-plans"
import { ROUTES } from "@/lib/routes"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"
import type { AdminBillingInvoice } from "@/services/admin-billing"

function formatAmount(inv: AdminBillingInvoice): string {
  if (inv.provider === "razorpay" || inv.currency === "INR") {
    if (inv.amount_inr != null && inv.amount_inr > 0) {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(inv.amount_inr)
    }
    if (inv.amount_paise != null && inv.amount_paise > 0) {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(inv.amount_paise / 100)
    }
  }
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: inv.currency || "USD",
    maximumFractionDigits: 2,
  }).format(inv.amount_usd ?? 0)
}

export default function SuperuserBillingPage() {
  const { isSuperUser } = useAppAuth()
  const enabled = useProtectedQueryEnabled() && isSuperUser
  const queryClient = useQueryClient()

  const [region, setRegion] = useState("")
  const [country, setCountry] = useState("")
  const [tenantFilter, setTenantFilter] = useState("")
  const [usageTenantId, setUsageTenantId] = useState("")
  const [usageLookup, setUsageLookup] = useState("")
  const [statusMsg, setStatusMsg] = useState("")

  const geoQuery = useQuery({
    queryKey: ["admin", "billing-geo"],
    queryFn: () => adminBillingService.listGeo(),
    enabled,
  })

  const invoicesQuery = useQuery({
    queryKey: ["admin", "billing-invoices", region, country, tenantFilter],
    queryFn: () =>
      adminBillingService.listInvoices({
        limit: 200,
        skip: 0,
        region: region || undefined,
        country: country || undefined,
        tenant_id: tenantFilter || undefined,
      }),
    enabled,
  })

  const usersQuery = useQuery({
    queryKey: ["admin", "users", "billing-usage"],
    queryFn: () => authService.adminListUsers({ limit: 100, skip: 0 }),
    enabled,
  })

  const usageQuery = useQuery({
    queryKey: ["admin", "user-usage", usageLookup],
    queryFn: () => adminBillingService.getUserUsage(usageLookup),
    enabled: enabled && Boolean(usageLookup),
  })

  const resetMutation = useMutation({
    mutationFn: () =>
      adminBillingService.resetUserUsage(usageLookup, {
        prompt_quota: true,
        cost_totals: true,
      }),
    onSuccess: (res) => {
      setStatusMsg(
        `Reset ${res.tenant_id}: removed ${res.deleted_prompt_events} credit events` +
          (res.cleared_cost_totals ? "; cleared cost totals." : ".")
      )
      void queryClient.invalidateQueries({ queryKey: ["admin", "user-usage", usageLookup] })
    },
    onError: (err) => {
      setStatusMsg(err instanceof Error ? err.message : "Reset failed")
    },
  })

  const regions = geoQuery.data?.regions ?? []
  const countries = geoQuery.data?.countries ?? []
  const invoices = invoicesQuery.data?.invoices ?? []
  const users = usersQuery.data?.users ?? []

  const regionOptions = useMemo(() => {
    const set = new Set(regions)
    for (const inv of invoices) {
      if (inv.region) set.add(inv.region)
    }
    return Array.from(set).sort()
  }, [regions, invoices])

  const countryOptions = useMemo(() => {
    const set = new Set(countries)
    for (const inv of invoices) {
      if (inv.country) set.add(inv.country)
    }
    return Array.from(set).sort()
  }, [countries, invoices])

  if (!isSuperUser) {
    return <SuperuserAccessDenied title="Billing & usage" />
  }

  return (
    <div className="container mx-auto space-y-6 p-4 sm:p-6 max-w-6xl">
      <PageHeader
        title="Billing & usage"
        description="Reset token usage for users and review payment history by region and country."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={ROUTES.superuserTasks}
          className="ml-auto inline-flex h-9 items-center rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Back to hub
        </Link>
      </div>

      {statusMsg ? (
        <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          {statusMsg}
        </div>
      ) : null}

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <RotateCcw className="h-4 w-4 text-amber" />
            Reset token usage
          </CardTitle>
          <CardDescription>
            Clears the rolling chat credit window and persisted task cost totals for a tenant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
              <span className="text-muted-foreground">User</span>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={usageTenantId}
                onChange={(e) => setUsageTenantId(e.target.value)}
              >
                <option value="">Select a user…</option>
                {users.map((u) => (
                  <option key={u.tenant_id} value={u.tenant_id}>
                    {u.email} · {u.plan} · {u.tenant_id}
                  </option>
                ))}
              </select>
            </label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setUsageLookup(usageTenantId)
                setStatusMsg("")
              }}
              disabled={!usageTenantId}
            >
              Load usage
            </Button>
          </div>

          {usageQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading usage…</p>
          ) : null}
          {usageQuery.error ? (
            <p className="text-sm text-destructive">Could not load usage for this user.</p>
          ) : null}
          {usageQuery.data ? (
            <div className="space-y-3 rounded-lg border border-border/50 bg-muted/15 p-4 text-sm">
              <p>
                <span className="text-muted-foreground">Email:</span> {usageQuery.data.email}
              </p>
              <p>
                <span className="text-muted-foreground">Plan / type:</span>{" "}
                {usageQuery.data.plan} · {usageQuery.data.account_type}
              </p>
              <p>
                <span className="text-muted-foreground">Region / country:</span>{" "}
                {usageQuery.data.region || "—"} / {usageQuery.data.country || "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Chat credits (5h):</span>{" "}
                {usageQuery.data.prompt_quota?.used_tokens ?? 0}
                {usageQuery.data.prompt_quota?.limit_tokens != null
                  ? ` / ${usageQuery.data.prompt_quota.limit_tokens}`
                  : " (unlimited)"}
                {usageQuery.data.prompt_quota?.percent != null
                  ? ` · ${usageQuery.data.prompt_quota.percent}%`
                  : ""}
              </p>
              <p>
                <span className="text-muted-foreground">Task cost totals:</span>{" "}
                {usageQuery.data.cost_totals?.total_tokens ?? 0} tokens · $
                {Number(usageQuery.data.cost_totals?.total_cost_usd ?? 0).toFixed(4)}
              </p>
              <Button
                size="sm"
                variant="destructive"
                disabled={resetMutation.isPending || !usageLookup}
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    !window.confirm(
                      `Reset token usage for ${usageQuery.data?.email || usageLookup}? This cannot be undone.`
                    )
                  ) {
                    return
                  }
                  resetMutation.mutate()
                }}
              >
                {resetMutation.isPending ? "Resetting…" : "Reset usage"}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-amber" />
            Payment history
          </CardTitle>
          <CardDescription>
            All tenant invoices and receipts, filtered by deploy region and billing country.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Region</span>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              >
                <option value="">All regions</option>
                {regionOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Country</span>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">All countries</option>
                {countryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Tenant ID</span>
              <Input
                value={tenantFilter}
                onChange={(e) => setTenantFilter(e.target.value.trim())}
                placeholder="Optional tenant filter"
              />
            </label>
          </div>

          <div className="overflow-x-auto">
            {invoicesQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading payments…</p>
            ) : invoicesQuery.error ? (
              <p className="text-sm text-destructive">Could not load payment history.</p>
            ) : invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments match these filters.</p>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">When</th>
                    <th className="py-2 pr-4 font-medium">Tenant</th>
                    <th className="py-2 pr-4 font-medium">Region</th>
                    <th className="py-2 pr-4 font-medium">Country</th>
                    <th className="py-2 pr-4 font-medium">Provider</th>
                    <th className="py-2 pr-4 font-medium">Plan</th>
                    <th className="py-2 pr-4 font-medium">Amount</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr
                      key={`${inv.tenant_id}-${inv.invoice_id || inv.razorpay_payment_id}`}
                      className="border-b border-border/60"
                    >
                      <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                        {inv.created_at ? new Date(inv.created_at).toLocaleString() : "—"}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs">
                        {inv.customer_email || inv.tenant_id || "—"}
                      </td>
                      <td className="py-2 pr-4">{inv.region || "—"}</td>
                      <td className="py-2 pr-4">{inv.country || "—"}</td>
                      <td className="py-2 pr-4 capitalize">{inv.provider || "—"}</td>
                      <td className="py-2 pr-4">
                        {inv.plan
                          ? planDisplayName(inv.plan as Parameters<typeof planDisplayName>[0])
                          : "—"}
                      </td>
                      <td className="py-2 pr-4 tabular-nums">{formatAmount(inv)}</td>
                      <td className="py-2">{inv.status || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Showing {invoices.length} of {invoicesQuery.data?.total ?? 0} payments
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
