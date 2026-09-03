"use client"

import { ArrowRight, CheckCircle2 } from "lucide-react"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { PiMark } from "@/components/layout/brand-logo"
import { BRANDING } from "@/constants/branding"
import { cn } from "@/lib/utils"

interface OnboardingCompleteScreenProps {
  onContinue: () => void
  className?: string
}

export function OnboardingCompleteScreen({
  onContinue,
  className,
}: OnboardingCompleteScreenProps) {
  return (
    <OnboardingShell className={className}>
      <div className="flex w-full flex-col items-center text-center">
        <PiMark size="lg" className="mb-5" />

        <div className="onboarding-complete w-full rounded-2xl border border-white/10 px-5 py-8 sm:px-8 sm:py-10">
          <span
            className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#B0F900]/12 text-[#B0F900]"
            aria-hidden
          >
            <CheckCircle2 className="h-6 w-6" />
          </span>

          <p className="mt-5 text-sm font-medium text-[#B0F900]">All set</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#F0F2F8] sm:text-3xl">
            Let&apos;s start building together
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#8B92A9] sm:text-base">
            Your environment is ready. Jump into {BRANDING.productName} and start building with your
            workspace fully set up.
          </p>

          <button
            type="button"
            onClick={onContinue}
            className={cn(
              "auth-submit mt-8 inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-sm sm:mx-auto sm:w-auto sm:min-w-[16rem]"
            )}
          >
            Start using {BRANDING.productName}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </OnboardingShell>
  )
}
