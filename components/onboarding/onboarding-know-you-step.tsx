"use client"

import { ArrowLeft, Loader2, Sparkles } from "lucide-react"
import { ONBOARDING_WORK_CONTEXT_MAX } from "@/constants/onboarding"
import { cn } from "@/lib/utils"

interface Props {
  value: string
  onChange: (value: string) => void
  onContinue: () => void
  onSkip: () => void
  onBack: () => void
  disabled?: boolean
  submitting?: boolean
}

export function OnboardingKnowYouStep({
  value,
  onChange,
  onContinue,
  onSkip,
  onBack,
  disabled,
  submitting,
}: Props) {
  const canContinue = value.trim().length > 0 && !disabled && !submitting

  return (
    <div className="mt-8 space-y-5">
      <div className="onboarding-know-you-card rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber/15 text-amber">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 text-left">
            <p className="text-sm font-medium text-white">We use this to tailor your outputs</p>
            <p className="mt-1 text-sm leading-relaxed text-white/55">
              Tell us about your role, projects, or tools — it appears automatically on the Memory
              page.
            </p>
          </div>
        </div>

        <label
          htmlFor="onboarding-work-context"
          className="mb-2 block text-left text-xs font-medium uppercase tracking-wide text-white/45"
        >
          About you
        </label>
        <textarea
          id="onboarding-work-context"
          value={value}
          onChange={(event) => onChange(event.target.value.slice(0, ONBOARDING_WORK_CONTEXT_MAX))}
          placeholder="e.g. I'm a product manager at a B2B SaaS startup. I write specs, user stories, and launch copy."
          rows={5}
          disabled={disabled || submitting}
          className={cn(
            "w-full resize-y rounded-xl border border-white/12 bg-black/25 px-3.5 py-3 text-sm text-white",
            "placeholder:text-white/35 outline-none transition-colors",
            "focus:border-amber/50 focus:ring-2 focus:ring-amber/20"
          )}
        />
        <p className="mt-2 text-right text-xs text-white/40">
          {value.length}/{ONBOARDING_WORK_CONTEXT_MAX}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="auth-outline-btn inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm"
          onClick={onBack}
          disabled={disabled || submitting}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="auth-nav-btn auth-nav-btn--outline rounded-md px-4 py-2.5 text-sm"
            onClick={onSkip}
            disabled={disabled || submitting}
          >
            Skip for now
          </button>
          <button
            type="button"
            className={cn("auth-submit inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm")}
            onClick={onContinue}
            disabled={!canContinue}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              "Save & continue"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
