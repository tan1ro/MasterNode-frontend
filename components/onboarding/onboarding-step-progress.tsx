import { cn } from "@/lib/utils"
import { ONBOARDING_STEP_COUNT } from "@/constants/onboarding"

export function OnboardingStepProgress({
  stepIndex,
  className,
}: {
  stepIndex: number
  className?: string
}) {
  return (
    <div
      className={cn("flex items-center justify-center gap-2", className)}
      role="progressbar"
      aria-valuenow={stepIndex + 1}
      aria-valuemin={1}
      aria-valuemax={ONBOARDING_STEP_COUNT}
    >
      {Array.from({ length: ONBOARDING_STEP_COUNT }, (_, index) => (
        <span
          key={index}
          className={cn(
            "onboarding-step-dot",
            index === stepIndex ? "onboarding-step-dot--active" : "onboarding-step-dot--idle"
          )}
        />
      ))}
    </div>
  )
}
