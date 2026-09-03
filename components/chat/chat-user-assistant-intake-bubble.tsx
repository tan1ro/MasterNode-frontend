"use client"

import { Check } from "lucide-react"
import { displayTemplateName } from "@/components/agent-templates/template-role-utils"
import {
  resolveAssistantKeywordChips,
  type AssistantIntakeClarifyTrailItem,
  type AssistantIntakeDisplayEntry,
} from "@/lib/assistant-message-display"
import { buildAssistantIntakeFields } from "@/lib/assistant-intake"
import { CHAT_MESSAGE_TEXT_CLASS } from "@/constants/chat-layout"
import { cn } from "@/lib/utils"
import type { AgentTemplateApi } from "@/types/api"

interface ChatUserAssistantIntakeBubbleProps {
  entries: AssistantIntakeDisplayEntry[]
  userPrompt?: string | null
  clarifyTrail?: AssistantIntakeClarifyTrailItem[]
  templates?: AgentTemplateApi[]
  className?: string
}

/** User turn for assistant intake — request at top, then Q&A card. */
export function ChatUserAssistantIntakeBubble({
  entries,
  userPrompt,
  clarifyTrail = [],
  templates,
  className,
}: ChatUserAssistantIntakeBubbleProps) {
  const prompt = (userPrompt || "").trim()
  const trail = clarifyTrail.filter((item) => item.prompt && item.answer)
  if (!entries.length && !prompt) return null

  return (
    <div className={cn("flex w-full max-w-full flex-col items-end gap-2", className)}>
      {entries.map((entry, entryIndex) => {
        const template = (templates || []).find(
          (item) => String(item.template_id || "").trim() === entry.templateId
        )
        const fields = template ? buildAssistantIntakeFields(template) : undefined
        const chips = resolveAssistantKeywordChips(entry, fields)
        const showTrailHere = entryIndex === 0 && trail.length > 0
        const showPromptHere = entryIndex === 0 && Boolean(prompt)
        // When we have the clarify Q&A, don't also list the same values as field chips.
        const showFieldChips = chips.length > 0 && !showTrailHere

        return (
          <div
            key={entry.templateId}
            className="max-w-full rounded-2xl rounded-br-md border border-violet/25 bg-violet/8 px-3.5 py-2.5 text-left shadow-sm"
          >
            <p className="truncate text-xs font-medium text-foreground">
              {displayTemplateName(entry.templateName)}
            </p>

            {showPromptHere ? (
              <p className="mt-2 whitespace-pre-wrap break-words rounded-lg border border-border/40 bg-background/50 px-2.5 py-2 text-[12px] leading-snug text-foreground/90">
                {prompt}
              </p>
            ) : null}

            {showTrailHere ? (
              <ul className="mt-2.5 space-y-1.5">
                {trail.map((item, index) => (
                  <li
                    key={`${item.prompt}-${index}`}
                    className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-background/60 px-2.5 py-2"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-violet text-violet-foreground">
                      <Check className="size-3" strokeWidth={2.5} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-semibold leading-snug text-foreground">
                        {item.prompt}
                      </span>
                      <span className="mt-0.5 block break-words text-[11px] text-muted-foreground">
                        {item.answer}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            {showFieldChips ? (
              <ul className="mt-2 space-y-1.5">
                {chips.map((chip) => (
                  <li
                    key={`${entry.templateId}-${chip.key}`}
                    className="rounded-lg border border-border/50 bg-background/70 px-2.5 py-1.5"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {chip.label}
                    </p>
                    <p className="mt-0.5 break-words whitespace-pre-wrap text-[12px] leading-snug text-foreground">
                      {chip.value}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )
      })}

      {/* Plain request only when there is no assistant card */}
      {!entries.length && prompt ? (
        <div
          className={cn(
            "max-w-full rounded-2xl rounded-br-md border border-border/50 bg-muted/40 px-3.5 py-2.5 text-left shadow-sm",
            CHAT_MESSAGE_TEXT_CLASS
          )}
        >
          <p className="whitespace-pre-wrap break-words leading-[1.55] text-foreground">
            {prompt}
          </p>
        </div>
      ) : null}

      {!entries.length && trail.length > 0 ? (
        <div className="max-w-full rounded-2xl rounded-br-md border border-violet/25 bg-violet/8 px-3.5 py-2.5 text-left shadow-sm">
          <ul className="space-y-1.5">
            {trail.map((item, index) => (
              <li
                key={`${item.prompt}-${index}`}
                className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-background/60 px-2.5 py-2"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-violet text-violet-foreground">
                  <Check className="size-3" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold leading-snug text-foreground">
                    {item.prompt}
                  </span>
                  <span className="mt-0.5 block break-words text-[11px] text-muted-foreground">
                    {item.answer}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
