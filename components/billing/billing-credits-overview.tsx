"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { Wallet, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Callout } from "@/components/ui/callout"
import { LoadingState } from "@/components/shared/loading-state"
import { useWallet, useWalletDeposit } from "@/hooks/use-wallet"
import type { ApiKeyRecord, ApiWalletAppResponse, ApiWalletKeyResponse, ApiWalletResponse } from "@/types/api"
import { ROUTES } from "@/lib/routes"
import { resolveWalletWorkspaceTenantId } from "@/lib/wallet-workspace"
import { isAppWallet, isKeyWallet } from "@/lib/wallet-workspace"
import {
  formatWalletLevelLabel,
  walletBalanceLevel,
  worstWalletLevel,
  type WalletBalanceLevel,
} from "@/lib/wallet-balance"
import { cn } from "@/lib/utils"

function formatUsd(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 4 }).format(n)
}

function pct(n: number) {
  return `${Math.min(100, Math.max(0, Math.round(n * 100)))}%`
}

interface BillingCreditsOverviewProps {
  apiKeys?: ApiKeyRecord[]
}

function BalanceBadge({ level }: { level: WalletBalanceLevel }) {
  if (level === "healthy") return null
  return (
    <span
      className={cn(
        "text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded border",
        level === "depleted"
          ? "border-rose-500/40 bg-rose-500/15 text-rose-600 dark:text-rose-400"
          : "border-amber/40 bg-amber/15 text-amber"
      )}
    >
      {formatWalletLevelLabel(level)}
    </span>
  )
}

export function BillingCreditsOverview({ apiKeys }: BillingCreditsOverviewProps) {
  const { data, isLoading, error, refetch } = useWallet()
  const depositMutation = useWalletDeposit()

  const wallets = useMemo(() => {
    if (!data) return []
    if (isAppWallet(data)) return data.wallets ?? []
    if (isKeyWallet(data) && data.wallet_required) {
      return [
        {
          key_id: undefined,
          name: "Active API key",
          tenant_id: data.tenant_id,
          balance_usd: data.balance_usd,
          accrued_cost_usd: data.accrued_cost_usd,
          available_usd: data.available_usd,
          starter_credit_usd: data.starter_credit_usd,
          used_fraction: data.used_fraction,
          wallet_required: data.wallet_required,
          api_wallet_enabled: data.api_wallet_enabled,
          read: data.read,
          write: data.write,
        },
      ]
    }
    return []
  }, [data])

  const activeTenantId = useMemo(() => resolveWalletWorkspaceTenantId(data, apiKeys), [data, apiKeys])

  const activeWallet = useMemo(
    () => wallets.find((w) => w.tenant_id === activeTenantId) ?? wallets[0],
    [wallets, activeTenantId]
  )

  const starterUsd = useMemo(() => {
    if (!data) return 5
    if (isAppWallet(data) || isKeyWallet(data)) {
      return data.starter_credit_usd ?? activeWallet?.starter_credit_usd ?? 5
    }
    return 5
  }, [data, activeWallet])

  const overallLevel = useMemo(() => worstWalletLevel(wallets), [wallets])

  const usedPct = useMemo(() => {
    if (!activeWallet) return 0
    if (typeof activeWallet.used_fraction === "number") return activeWallet.used_fraction
    const prepaid = activeWallet.balance_usd
    if (prepaid <= 0) return 0
    return Math.min(1, activeWallet.accrued_cost_usd / prepaid)
  }, [activeWallet])

  if (isLoading) {
    return (
      <Card accent="cyan">
        <CardContent className="pt-6">
          <LoadingState message="Loading API credits…" size="sm" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card accent="cyan">
        <CardContent className="pt-6">
          <Callout type="error" title="Could not load credits">
            <p className="text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => void refetch()}>
              Retry
            </Button>
          </Callout>
        </CardContent>
      </Card>
    )
  }

  if (!data?.api_wallet_enabled) {
    return (
      <Card accent="cyan">
        <CardHeader>
          <CardTitle>API credits</CardTitle>
          <CardDescription>Prepaid billing is disabled on this server.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card accent="cyan" className="overflow-hidden">
      <CardHeader className="border-b border-border/40 bg-muted/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-cyan/15 p-2">
              <Wallet className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <CardTitle>API credits</CardTitle>
              <CardDescription className="mt-1 max-w-xl">
                Your account includes {formatUsd(starterUsd)} prepaid API credit (assigned automatically).
                Usage from programmatic tasks and RAG reduces <strong>Available</strong> (prepaid − accrued).
                Browser chat does not use this balance. Business accounts can{" "}
                <Link href={ROUTES.apiKeys} className="text-primary underline font-medium">
                  manage extra keys
                </Link>
                .
              </CardDescription>
            </div>
          </div>
          {activeWallet ? <BalanceBadge level={walletBalanceLevel(activeWallet.available_usd, activeWallet.balance_usd)} /> : null}
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {overallLevel === "depleted" ? (
          <Callout type="error" title="Credits exhausted">
            <p className="text-sm">Add credits below to run more API tasks. New keys receive {formatUsd(starterUsd)} automatically.</p>
          </Callout>
        ) : overallLevel === "low" ? (
          <Callout type="warning" title="Credits running low">
            <p className="text-sm">Top up soon to avoid API task interruptions.</p>
          </Callout>
        ) : null}

        {wallets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Loading your account API credit… If this persists, refresh the page or sign out and back in.
            Creator accounts receive {formatUsd(starterUsd)} starter credit automatically.
          </p>
        ) : activeWallet ? (
          <>
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Available now</p>
                <p
                  className={cn(
                    "text-4xl font-bold tabular-nums tracking-tight",
                    walletBalanceLevel(activeWallet.available_usd, activeWallet.balance_usd) === "depleted" &&
                      "text-rose-600 dark:text-rose-400",
                    walletBalanceLevel(activeWallet.available_usd, activeWallet.balance_usd) === "low" && "text-amber"
                  )}
                >
                  {formatUsd(activeWallet.available_usd)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm min-w-[12rem]">
                <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Prepaid</p>
                  <p className="font-semibold tabular-nums">{formatUsd(activeWallet.balance_usd)}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground uppercase">Used</p>
                  <p className="font-semibold tabular-nums">{formatUsd(activeWallet.accrued_cost_usd)}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Usage vs prepaid</span>
                <span className="tabular-nums">{pct(usedPct)} used</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    usedPct >= 0.9 ? "bg-rose-500" : usedPct >= 0.5 ? "bg-amber" : "bg-cyan-500"
                  )}
                  style={{ width: pct(usedPct) }}
                />
              </div>
            </div>
          </>
        ) : null}

        {wallets.length > 1 ? (
          <ul className="space-y-2 text-sm border border-border/50 rounded-lg p-3 max-h-40 overflow-y-auto">
            {wallets.map((w) => {
              const level = walletBalanceLevel(w.available_usd, w.balance_usd)
              const isActive = w.tenant_id === activeTenantId
              return (
                <li
                  key={w.tenant_id}
                  className={cn(
                    "flex justify-between gap-2 py-1.5 border-b border-border/30 last:border-0",
                    isActive && "font-medium"
                  )}
                >
                  <span className="truncate">{w.name ?? w.key_id}</span>
                  <span className="shrink-0 tabular-nums flex items-center gap-1.5">
                    <BalanceBadge level={level} />
                    {formatUsd(w.available_usd)}
                  </span>
                </li>
              )
            })}
          </ul>
        ) : null}

        <BillingTopUpForm
          data={data}
          apiKeys={apiKeys}
          wallets={wallets}
          depositMutation={depositMutation}
        />
      </CardContent>
    </Card>
  )
}

