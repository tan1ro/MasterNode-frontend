"use client"

import type { ReactNode } from "react"
import { ChatGreetingHeading } from "@/components/chat/chat-greeting-heading"
import {
  ChatIncognitoDisclaimer,
  ChatIncognitoHero,
} from "@/components/chat/chat-incognito-chrome"
import { CHAT_LANDING_MAX } from "@/constants/chat-layout"
import { cn } from "@/lib/utils"

interface ChatEmptyLandingProps {
  username?: string | null
  email?: string | null
  /** Draft `/chat` with no conversation id yet. */
  isNewDraft?: boolean
  incognitoMode?: boolean
  pipelineMode?: boolean
  composer: ReactNode
  className?: string
}

/** Centered empty chat: greeting + composer. */
export function ChatEmptyLanding({
  username,
  email,
  isNewDraft = true,
  incognitoMode = false,
  pipelineMode = false,
  composer,
  className,
}: ChatEmptyLandingProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col px-4 py-4 sm:py-6",
        className
      )}
    >
      <div
        className={cn(
          "my-auto flex w-full min-h-min flex-col items-center",
          incognitoMode ? "pt-2 sm:pt-4" : "pt-12 sm:pt-14",
          CHAT_LANDING_MAX,
          "mx-auto gap-5 sm:gap-7"
        )}
      >
        {incognitoMode ? (
          <ChatIncognitoHero className="shrink-0" />
        ) : (
          <ChatGreetingHeading
            username={username}
            email={email}
            isNewDraft={isNewDraft}
            pipelineMode={pipelineMode}
            className="shrink-0"
          />
        )}
        <div className="w-full">{composer}</div>
        {incognitoMode ? (
          <ChatIncognitoDisclaimer className="max-w-md px-2" />
        ) : null}
      </div>
    </div>
  )
}
