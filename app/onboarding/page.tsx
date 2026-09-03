"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { OnboardingCompleteScreen } from "@/components/onboarding/onboarding-complete-screen"
import { EnvironmentProvisioningScreen } from "@/components/onboarding/environment-provisioning-screen"
import { OnboardingKnowYouStep } from "@/components/onboarding/onboarding-know-you-step"
import { OnboardingLegalConsentStep } from "@/components/onboarding/onboarding-legal-consent-step"
import { OnboardingOptionList } from "@/components/onboarding/onboarding-option-list"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { OnboardingStepProgress } from "@/components/onboarding/onboarding-step-progress"
import { PiMark } from "@/components/layout/brand-logo"
import {
  ONBOARDING_ATTRIBUTION_OPTIONS,
  ONBOARDING_BUILD_GOAL_OPTIONS,
  ONBOARDING_ROLE_OPTIONS,
  ONBOARDING_STEPS,
} from "@/constants/onboarding"
import { ONBOARDING_LEGAL_CONSENTS } from "@/constants/onboarding-legal-consents"
import { useAppAuth } from "@/hooks/use-app-auth"
import { markPendingChatIntro, isChatIntroCompleted } from "@/lib/chat-intro-tour"
import {
  isOnboardingComplete,
  onboardingDestination,
  persistOnboarding,
  persistOnboardingProgress,
  readLocalOnboarding,
  type OnboardingAnswers,
} from "@/lib/onboarding"
import { hydrateUserExperienceFromProfile } from "@/lib/user-experience-state"
import { ROLE_HOME, parseRole } from "@/lib/rbac"
import { ROUTES } from "@/lib/routes"
import { safeRedirectPath } from "@/lib/safe-redirect"
import { authService } from "@/services/auth"
import { cn } from "@/lib/utils"

type WizardStep = 0 | 1 | 2 | 3 | 4 | "provisioning" | "complete"
type StepAdvance = WizardStep | "finish"

function OnboardingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, hydrated, isSignedIn } = useAppAuth()
  const [step, setStep] = useState<WizardStep>(0)
  const [answers, setAnswers] = useState<OnboardingAnswers>({})
  const [otherDraft, setOtherDraft] = useState("")
  const [workContext, setWorkContext] = useState("")
  const [legalAccepted, setLegalAccepted] = useState<Record<string, boolean>>({})
  const [legalShowErrors, setLegalShowErrors] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [profileChecked, setProfileChecked] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const tenantId = user?.id ?? ""
  const defaultHome = useMemo(() => {
    const role = parseRole(user?.accountType) ?? "creator"
    return ROLE_HOME[role]
  }, [user?.accountType])

  const destination = onboardingDestination(
    safeRedirectPath(searchParams.get("redirect_url"), defaultHome),
    defaultHome
  )

  useEffect(() => {
    if (!hydrated) return

    if (!isSignedIn || !user) {
      setRedirecting(true)
      router.replace(`${ROUTES.signIn}?redirect_url=${encodeURIComponent(ROUTES.onboarding)}`)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const profile = await authService.me()
        if (cancelled) return
        hydrateUserExperienceFromProfile(tenantId, profile)
        const resolvedTenantId = profile.tenant_id?.trim() || tenantId
        if (isOnboardingComplete(resolvedTenantId, profile.onboarding_completed)) {
          setRedirecting(true)
          router.replace(destination)
          return
        }
      } catch {
        if (isOnboardingComplete(tenantId)) {
          setRedirecting(true)
          router.replace(destination)
          return
        }
      } finally {
        if (!cancelled) {
          const local = readLocalOnboarding(tenantId)
          if (local) {
            setAnswers(local)
            if (local.work_context) setWorkContext(local.work_context)
            if (local.legal_consents) {
              setLegalAccepted(
                Object.fromEntries(Object.keys(local.legal_consents).map((id) => [id, true]))
              )
            }
          }
          setProfileChecked(true)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [hydrated, isSignedIn, user, tenantId, router, destination])

  const finish = useCallback(
    async (finalAnswers: OnboardingAnswers, skipped = false) => {
      if (!tenantId || submitting) return
      setSubmitting(true)
      try {
        await persistOnboarding(
          tenantId,
          {
            ...finalAnswers,
            skipped,
            completed_at: new Date().toISOString(),
          },
          { complete: true }
        )
        setStep("provisioning")
      } finally {
        setSubmitting(false)
      }
    },
    [submitting, tenantId]
  )

  const saveProgress = useCallback(
    (nextAnswers: OnboardingAnswers) => {
      if (!tenantId) return
      void persistOnboardingProgress(tenantId, nextAnswers)
    },
    [tenantId]
  )

  const selectAndAdvance = useCallback(
    (field: keyof OnboardingAnswers, value: string, next: StepAdvance) => {
      const nextAnswers = { ...answers, [field]: value }
      setAnswers(nextAnswers)
      saveProgress(nextAnswers)
      if (next === "finish") {
        void finish(nextAnswers)
        return
      }
      setStep(next)
    },
    [answers, finish, saveProgress]
  )

  const skip = useCallback(() => {
    if (step === "provisioning" || step === 4) return
    if (step < 3) {
      setStep((step + 1) as WizardStep)
      return
    }
    if (step === 3) {
      const nextAnswers = { ...answers, work_context_skipped: true }
      setAnswers(nextAnswers)
      saveProgress(nextAnswers)
      setStep(4)
    }
  }, [answers, saveProgress, step])

  const saveWorkContext = useCallback(() => {
    const trimmed = workContext.trim()
    if (!trimmed) return
    const nextAnswers = {
      ...answers,
      work_context: trimmed,
      work_context_skipped: false,
    }
    setAnswers(nextAnswers)
    saveProgress(nextAnswers)
    setStep(4)
  }, [answers, saveProgress, workContext])

  const toggleLegalConsent = useCallback((id: string, checked: boolean) => {
    setLegalAccepted((prev) => ({ ...prev, [id]: checked }))
    if (checked) setLegalShowErrors(false)
  }, [])

  const completeLegalStep = useCallback(() => {
    const allRequired = ONBOARDING_LEGAL_CONSENTS.filter((c) => c.required).every(
      (c) => legalAccepted[c.id]
    )
    if (!allRequired) {
      setLegalShowErrors(true)
      return
    }
    const acceptedAt = new Date().toISOString()
    const legal_consents = Object.fromEntries(
      ONBOARDING_LEGAL_CONSENTS.filter((c) => legalAccepted[c.id]).map((c) => [c.id, acceptedAt])
    )
    const nextAnswers: OnboardingAnswers = {
      ...answers,
      ...(workContext.trim()
        ? { work_context: workContext.trim(), work_context_skipped: false }
        : {}),
      legal_consents,
    }
    setAnswers(nextAnswers)
    void finish(nextAnswers)
  }, [answers, finish, legalAccepted, workContext])

  const enterApp = useCallback(() => {
    if (tenantId && !isChatIntroCompleted(tenantId)) {
      markPendingChatIntro(tenantId)
    }
    router.replace(destination)
  }, [destination, router, tenantId])

  const showLoading = !hydrated || !profileChecked || redirecting || !user

  if (showLoading) {
    return (
      <OnboardingShell bare>
        <Loader2 className="h-8 w-8 animate-spin text-[#B0F900]" aria-label="Loading" />
      </OnboardingShell>
    )
  }

  if (step === "provisioning") {
    return <EnvironmentProvisioningScreen onComplete={() => setStep("complete")} />
  }

  if (step === "complete") {
    return <OnboardingCompleteScreen onContinue={enterApp} />
  }

  const meta = ONBOARDING_STEPS[step]
  const isKnowYouStep = step === 3
  const isLegalStep = step === 4

  const options =
    step === 0
      ? ONBOARDING_ROLE_OPTIONS
      : step === 1
        ? ONBOARDING_BUILD_GOAL_OPTIONS
        : ONBOARDING_ATTRIBUTION_OPTIONS

  const optionField: keyof OnboardingAnswers =
    step === 0 ? "role" : step === 1 ? "build_goal" : "attribution"
  const optionNext: StepAdvance = step === 0 ? 1 : step === 1 ? 2 : 3
  const otherField = (optionField === "role"
    ? "role_other"
    : "attribution_other") as keyof OnboardingAnswers
  const supportsOther = optionField !== "build_goal"
  const isOtherActive = supportsOther && answers[optionField] === "other"

  const onSelect = (id: string) => {
    if (supportsOther && id === "other") {
      const nextAnswers = { ...answers, [optionField]: "other" }
      setAnswers(nextAnswers)
      saveProgress(nextAnswers)
      setOtherDraft((answers[otherField] as string | undefined)?.trim() ?? "")
      return
    }
    selectAndAdvance(optionField, id, optionNext)
  }

  const confirmOther = () => {
    const text = otherDraft.trim()
    if (!text) return
    const nextAnswers = { ...answers, [optionField]: "other", [otherField]: text }
    setAnswers(nextAnswers)
    saveProgress(nextAnswers)
    setOtherDraft("")
    if (optionNext === "finish") void finish(nextAnswers)
    else setStep(optionNext)
  }

  return (
    <OnboardingShell>
      <div className="flex w-full flex-col">
        <div className="flex flex-col items-center text-center">
          <PiMark size="lg" className="mb-5" />
          <h1 className="text-2xl font-semibold tracking-tight text-[#F0F2F8] sm:text-3xl">
            {meta.title}
          </h1>
        </div>

        {isKnowYouStep ? (
          <OnboardingKnowYouStep
            value={workContext}
            onChange={setWorkContext}
            onContinue={saveWorkContext}
            onSkip={skip}
            onBack={() => setStep(2)}
            disabled={submitting}
            submitting={submitting}
          />
        ) : isLegalStep ? (
          <OnboardingLegalConsentStep
            accepted={legalAccepted}
            onToggle={toggleLegalConsent}
            onContinue={completeLegalStep}
            onBack={() => setStep(3)}
            disabled={submitting}
            submitting={submitting}
            showErrors={legalShowErrors}
          />
        ) : (
          <>
            <OnboardingOptionList
              options={options}
              onSelect={onSelect}
              selectedId={answers[optionField] as string | undefined}
              disabled={submitting}
            />
            {isOtherActive ? (
              <div className="mt-4 space-y-2 text-left">
                <label
                  htmlFor="onboarding-other-input"
                  className="block text-xs font-medium uppercase tracking-wide text-white/45"
                >
                  Tell us more
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    id="onboarding-other-input"
                    type="text"
                    autoFocus
                    value={otherDraft}
                    maxLength={200}
                    onChange={(event) => setOtherDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault()
                        confirmOther()
                      }
                    }}
                    placeholder={
                      optionField === "role"
                        ? "e.g. Researcher, Educator, Investor…"
                        : "e.g. Podcast, Newsletter, Conference…"
                    }
                    disabled={submitting}
                    className={cn(
                      "w-full rounded-xl border border-white/12 bg-black/25 px-3.5 py-2.5 text-sm text-white",
                      "placeholder:text-white/35 outline-none transition-colors",
                      "focus:border-[#2DCFCF]/50 focus:ring-2 focus:ring-[#2DCFCF]/20"
                    )}
                  />
                  <button
                    type="button"
                    className="auth-submit inline-flex shrink-0 items-center justify-center rounded-md px-5 py-2.5 text-sm"
                    onClick={confirmOther}
                    disabled={submitting || !otherDraft.trim()}
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}

        {!isKnowYouStep && !isLegalStep ? (
          <div
            className={cn(
              "mt-8 flex items-center",
              step === 0 ? "justify-end" : "justify-between"
            )}
          >
            {step > 0 ? (
              <button
                type="button"
                className="auth-outline-btn inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm"
                onClick={() => setStep((step - 1) as WizardStep)}
                disabled={submitting}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="auth-nav-btn auth-nav-btn--outline rounded-md px-4 py-2 text-sm"
              onClick={skip}
              disabled={submitting}
            >
              Skip
            </button>
          </div>
        ) : null}

        <OnboardingStepProgress stepIndex={step} className="mt-12" />
      </div>
    </OnboardingShell>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <OnboardingShell bare>
          <Loader2 className="h-8 w-8 animate-spin text-[#B0F900]" aria-label="Loading" />
        </OnboardingShell>
      }
    >
      <OnboardingPageContent />
    </Suspense>
  )
}
