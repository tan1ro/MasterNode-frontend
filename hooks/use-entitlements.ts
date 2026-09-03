"use client"

import { useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  canAccessFeature,
  featureBlockReason,
  upgradePlanForFeature,
  type EntitlementContext,
  type FeatureId,
} from "@/constants/entitlements"
import { resolveIsSuperUser } from "@/lib/app-auth"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"
import { authService } from "@/services/auth"

const PROFILE_QUERY_KEY = ["auth", "me", "entitlements"]

export function useEntitlements() {
  const { user, accountType, plan, isSuperUser } = useAppAuth()
  const queryEnabled = useProtectedQueryEnabled()

  const profileQuery = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => authService.me(),
    enabled: queryEnabled,
    staleTime: 60_000,
  })

  const resolvedAccountType = useMemo(() => {
    const fromApi = profileQuery.data?.account_type as string | undefined
    if (fromApi === "creator") return "creator"
    if (fromApi === "developer" || fromApi === "development" || fromApi === "business") return "business"
    return accountType
  }, [profileQuery.data?.account_type, accountType])

  const resolvedPlan = useMemo(() => {
    const fromApi = profileQuery.data?.plan
    if (fromApi) return fromApi
    return plan ?? "free"
  }, [profileQuery.data?.plan, plan])

  const subscriptionActive = useMemo(() => {
    const p = resolvedPlan
    return p !== "free"
  }, [resolvedPlan])

  const resolvedIsSuperUser = useMemo(
    () => resolveIsSuperUser({ user, profile: profileQuery.data }),
    [user, profileQuery.data]
  )

  const ctx: EntitlementContext = useMemo(
    () => ({
      accountType: resolvedAccountType,
      plan: resolvedPlan,
      isSuperUser: resolvedIsSuperUser,
      subscriptionActive,
    }),
    [resolvedAccountType, resolvedPlan, resolvedIsSuperUser, subscriptionActive]
  )

  const can = useCallback(
    (featureId: FeatureId) => canAccessFeature(ctx, featureId),
    [ctx]
  )

  const blockReason = useCallback(
    (featureId: FeatureId) => featureBlockReason(ctx, featureId),
    [ctx]
  )

  const upgradeTarget = useCallback(
    (featureId: FeatureId) => upgradePlanForFeature(featureId),
    []
  )

  return {
    ...ctx,
    can,
    blockReason,
    upgradeTarget,
    profile: profileQuery.data,
    profileLoading: profileQuery.isLoading,
    refetchProfile: profileQuery.refetch,
  }
}
