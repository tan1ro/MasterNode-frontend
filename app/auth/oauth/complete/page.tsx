"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { completeOAuthSignIn, isSuperUser, type AppUser } from "@/lib/app-auth"
import { syncAuthProfileFromApi } from "@/lib/sync-auth-profile"
import { isOnboardingComplete } from "@/lib/onboarding"
import { ROUTES } from "@/lib/routes"
import { ROLE_HOME, parseRole } from "@/lib/rbac"
import { safeRedirectPath } from "@/lib/safe-redirect"

function postAuthDestination(user: AppUser, redirectUrl: string | null) {
  const role = parseRole(user.accountType) ?? "creator"
  const defaultHome = isSuperUser(user) ? ROLE_HOME.business : ROLE_HOME[role]
  const redirect = safeRedirectPath(redirectUrl, defaultHome)
  if (isOnboardingComplete(user.id)) return redirect
  const params = new URLSearchParams()
  if (redirect && redirect !== ROUTES.onboarding) {
    params.set("redirect_url", redirect)
  }
  const qs = params.toString()
  return qs ? `${ROUTES.onboarding}?${qs}` : ROUTES.onboarding
}

function OAuthCompleteContent() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    let cancelled = false

    const run = async () => {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" })
        if (!res.ok) {
          throw new Error("Could not load your session after OAuth sign-in.")
        }
        const data = (await res.json()) as {
          access_token?: string | null
          session?: { userId?: string; accountType?: string }
        }
        const access = data.access_token?.trim()
        const userId = data.session?.userId?.trim()
        if (!access || !userId) {
          throw new Error("OAuth session was not established. Try signing in again.")
        }

        const user = await completeOAuthSignIn({
          tenantId: userId,
          email: "",
          accessToken: access,
        })
        if (cancelled) return

        // Profile sync continues in the background (also via AuthProfileSync).
        void syncAuthProfileFromApi()

        const destination = postAuthDestination(user, searchParams.get("redirect_url"))
        // Hard navigation so the app shell mounts immediately (no stuck spinner).
        window.location.replace(destination)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "OAuth sign-in failed.")
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [searchParams])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <a href={ROUTES.signIn} className="text-sm text-primary hover:underline">
          Back to sign in
        </a>
      </div>
    )
  }

  // Blank while hydrating — destination loads within one session round-trip.
  return <div className="min-h-screen bg-background" aria-busy="true" aria-label="Signing in" />
}

export default function OAuthCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" aria-busy="true" />}>
      <OAuthCompleteContent />
    </Suspense>
  )
}
