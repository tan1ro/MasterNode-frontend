"use client"

import {
  ONBOARDING_ATTRIBUTION_OPTIONS,
  ONBOARDING_BUILD_GOAL_OPTIONS,
  ONBOARDING_ROLE_OPTIONS,
} from "@/constants/onboarding"
import { authService } from "@/services/auth"

export interface OnboardingAnswers {
  role?: string
  /** Free-text value when `role === "other"`. */
  role_other?: string
  build_goal?: string
  attribution?: string
  /** Free-text value when `attribution === "other"`. */
  attribution_other?: string
  work_context?: string
  work_context_skipped?: boolean
  use_case_summary?: string
  knowledge_file_ids?: string[]
  legal_consents?: Record<string, string>
  skipped?: boolean
  completed_at?: string
}

const STORAGE_PREFIX = "mn_onboarding_v1"
const DRAFT_PREFIX = "mn_onboarding_draft_v1"

function storageKey(tenantId: string): string {
  return `${STORAGE_PREFIX}:${tenantId.trim()}`
}

function draftKey(tenantId: string): string {
  return `${DRAFT_PREFIX}:${tenantId.trim()}`
}

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && typeof localStorage?.getItem === "function"
  } catch {
    return false
  }
}

function canUseSession(): boolean {
  try {
    return typeof window !== "undefined" && typeof sessionStorage?.getItem === "function"
  } catch {
    return false
  }
}

function optionLabel(
  options: ReadonlyArray<{ id: string; label: string }>,
  id?: string
): string | undefined {
  if (!id) return undefined
  return options.find((option) => option.id === id)?.label
}

export function onboardingUseCaseSummary(answers: OnboardingAnswers): string {
  const role =
    answers.role === "other" && answers.role_other?.trim()
      ? answers.role_other.trim()
      : optionLabel(ONBOARDING_ROLE_OPTIONS, answers.role)
  const goal = optionLabel(ONBOARDING_BUILD_GOAL_OPTIONS, answers.build_goal)
  const attribution =
    answers.attribution === "other" && answers.attribution_other?.trim()
      ? answers.attribution_other.trim()
      : optionLabel(ONBOARDING_ATTRIBUTION_OPTIONS, answers.attribution)
  return [role, goal, attribution].filter(Boolean).join(" · ")
}

/** Durable local flag only — full answers live on the server / session draft. */
type LocalOnboardingFlag = {
  completed_at?: string
  skipped?: boolean
}

function compactLocalFlag(answers: OnboardingAnswers): LocalOnboardingFlag {
  const out: LocalOnboardingFlag = {}
  if (answers.completed_at) out.completed_at = answers.completed_at
  if (answers.skipped) out.skipped = true
  return out
}