function BillingTopUpForm({
  data,
  apiKeys,
  wallets,
  depositMutation,
}: {
  data: ApiWalletResponse
  apiKeys?: ApiKeyRecord[]
  wallets: ApiWalletAppResponse["wallets"]
  depositMutation: ReturnType<typeof useWalletDeposit>
}) {
  const [amount, setAmount] = useState("10")
  const [keyId, setKeyId] = useState("")

  const options = useMemo(() => {
    if (apiKeys?.length) {
      return apiKeys.map((k) => ({ key_id: k.key_id, label: k.name || k.key_id }))
    }
    return wallets
      .filter((w): w is typeof w & { key_id: string } => Boolean(w.key_id))
      .map((w) => ({ key_id: w.key_id!, label: w.name ?? w.key_id! }))
  }, [apiKeys, wallets])

  const effectiveKeyId = keyId || options[0]?.key_id || ""

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = parseFloat(amount)
    if (!Number.isFinite(n) || n <= 0) return
    const payload: { amount_usd: number; key_id?: string } = { amount_usd: n }
    if (isAppWallet(data) && effectiveKeyId) payload.key_id = effectiveKeyId
    depositMutation.mutate(payload)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 sm:items-end border-t border-border/50 pt-4">
      {isAppWallet(data) && options.length > 0 ? (
        <div className="flex-1 min-w-[10rem]">
          <Label htmlFor="billingTopupKey">Top up key</Label>
          <select
            id="billingTopupKey"
            className="mt-1 w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm"
            value={effectiveKeyId}
            onChange={(e) => setKeyId(e.target.value)}
          >
            {options.map((o) => (
              <option key={o.key_id} value={o.key_id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="w-full sm:w-36">
        <Label htmlFor="billingTopupAmt">Amount (USD)</Label>
        <Input
          id="billingTopupAmt"
          type="number"
          min={0.01}
          step={0.01}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1"
          required
        />
      </div>
      <Button
        type="submit"
        disabled={depositMutation.isPending || (isAppWallet(data) && !effectiveKeyId)}
      >
        {depositMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add credits"}
      </Button>
    </form>
  )
}
