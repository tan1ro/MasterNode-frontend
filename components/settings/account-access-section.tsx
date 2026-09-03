"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ShieldAlert, UserCog } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog"
import { getErrorMessage } from "@/types/api"
import { signOut } from "@/lib/app-auth"
import {
  authService,
  type AccountType,
  type AccountPlan,
  type AuthProfileResponse,
} from "@/services/auth"
import { planDisplayName, type PricingPlanId } from "@/constants/pricing-plans"
import { ROUTES } from "@/lib/routes"

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  creator: "Creator",
  business: "Business",
}

function accountTypeFromProfile(profile: AuthProfileResponse | null): AccountType {
  const raw = String(profile?.account_type || "creator").toLowerCase()
  return raw === "developer" || raw === "development" || raw === "business" ? "business" : "creator"
}

function planLabel(plan: AccountPlan | string | undefined): string {
  const id = (plan || "free") as PricingPlanId
  return planDisplayName(id)
}

export function AccountAccessSection() {
  const [profile, setProfile] = useState<AuthProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [busyDelete, setBusyDelete] = useState<null | "soft" | "permanent">(null)
  const [confirmDeleteMode, setConfirmDeleteMode] = useState<null | "soft" | "permanent">(null)
  const [deleteDialogError, setDeleteDialogError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const me = await authService.me()
        if (!mounted) return
        setProfile(me)
      } catch (err) {
        if (!mounted) return
        setError(getErrorMessage(err, "Failed to load account profile"))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const accountType = accountTypeFromProfile(profile)
  const plan = (profile?.plan || "free") as AccountPlan

  const statusText = useMemo(() => {
    if (!profile) return "Unknown"
    if (profile.account_status === "soft_deleted") {
      return profile.purge_at
        ? `Scheduled delete on ${new Date(profile.purge_at).toLocaleString()}`
        : "Scheduled for deletion"
    }
    return "Active"
  }, [profile])

  const executeDelete = async (mode: "soft" | "permanent") => {
    setDeleteDialogError(null)
    setError(null)
    setMessage(null)
    setBusyDelete(mode)
    try {
      const out = await authService.deleteAccount(mode)
      setMessage(out.message || "Account deletion request submitted.")

      if (mode === "permanent") {
        signOut()
        window.location.assign("/sign-up")
        return
      }

      const me = await authService.me()
      setProfile(me)
      setConfirmDeleteMode(null)
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to delete account")
      setDeleteDialogError(msg)
      setError(msg)
    } finally {
      setBusyDelete(null)
    }
  }

  return (
    <Card variant="minimal" interactive={false} id="account" accent="violet">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-violet-400" />
          <div>
            <CardTitle>Account access & deletion</CardTitle>
            <CardDescription>
              View your account type and plan. Upgrade or change billing on the billing page. Workspace team roles are
              managed separately in your app workspace.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-border/60 bg-muted/10 p-3 text-sm space-y-2">
          <p>
            <span className="text-muted-foreground">Status:</span>{" "}
            <span className="font-medium">{loading ? "…" : statusText}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Account type:</span>{" "}
            <span className="font-medium">{loading ? "…" : ACCOUNT_TYPE_LABELS[accountType]}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Plan:</span>{" "}
            <span className="font-medium">{loading ? "…" : planLabel(plan)}</span>
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          To upgrade or change your subscription, use{" "}
          <Link href={ROUTES.billing} className="font-medium text-primary underline-offset-2 hover:underline">
            Billing
          </Link>
          . Organization roles (Admin/Member) are not changed here.
        </p>

        <Callout type="warning" title="Account deletion">
          Soft delete blocks account usage now and purges data after 30 days. Permanent delete removes all data
          immediately and cannot be undone.
        </Callout>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="border-amber/40 text-amber hover:bg-amber/10"
            onClick={() => {
              setDeleteDialogError(null)
              setConfirmDeleteMode("soft")
            }}
            disabled={loading || busyDelete !== null}
          >
            {busyDelete === "soft" ? "Scheduling..." : "Delete account (30-day soft delete)"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-red-500/40 text-red-400 hover:bg-red-500/10"
            onClick={() => {
              setDeleteDialogError(null)
              setConfirmDeleteMode("permanent")
            }}
            disabled={loading || busyDelete !== null}
          >
            <ShieldAlert className="h-4 w-4 mr-1" />
            {busyDelete === "permanent" ? "Deleting..." : "Delete permanently now"}
          </Button>
        </div>

        {message ? (
          <p className="text-xs text-emerald-500" role="status">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="text-xs text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <DeleteAccountDialog
          open={confirmDeleteMode !== null}
          mode={confirmDeleteMode}
          accountEmail={profile?.email || ""}
          isPending={busyDelete !== null}
          errorMessage={deleteDialogError}
          onOpenChange={(open) => {
            if (!open && busyDelete === null) {
              setConfirmDeleteMode(null)
              setDeleteDialogError(null)
            }
          }}
          onConfirm={() => {
            if (confirmDeleteMode) void executeDelete(confirmDeleteMode)
          }}
        />
      </CardContent>
    </Card>
  )
}