function readLocalFlag(tenantId: string): LocalOnboardingFlag | null {
  if (!canUseStorage() || !tenantId.trim()) return null
  try {
    const raw = localStorage.getItem(storageKey(tenantId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as OnboardingAnswers
    if (!parsed || typeof parsed !== "object") return null
    // Migrate legacy full dumps → completion flag only.
    if (
      parsed.role ||
      parsed.build_goal ||
      parsed.attribution ||
      parsed.use_case_summary ||
      parsed.legal_consents ||
      parsed.work_context
    ) {
      const flag = compactLocalFlag(parsed)
      localStorage.setItem(storageKey(tenantId), JSON.stringify(flag))
      return flag
    }
    return compactLocalFlag(parsed)
  } catch {
    return null
  }
}

function writeLocalFlag(tenantId: string, flag: LocalOnboardingFlag): void {
  if (!canUseStorage() || !tenantId.trim()) return
  try {
    if (!flag.completed_at && !flag.skipped) {
      localStorage.removeItem(storageKey(tenantId))
      return
    }
    localStorage.setItem(storageKey(tenantId), JSON.stringify(compactLocalFlag(flag)))
  } catch {
    // Storage may be unavailable (private mode, quota).
  }
}

function readSessionDraft(tenantId: string): OnboardingAnswers | null {
  if (!canUseSession() || !tenantId.trim()) return null
  try {
    const raw = sessionStorage.getItem(draftKey(tenantId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as OnboardingAnswers
    return parsed && typeof parsed === "object" ? parsed : null
  } catch {
    return null
  }
}

function writeSessionDraft(tenantId: string, answers: OnboardingAnswers): void {
  if (!canUseSession() || !tenantId.trim()) return
  try {
    const draft = { ...answers }
    delete draft.completed_at
    sessionStorage.setItem(draftKey(tenantId), JSON.stringify(draft))
  } catch {
    // ignore
  }
}

function clearSessionDraft(tenantId: string): void {
  if (!canUseSession() || !tenantId.trim()) return
  try {
    sessionStorage.removeItem(draftKey(tenantId))
  } catch {
    // ignore
  }
}

/**
 * Returns in-progress answers (session) merged with completion flag (local).
 * Full questionnaire PII is not kept in durable localStorage.
 */
export function readLocalOnboarding(tenantId: string): OnboardingAnswers | null {
  const flag = readLocalFlag(tenantId)
  const draft = readSessionDraft(tenantId)
  if (!flag && !draft) return null
  return { ...(draft || {}), ...(flag || {}) }
}

export function writeLocalOnboarding(tenantId: string, answers: OnboardingAnswers): void {
  if (answers.completed_at || answers.skipped) {
    writeLocalFlag(tenantId, compactLocalFlag(answers))
    clearSessionDraft(tenantId)
    return
  }
  writeSessionDraft(tenantId, answers)
}

export interface OnboardingProfileSnapshot {
  onboarding_completed?: boolean
  onboarding?: OnboardingAnswers
}

export function hydrateOnboardingFromProfile(
  tenantId: string,
  profile: OnboardingProfileSnapshot | null | undefined
): void {
  if (!tenantId.trim()) return
  if (profile?.onboarding_completed) {
    const existing = readLocalFlag(tenantId)
    if (existing?.completed_at) return
    const fromServer =
      profile.onboarding && typeof profile.onboarding === "object" ? profile.onboarding : {}
    writeLocalFlag(tenantId, {
      completed_at: fromServer.completed_at ?? new Date().toISOString(),
      skipped: fromServer.skipped,
    })
    clearSessionDraft(tenantId)
    return
  }
  const local = readLocalOnboarding(tenantId)
  if (local?.completed_at) {
    void authService.saveOnboarding(local).catch(() => {
      // Retry on a later profile sync / login.
    })
    return
  }
  // Restore in-progress answers from the server into session draft only.
  const fromServer =
    profile?.onboarding && typeof profile.onboarding === "object" ? profile.onboarding : null
  if (fromServer && Object.keys(fromServer).length > 0 && !readSessionDraft(tenantId)) {
    const draft = { ...fromServer }
    delete draft.completed_at
    writeSessionDraft(tenantId, draft)
  }
}

export function isOnboardingComplete(tenantId: string, profileCompleted?: boolean): boolean {
  if (profileCompleted) return true
  const local = readLocalFlag(tenantId)
  return Boolean(local?.completed_at)
}

export async function persistOnboarding(
  tenantId: string,
  answers: OnboardingAnswers,
  options?: { complete?: boolean }
): Promise<void> {
  const complete = options?.complete !== false && Boolean(answers.completed_at)
  const payload: OnboardingAnswers = {
    ...answers,
    use_case_summary: answers.use_case_summary ?? onboardingUseCaseSummary(answers),
  }
  if (complete) {
    payload.completed_at = answers.completed_at ?? new Date().toISOString()
  } else {
    delete payload.completed_at
  }
  writeLocalOnboarding(tenantId, payload)
  try {
    await authService.saveOnboarding(payload)
  } catch {
    // Local / session copy remains; server sync retries on next profile fetch / login.
  }
}

/** Persist in-progress answers without marking onboarding complete. */
export async function persistOnboardingProgress(
  tenantId: string,
  answers: OnboardingAnswers
): Promise<void> {
  if (!tenantId.trim()) return
  const existing = readLocalOnboarding(tenantId)
  const merged: OnboardingAnswers = { ...existing, ...answers }
  delete merged.completed_at
  writeLocalOnboarding(tenantId, merged)
  try {
    await authService.saveOnboarding({
      ...merged,
      use_case_summary: merged.use_case_summary ?? onboardingUseCaseSummary(merged),
    })
  } catch {
    // Session draft remains; retry on finish / next login.
  }
}

export function onboardingDestination(
  redirectUrl: string | null | undefined,
  defaultHome: string
): string {
  const trimmed = (redirectUrl || "").trim()
  if (trimmed && trimmed !== "/onboarding" && !trimmed.startsWith("/onboarding/")) {
    return trimmed
  }
  return defaultHome
}
