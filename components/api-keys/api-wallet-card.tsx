"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Wallet, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Callout } from "@/components/ui/callout"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { LoadingState } from "@/components/shared/loading-state"
import { useWallet, useWalletDeposit } from "@/hooks/use-wallet"
import type { ApiKeyRecord, ApiWalletAppResponse, ApiWalletKeyResponse, ApiWalletResponse } from "@/types/api"
import { ROUTES } from "@/lib/routes"
import {
  formatWalletLevelLabel,
  walletBalanceLevel,
  worstWalletLevel,
  WALLET_LOW_AVAILABLE_USD,
  type WalletBalanceLevel,
} from "@/lib/wallet-balance"
import { cn } from "@/lib/utils"

function formatUsd(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 4 }).format(
    n
  )
}

interface ApiWalletCardProps {
  apiKeys?: ApiKeyRecord[] | undefined
  /** Billing: one consolidated block; shorter copy and permission badges on each key */
  variant?: "default" | "billing"
}

function PermissionBadges({ read, write }: { read?: boolean; write?: boolean }) {
  const canRead = read !== false
  const canWrite = write !== false
  return (
    <span className="flex flex-wrap gap-1 mt-1">
      <span
        className={
          canRead
            ? "text-[10px] px-1.5 py-0.5 rounded border border-emerald/30 bg-emerald/10 text-emerald"
            : "text-[10px] px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground line-through"
        }
      >
        Read
      </span>
      <span
        className={
          canWrite
            ? "text-[10px] px-1.5 py-0.5 rounded border border-amber/35 bg-amber/10 text-amber"
            : "text-[10px] px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground line-through"
        }
      >
        Write
      </span>
    </span>
  )
}

function isAppWallet(d: ApiWalletResponse): d is ApiWalletAppResponse {
  return d.auth === "app"
}

function isKeyWallet(d: ApiWalletResponse): d is ApiWalletKeyResponse {
  return d.auth === "api_key"
}

function BalanceLevelBadge({ level }: { level: WalletBalanceLevel }) {
  if (level === "healthy") return null
  return (
    <span
      className={cn(
        "text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded border shrink-0",
        level === "depleted"
          ? "border-rose-500/40 bg-rose-500/15 text-rose-600 dark:text-rose-400"
          : "border-amber/40 bg-amber/15 text-amber"
      )}
    >
      {formatWalletLevelLabel(level)}
    </span>
  )
}

function WalletBalanceSummary({
  availableUsd,
  prepaidUsd,
  accruedUsd,
  className,
}: {
  availableUsd: number
  prepaidUsd: number
  accruedUsd: number
  className?: string
}) {
  const level = walletBalanceLevel(availableUsd, prepaidUsd)
  return (
    <div className={cn("rounded-lg border p-3 text-sm space-y-1", className)}>
      <div className="flex justify-between items-center gap-2">
        <span className="text-muted-foreground">Available</span>
        <span className="flex items-center gap-2">
          <BalanceLevelBadge level={level} />
          <span
            className={cn(
              "font-semibold tabular-nums",
              level === "depleted" && "text-rose-600 dark:text-rose-400",
              level === "low" && "text-amber"
            )}
          >
            {formatUsd(availableUsd)}
          </span>
        </span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Prepaid balance</span>
        <span className="tabular-nums">{formatUsd(prepaidUsd)}</span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Accrued API usage</span>
        <span className="tabular-nums">{formatUsd(accruedUsd)}</span>
      </div>
    </div>
  )
}

function WalletCreditsNotice({
  overallLevel,
  lowKeyNames,
}: {
  overallLevel: WalletBalanceLevel
  lowKeyNames: string[]
}) {
  if (overallLevel === "depleted") {
    return (
      <Callout type="error" title="Credits exhausted">
        <p className="text-sm">
          {lowKeyNames.length > 0 ? (
            <>
              <strong>{lowKeyNames.join(", ")}</strong> {lowKeyNames.length === 1 ? "has" : "have"} no available
              balance. API tasks and RAG uploads using <code className="text-xs">X-API-Key</code> are blocked until you
              add credits below. Browser chat is not affected.
            </>
          ) : (
            <>
              Available balance is $0. Add credits below to resume API tasks. Browser chat does not use this wallet.
            </>
          )}
        </p>
      </Callout>
    )
  }

  if (overallLevel === "low") {
    return (
      <Callout type="warning" title="Credits running low">
        <p className="text-sm">
          {lowKeyNames.length > 0 ? (
            <>
              <strong>{lowKeyNames.join(", ")}</strong> {lowKeyNames.length === 1 ? "is" : "are"} below about{" "}
              {formatUsd(WALLET_LOW_AVAILABLE_USD)} available (or under 25% of prepaid left). Top up soon so API tasks
              are not interrupted.
            </>
          ) : (
            <>
              Available balance is below about {formatUsd(WALLET_LOW_AVAILABLE_USD)} or under 25% of prepaid. Add
              credits below before API usage stops.
            </>
          )}
        </p>
      </Callout>
    )
  }

  return null
}

