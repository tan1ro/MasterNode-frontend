"use client"

import type { OnboardingOption } from "@/constants/onboarding"
import { cn } from "@/lib/utils"

interface OnboardingOptionListProps {
  options: OnboardingOption[]
  onSelect: (id: string) => void
  selectedId?: string
  disabled?: boolean
}

export function OnboardingOptionList({
  options,
  onSelect,
  selectedId,
  disabled,
}: OnboardingOptionListProps) {
  return (
    <ul
      className="mx-auto mt-8 grid w-full max-w-xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
      role="listbox"
    >
      {options.map((option) => {
        const Icon = option.icon
        const selected = selectedId === option.id

        return (
          <li key={option.id} className="min-w-0">
            <button
              type="button"
              role="option"
              aria-selected={selected}
              disabled={disabled}
              onClick={() => onSelect(option.id)}
              className={cn(
                "onboarding-option group flex h-full w-full flex-col items-center justify-center gap-2.5 rounded-2xl px-3 py-5 text-center",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DCFCF]/50",
                selected && "onboarding-option--selected",
                disabled && "pointer-events-none opacity-60"
              )}
            >
              <Icon
                className="onboarding-option-icon h-5 w-5 shrink-0"
                aria-hidden
              />
              <span className="text-xs font-medium leading-snug text-[#F0F2F8] sm:text-sm">
                {option.label}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
