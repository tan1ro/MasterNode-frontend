"use client"

import {
  hydrateChatIntroFromProfile,
  type ChatIntroProfileSnapshot,
} from "@/lib/chat-intro-tour"
import {
  hydrateOnboardingFromProfile,
  type OnboardingProfileSnapshot,
} from "@/lib/onboarding"
import type { AuthProfileResponse } from "@/services/auth"

export function resolveProfileTenantId(
  tenantId: string | null | undefined,
  profile?: { tenant_id?: string | null } | null
): string {
  return (profile?.tenant_id || tenantId || "").trim()
}

/** Mirror server onboarding + chat tour flags into localStorage for this browser. */
export function hydrateUserExperienceFromProfile(
  tenantId: string,
  profile: AuthProfileResponse | OnboardingProfileSnapshot & ChatIntroProfileSnapshot | null | undefined
): string {
  const resolvedTenantId = resolveProfileTenantId(tenantId, profile)
  if (!resolvedTenantId) return ""
  hydrateOnboardingFromProfile(resolvedTenantId, profile)
  hydrateChatIntroFromProfile(resolvedTenantId, profile?.chat_intro_completed)
  return resolvedTenantId
}
