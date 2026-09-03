"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { OnboardingShell } from "@/components/onboarding/onboarding-shell"
import { BRANDING } from "@/constants/branding"
import { PI_MARK_ANIMATED } from "@/constants/branding-assets"
import { cn } from "@/lib/utils"

const PROVISIONING_MESSAGES = [
  "Setting up your workspace…",
  "Creating your environment…",
  "Spinning up your environment…",
  "Almost ready…",
] as const

interface EnvironmentProvisioningScreenProps {
  onComplete: () => void
  /** Minimum time to show the screen (ms). */
  minDurationMs?: number
  className?: string
}

export function EnvironmentProvisioningScreen({
  onComplete,
  minDurationMs = 4200,
  className,
}: EnvironmentProvisioningScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((index) => (index + 1) % PROVISIONING_MESSAGES.length)
    }, 1100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(onComplete, minDurationMs)
    return () => clearTimeout(timer)
  }, [minDurationMs, onComplete])

  const message = PROVISIONING_MESSAGES[messageIndex]

  return (
    <OnboardingShell bare className={className}>
      <div className="flex w-full flex-col items-center text-center">
        <div className="relative h-16 w-16 overflow-hidden">
          <Image
            src={PI_MARK_ANIMATED.src}
            alt=""
            fill
            sizes="64px"
            unoptimized
            aria-hidden
            className="object-cover object-center scale-[1.85] origin-center"
          />
        </div>

        <p className="mt-8 text-sm font-medium text-[#B0F900]">All set</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#F0F2F8] sm:text-3xl">
          Preparing {BRANDING.productName}
        </h1>
        <p
          key={message}
          className={cn(
            "mt-4 min-h-[1.5rem] text-sm text-[#8B92A9] sm:text-base",
            "animate-in fade-in slide-in-from-bottom-1 duration-500"
          )}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>

        <div className="mt-10 flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className={cn(
                "h-1.5 w-1.5 rounded-full bg-muted-foreground/30",
                dot === messageIndex % 3 && "w-5 bg-amber transition-all duration-300"
              )}
            />
          ))}
        </div>
      </div>
    </OnboardingShell>
  )
}
