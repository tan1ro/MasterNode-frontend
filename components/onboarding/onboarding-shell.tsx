"use client"

import type { ReactNode } from "react"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { cn } from "@/lib/utils"
import "@/components/onboarding/onboarding.css"

interface OnboardingShellProps {
  children: ReactNode
  className?: string
  /** Wider card for plan comparison and multi-column steps. */
  wide?: boolean
  /** Loading / provisioning — no card wrapper. */
  bare?: boolean
}

export function OnboardingShell({ children, className, wide, bare }: OnboardingShellProps) {
  return (
    <AuthPageShell showBackToHome={false} className={className}>
      {bare ? (
        <div
          className={cn(
            "mx-auto flex w-full flex-col items-center justify-center",
            wide ? "max-w-4xl" : "max-w-xl"
          )}
        >
          {children}
        </div>
      ) : (
        <div
          className={cn(
            "mx-auto w-full px-2 py-6 sm:px-4",
            wide ? "max-w-4xl" : "max-w-2xl"
          )}
        >
          {children}
        </div>
      )}
    </AuthPageShell>
  )
}
