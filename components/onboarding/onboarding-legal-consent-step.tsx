"use client"

import Link from "next/link"
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react"
import {
  ONBOARDING_LEGAL_CONSENTS,
  ONBOARDING_REQUIRED_LEGAL_CONSENT_IDS,
  type OnboardingLegalConsentAccent,
} from "@/constants/onboarding-legal-consents"
import { cn } from "@/lib/utils"

interface Props {
  accepted: Record<string, boolean>
  onToggle: (id: string, checked: boolean) => void
  onContinue: () => void
  onBack: () => void
  disabled?: boolean
  submitting?: boolean
  showErrors?: boolean
}

const ACCENT_CLASS: Record<OnboardingLegalConsentAccent, string> = {
  cyan: "onboarding-legal-card--cyan",
  amber: "onboarding-legal-card--amber",
  orange: "onboarding-legal-card--orange",
  violet: "onboarding-legal-card--violet",
}

function allRequiredAccepted(accepted: Record<string, boolean>): boolean {
  return ONBOARDING_REQUIRED_LEGAL_CONSENT_IDS.every((id) => accepted[id])
}

export function OnboardingLegalConsentStep({
  accepted,
  onToggle,
  onContinue,
  onBack,
  disabled,
  submitting,
  showErrors,
}: Props) {
  const canContinue = allRequiredAccepted(accepted) && !disabled && !submitting
  const allSelected = ONBOARDING_LEGAL_CONSENTS.every((consent) => accepted[consent.id])
  const busy = disabled || submitting

  const selectAll = () => {
    const next = !allSelected
    for (const consent of ONBOARDING_LEGAL_CONSENTS) {
      onToggle(consent.id, next)
    }
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="onboarding-legal-hero rounded-2xl border border-white/10 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber">
            <ShieldCheck className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 text-left">
            <p className="text-sm font-medium text-white">Before you start building</p>
            <p className="mt-1 text-sm leading-relaxed text-white/55">
              Review and accept each item below. You cannot continue until all required agreements
              are checked.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="auth-outline-btn rounded-md px-4 py-2 text-sm"
          onClick={selectAll}
          disabled={busy}
          aria-pressed={allSelected}
        >
          {allSelected ? "Clear all" : "Accept all"}
        </button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {ONBOARDING_LEGAL_CONSENTS.map((consent) => {
          const checked = Boolean(accepted[consent.id])
          const hasError = showErrors && consent.required && !checked
          const inputId = `onboarding-legal-${consent.id}`

          return (
            <li key={consent.id} className="h-full">
              <label
                htmlFor={inputId}
                className={cn(
                  "onboarding-legal-card flex h-full cursor-pointer rounded-2xl border p-4 transition-all sm:p-5",
                  ACCENT_CLASS[consent.accent],
                  checked && "onboarding-legal-card--checked",
                  hasError && "onboarding-legal-card--error"
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    id={inputId}
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => onToggle(consent.id, event.target.checked)}
                    disabled={disabled || submitting}
                    className="onboarding-legal-checkbox mt-1"
                    aria-invalid={hasError}
                  />
                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-medium text-white">{consent.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-white/65">
                      {consent.lead}{" "}
                      <Link
                        href={consent.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-white underline decoration-white/30 underline-offset-2 hover:decoration-white"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {consent.linkLabel}
                      </Link>
                      .
                    </span>
                    {hasError ? (
                      <span className="mt-2 block text-xs text-rose-300">
                        Required — please accept to continue.
                      </span>
                    ) : null}
                  </span>
                </div>
              </label>
            </li>
          )
        })}
      </ul>

      <div className="sticky bottom-0 z-10 -mx-1 mt-2 flex flex-col gap-3 border-t border-white/10 bg-black/90 px-1 py-3 backdrop-blur-md sm:static sm:mx-0 sm:mt-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:pt-2 sm:backdrop-blur-none sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="auth-outline-btn inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm"
          onClick={onBack}
          disabled={disabled || submitting}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <button
          type="button"
          className={cn(
            "auth-submit inline-flex min-w-[10rem] items-center justify-center rounded-md px-6 py-2.5 text-sm"
          )}
          onClick={onContinue}
          disabled={!canContinue}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : (
            "Continue to MasterNode"
          )}
        </button>
      </div>
    </div>
  )
}
