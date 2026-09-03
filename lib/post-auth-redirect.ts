"use client"

import { hydrateUserExperienceFromProfile } from "@/lib/user-experience-state"
import { ROUTES } from "@/lib/routes"

/** After auth, send new users to onboarding unless already completed. */
export async function resolvePostAuthDestination(
  tenantId: string,
  defaultHome: string,
  redirectUrl?: string | null
): Promise<string> {
  const { isOnboardingComplete, onboardingDestination } = await import("@/lib/onboarding")
  const { authService } = await import("@/services/auth")

  let resolvedTenantId = tenantId.trim()
  let completed = false

  try {
    const profile = await authService.me()
    resolvedTenantId = hydrateUserExperienceFromProfile(resolvedTenantId, profile) || resolvedTenantId
    completed = isOnboardingComplete(resolvedTenantId, profile.onboarding_completed)
  } catch {
    completed = isOnboardingComplete(resolvedTenantId)
  }

  if (!completed) {
    const next = onboardingDestination(redirectUrl, defaultHome)
    const params = new URLSearchParams()
    if (next && next !== ROUTES.onboarding) {
      params.set("redirect_url", next)
    }
    const qs = params.toString()
    return qs ? `${ROUTES.onboarding}?${qs}` : ROUTES.onboarding
  }

  return onboardingDestination(redirectUrl, defaultHome)
}
