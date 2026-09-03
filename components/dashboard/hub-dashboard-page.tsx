"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { WorkspaceDashboardPanel } from "@/components/dashboard/workspace-dashboard-panel"
import { useAppAuth } from "@/hooks/use-app-auth"
import { ROUTES } from "@/lib/routes"
import { canAccessHubDashboard } from "@/lib/workspace-hub"
import { syncAuthProfileFromApi } from "@/lib/sync-auth-profile"
import { useEntitlements } from "@/hooks/use-entitlements"
import { useAuthSession } from "@/providers/auth-session-provider"
import { hasLocalAppSession } from "@/lib/session-token-store"
import { Callout } from "@/components/ui/callout"
import Link from "next/link"

type AccessGate = "loading" | "allowed" | "denied"

/** Business / superuser workspace dashboard at `/dashboard`. */
export function HubDashboardPage() {
  const router = useRouter()
  const { isSignedIn, user, accountType, hydrated } = useAppAuth()
  const entitlements = useEntitlements()
  const { authReady, authLoading } = useAuthSession()
  const [gate, setGate] = useState<AccessGate>("loading")
  const [synced, setSynced] = useState(false)

  const accessInput = useMemo(
    () => ({
      user,
      profile: entitlements.profile ?? null,
      accountType: entitlements.accountType ?? accountType,
      isSuperUser: entitlements.isSuperUser,
    }),
    [user, entitlements.profile, entitlements.accountType, entitlements.isSuperUser, accountType]
  )

  const allowed = useMemo(() => canAccessHubDashboard(accessInput), [accessInput])

  useEffect(() => {
    if (!hydrated) {
      setGate("loading")
      return
    }

    if (!isSignedIn) {
      setGate("denied")
      return
    }

    if (allowed) {
      setGate("allowed")
      return
    }

    const waitingOnAuth =
      authLoading || (hasLocalAppSession() && !authReady) || entitlements.profileLoading

    if (waitingOnAuth || !synced) {
      setGate("loading")
      if (synced) return

      let cancelled = false
      void (async () => {
        await syncAuthProfileFromApi()
        if (!cancelled) setSynced(true)
      })()

      return () => {
        cancelled = true
      }
    }

    setGate("denied")
  }, [
    hydrated,
    isSignedIn,
    allowed,
    authLoading,
    authReady,
    entitlements.profileLoading,
    synced,
  ])

  useEffect(() => {
    if (authLoading || gate !== "denied" || isSignedIn) return
    router.replace(ROUTES.signIn)
  }, [gate, isSignedIn, authLoading, router])

  if (gate === "loading") {
    return (
      <div className="container mx-auto px-4 py-12 text-sm text-muted-foreground">
        Loading dashboard…
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  if (gate === "denied") {
    return (
      <div className="container mx-auto max-w-lg px-4 py-12">
        <Callout type="warning" title="Dashboard not available">
          <p className="text-sm text-muted-foreground">
            The workspace dashboard is for business and superuser accounts. Your session is signed
            in as a creator account.
          </p>
          <p className="mt-3 text-sm">
            <Link href={ROUTES.chat} className="font-medium text-primary underline">
              Go to Chat
            </Link>
            {" · "}
            <Link href={ROUTES.settings} className="font-medium text-primary underline">
              Account settings
            </Link>
          </p>
        </Callout>
      </div>
    )
  }

  return <WorkspaceDashboardPanel variant="page" />
}