export function ApiWalletCard({ apiKeys, variant = "default" }: ApiWalletCardProps) {
  const billing = variant === "billing"
  const { data, isLoading, error } = useWallet()
  const depositMutation = useWalletDeposit()
  const [amount, setAmount] = useState("10")
  const [keyId, setKeyId] = useState("")
  const [depositError, setDepositError] = useState<unknown>(null)

  const appKeyOptions = useMemo(() => {
    if (!data || !isAppWallet(data)) return []
    if (apiKeys?.length) {
      return apiKeys.map((k) => ({ key_id: k.key_id, label: `${k.name} (${k.key_id})` }))
    }
    return (data.wallets ?? [])
      .filter((w): w is typeof w & { key_id: string } => Boolean(w.key_id))
      .map((w) => ({ key_id: w.key_id!, label: `${w.name ?? w.key_id} (${w.key_id})` }))
  }, [apiKeys, data])

  const effectiveKeyId = keyId || appKeyOptions[0]?.key_id || ""

  const walletRows = useMemo(() => {
    if (!data) return []
    if (isAppWallet(data)) return data.wallets ?? []
    if (isKeyWallet(data) && data.wallet_required) {
      return [
        {
          tenant_id: data.tenant_id,
          available_usd: data.available_usd,
          balance_usd: data.balance_usd,
          accrued_cost_usd: data.accrued_cost_usd,
          name: "This API key",
          key_id: undefined as string | undefined,
        },
      ]
    }
    return []
  }, [data])

  const overallLevel = useMemo(() => worstWalletLevel(walletRows), [walletRows])

  const lowKeyNames = useMemo(
    () =>
      walletRows
        .filter((w) => walletBalanceLevel(w.available_usd, w.balance_usd) !== "healthy")
        .map((w) => w.name ?? w.key_id ?? "API key"),
    [walletRows]
  )

  if (isLoading) {
    return (
      <Card accent="cyan">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5 text-cyan-400" />
            {billing ? "API key & prepaid balance" : "API prepaid wallet"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState message="Loading wallet…" size="sm" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card accent="cyan">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5 text-cyan-400" />
            {billing ? "API key & prepaid balance" : "API prepaid wallet"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Callout type="error" title="Could not load wallet">
            <p className="text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
          </Callout>
        </CardContent>
      </Card>
    )
  }

  if (!data?.api_wallet_enabled) {
    return (
      <Card accent="cyan">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5 text-cyan-400" />
            {billing ? "API key & prepaid balance" : "API prepaid wallet"}
          </CardTitle>
          <CardDescription>Billing from a prepaid balance is turned off on the server.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const onDeposit = (e: React.FormEvent) => {
    e.preventDefault()
    const n = parseFloat(amount)
    if (!Number.isFinite(n) || n <= 0) return
    const payload: { amount_usd: number; key_id?: string } = { amount_usd: n }
    if (isAppWallet(data)) {
      if (!effectiveKeyId) return
      payload.key_id = effectiveKeyId
    }
    setDepositError(null)
    depositMutation.mutate(payload, {
      onError: (err) => setDepositError(err),
      onSuccess: () => {
        setAmount("10")
        setDepositError(null)
      },
    })
  }

  return (
    <Card accent="cyan">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-cyan-400 shrink-0" />
            <div>
              <CardTitle>{billing ? "API key & prepaid balance" : "API prepaid wallet"}</CardTitle>
              <CardDescription>
                {billing ? (
                  <>
                    One place for <code className="text-xs">X-API-Key</code> wallet top-up and each key&apos;s{" "}
                    <strong>Read</strong>/<strong>Write</strong> scope. Browser chat is separate.{" "}
                    <Link href={ROUTES.apiKeys} className="text-primary underline font-medium">
                      API Keys
                    </Link>{" "}
                    ·{" "}
                    <Link href={`${ROUTES.docs}#api-key-permissions`} className="text-primary underline font-medium">
                      Permissions reference
                    </Link>
                  </>
                ) : (
                  <>
                    IDE and script calls using <code className="text-xs">X-API-Key</code> draw from this balance (tasks
                    and RAG uploads). Chat in the browser does not use this wallet.
                  </>
                )}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {depositError ? (
          <ApiErrorCallout error={depositError} title="Deposit failed" fallbackMessage="Deposit failed" />
        ) : null}
        <WalletCreditsNotice overallLevel={overallLevel} lowKeyNames={lowKeyNames} />

        {isAppWallet(data) ? (
          <div className="space-y-3">
            {(data.wallets ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No keys yet.{" "}
                <Link href={ROUTES.apiKeys} className="text-primary underline font-medium">
                  Create an API key once
                </Link>{" "}
                (set Read/Write there), then return here to add credits.
              </p>
            ) : (
              <ul className="space-y-2 text-sm border border-border/50 rounded-lg p-3 max-h-56 overflow-y-auto">
                {data.wallets!.map((w) => {
                  const level = walletBalanceLevel(w.available_usd, w.balance_usd)
                  return (
                    <li
                      key={w.tenant_id}
                      className={cn(
                        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/30 last:border-0 pb-2 last:pb-0 rounded-md -mx-1 px-1",
                        level === "depleted" && "bg-rose-500/5",
                        level === "low" && "bg-amber/5"
                      )}
                    >
                      <div className="min-w-0">
                        <span className="font-medium flex items-center gap-2 flex-wrap">
                          {w.name ?? w.key_id}
                          <BalanceLevelBadge level={level} />
                        </span>
                        <span className="text-muted-foreground text-xs block font-mono truncate">{w.key_id}</span>
                        <PermissionBadges read={w.read} write={w.write} />
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          className={cn(
                            "tabular-nums",
                            level === "depleted" && "text-rose-600 dark:text-rose-400 font-semibold",
                            level === "low" && "text-amber font-medium"
                          )}
                        >
                          Available {formatUsd(w.available_usd)}
                        </div>
                        <div className="text-xs text-muted-foreground tabular-nums">
                          Prepaid {formatUsd(w.balance_usd)} · Used {formatUsd(w.accrued_cost_usd)}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            <form onSubmit={onDeposit} className="space-y-3 border-t border-border/50 pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor={billing ? "walletKeyBilling" : "walletKey"}>Credit wallet for key</Label>
                  <select
                    id={billing ? "walletKeyBilling" : "walletKey"}
                    className="mt-1 w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm"
                    value={effectiveKeyId}
                    onChange={(e) => setKeyId(e.target.value)}
                    required
                  >
                    {appKeyOptions.length === 0 ? (
                      <option value="">No keys</option>
                    ) : (
                      appKeyOptions.map((o) => (
                        <option key={o.key_id} value={o.key_id}>
                          {o.label}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <Label htmlFor={billing ? "walletAmtBilling" : "walletAmt"}>Amount (USD)</Label>
                  <Input
                    id={billing ? "walletAmtBilling" : "walletAmt"}
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={depositMutation.isPending || appKeyOptions.length === 0}>
                {depositMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add credits"}
              </Button>
            </form>
          </div>
        ) : isKeyWallet(data) ? (
          <div className="space-y-3">
            {billing && data.wallet_required && (data.read !== undefined || data.write !== undefined) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">This key</span>
                <PermissionBadges read={data.read} write={data.write} />
              </div>
            )}
            <WalletBalanceSummary
              availableUsd={data.available_usd}
              prepaidUsd={data.balance_usd}
              accruedUsd={data.accrued_cost_usd}
              className={cn(
                "border-border/50",
                walletBalanceLevel(data.available_usd, data.balance_usd) === "depleted" &&
                  "border-rose-500/40 bg-rose-500/5",
                walletBalanceLevel(data.available_usd, data.balance_usd) === "low" && "border-amber/40 bg-amber/5"
              )}
            />
            {!data.wallet_required ? (
              <p className="text-xs text-muted-foreground">This credential does not use the prepaid API wallet.</p>
            ) : (
              <form onSubmit={onDeposit} className="flex flex-col sm:flex-row gap-2 sm:items-end">
                <div className="flex-1">
                  <Label htmlFor={billing ? "walletAmtKeyBilling" : "walletAmtKey"}>Amount (USD)</Label>
                  <Input
                    id={billing ? "walletAmtKeyBilling" : "walletAmtKey"}
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <Button type="submit" disabled={depositMutation.isPending}>
                  {depositMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add credits"}
                </Button>
              </form>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
