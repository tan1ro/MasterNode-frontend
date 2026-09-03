"use client"

import { useCallback, useEffect, useState } from "react"
import {
  getCurrentUser,
  isSuperUser as isSuperUserUser,
  planMeetsMinimum,
  signOut,
  subscribeAuth,
  type AppAccountType,
  type AppPlan,
} from "@/lib/app-auth"

export function useAppAuth() {
  const [state, setState] = useState<{
    user: ReturnType<typeof getCurrentUser>
    isSignedIn: boolean
  }>({
    user: null,
    isSignedIn: false,
  })
  /** False on SSR/first paint so server HTML matches before localStorage is read. */
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const refresh = () => {
      setState((prev) => {
        const nextUser = getCurrentUser()
        const nextSignedIn = Boolean(nextUser)
        if (
          prev.user?.id === nextUser?.id &&
          prev.user?.accountType === nextUser?.accountType &&
          prev.user?.plan === nextUser?.plan &&
          prev.isSignedIn === nextSignedIn
        ) {
          return prev
        }
        return {
          user: nextUser,
          isSignedIn: nextSignedIn,
        }
      })
    }

    const unsubscribe = subscribeAuth(refresh)
    refresh()
    setHydrated(true)
    return unsubscribe
  }, [])

  const can = useCallback(
    (requirement: { role?: AppAccountType | "any"; minPlan?: AppPlan } = {}) => {
      const role = requirement.role ?? "any"
      const type = hydrated ? state.user?.accountType ?? null : null
      const userPlan = hydrated ? state.user?.plan ?? null : null
      if (role !== "any" && type !== role) return false
      if (requirement.minPlan && !planMeetsMinimum(userPlan, requirement.minPlan)) return false
      return true
    },
    [hydrated, state.user?.accountType, state.user?.plan]
  )

  const user = hydrated ? state.user : null
  const signedIn = hydrated && state.isSignedIn

  return {
    user,
    isSignedIn: signedIn,
    hydrated,
    isSuperUser: isSuperUserUser(user),
    accountType: user?.accountType ?? null,
    plan: user?.plan ?? null,
    can,
    signOut,
  }
}
