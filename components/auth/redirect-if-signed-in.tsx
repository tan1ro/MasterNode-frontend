"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getCurrentUser, isSignedIn, subscribeAuth } from "@/lib/app-auth"
import { resolvePostAuthDestination } from "@/lib/post-auth-redirect"
import { ROLE_HOME, parseRole } from "@/lib/rbac"
import { ROUTES } from "@/lib/routes"
import { safeRedirectPath } from "@/lib/safe-redirect"

/** Sends authenticated users away from sign-in / sign-up (client-side only). */
export function RedirectIfSignedIn({ to }: { to?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const redirect = async () => {
      if (!isSignedIn()) return
      if (to) {
        router.replace(to)
        return
      }
      const user = getCurrentUser()
      if (!user) {
        router.replace(safeRedirectPath(searchParams.get("redirect_url"), ROUTES.chat))
        return
      }
      const role = parseRole(user.accountType) ?? "creator"
      const defaultHome = ROLE_HOME[role]
      const destination = await resolvePostAuthDestination(
        user.id,
        defaultHome,
        searchParams.get("redirect_url")
      )
      router.replace(destination)
    }
    void redirect()
    return subscribeAuth(() => {
      void redirect()
    })
  }, [router, to, searchParams])

  return null
}
