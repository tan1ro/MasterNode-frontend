"use client"

import { useEffect, useMemo, useState } from "react"
import { BrandPiMark } from "@/components/layout/brand-logo"
import {
  markWelcomeBackAfterLoginShown,
  shouldShowTimeOfDayGreeting,
  shouldShowWelcomeBackAfterLogin,
} from "@/lib/chat-first-greeting"
import { pickRandomGuestTagline, pickRandomSignedInTagline } from "@/lib/chat-guest-taglines"
import {
  buildTimeGreetingParts,
  resolveGreetingUsername,
} from "@/lib/time-greeting"
import { cn } from "@/lib/utils"

interface ChatGreetingHeadingProps {
  username?: string | null
  email?: string | null
  /** True on draft new chat (`/chat` with no id). */
  isNewDraft?: boolean
  /** Stronger accent colors when pipeline mode is active (better light-mode contrast). */
  pipelineMode?: boolean
  className?: string
}

type GreetingMode = "welcome" | "time" | "guest"

const GREETING_GRADIENT_CLASS = "text-gradient-brand-animated"
const GREETING_PIPELINE_NAME_CLASS = "text-gradient-pipeline-name"

function pickSignedInHeadlineMode(): GreetingMode {
  const roll = Math.random()
  if (roll < 0.4) return "time"
  if (roll < 0.75) return "guest"
  return "welcome"
}

export function ChatGreetingHeading({
  username,
  email,
  isNewDraft = true,
  pipelineMode = false,
  className,
}: ChatGreetingHeadingProps) {
  const name = useMemo(
    () => resolveGreetingUsername(username, email) ?? null,
    [username, email]
  )
  const isGuest = !name
  const [tagline, setTagline] = useState("")
  const [mode, setMode] = useState<GreetingMode>("guest")

  useEffect(() => {
    if (!isNewDraft) return

    if (isGuest) {
      setMode(shouldShowTimeOfDayGreeting() ? "time" : "guest")
      setTagline(pickRandomGuestTagline())
      return
    }

    if (shouldShowWelcomeBackAfterLogin()) {
      setMode("welcome")
      markWelcomeBackAfterLoginShown()
      setTagline(pickRandomSignedInTagline())
      return
    }

    setMode(pickSignedInHeadlineMode())
    setTagline(pickRandomSignedInTagline())
  }, [isGuest, isNewDraft])

  const timeParts = useMemo(
    () => (mode === "time" ? buildTimeGreetingParts(name) : null),
    [mode, name]
  )

  const accentNameClass = pipelineMode ? GREETING_PIPELINE_NAME_CLASS : GREETING_GRADIENT_CLASS
  const prefixTextClass = "text-foreground"
  const accentNameTextClass = cn(accentNameClass, "font-semibold")

  const headline =
    mode === "welcome" && name ? (
      <>
        <span className={prefixTextClass}>Welcome back, </span>
        <span className={accentNameTextClass}>{name}</span>
        <span className={prefixTextClass}>!!</span>
      </>
    ) : mode === "welcome" && !name ? (
      <span className={cn(accentNameClass, "font-semibold")}>Welcome back!!</span>
    ) : mode === "time" && timeParts?.name ? (
      <>
        <span className={prefixTextClass}>{timeParts.prefix}, </span>
        <span className={accentNameTextClass}>{timeParts.name}</span>
        <span className={prefixTextClass}>!!</span>
      </>
    ) : mode === "time" && timeParts ? (
      <span className={cn(accentNameClass, "font-semibold")}>{timeParts.prefix}!!</span>
    ) : name ? (
      <>
        <span className={prefixTextClass}>{name} </span>
        <span className={cn(accentNameClass, "font-semibold")}>returns!</span>
      </>
    ) : (
      <span className={cn(accentNameClass, "font-semibold")}>Welcome back!!</span>
    )

  const showTagline = Boolean(tagline)

  return (
    <div className={cn("flex w-full flex-col items-center gap-3 text-center", className)}>
      <div className="flex max-w-2xl flex-col items-center justify-center gap-3 px-1 sm:flex-row sm:gap-4">
        <BrandPiMark
          size="md"
          className="shrink-0"
          markClassName="h-10 w-10 sm:h-11 sm:w-11"
        />
        <h1 className="min-w-0 text-center font-heading text-[1.7rem] font-medium leading-tight tracking-tight text-foreground sm:text-4xl md:text-[2.35rem]">
          {headline}
        </h1>
      </div>
      {showTagline ? (
        <p className="max-w-md px-1 text-sm leading-relaxed text-muted-foreground">{tagline}</p>
      ) : null}
    </div>
  )
}
