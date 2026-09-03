"use client"

import { useState } from "react"
import { Loader2, Sparkles, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import {
  generateAssistantAiDraft,
  type AssistantAiDraft,
} from "@/lib/assistant-ai-draft"
import type { UpsertAgentTemplateBody } from "@/types/api"
import { cn } from "@/lib/utils"

interface AssistantDomainBuilderProps {
  disabled?: boolean
  onDraftReady: (body: UpsertAgentTemplateBody, draft: AssistantAiDraft) => void
  className?: string
}

export function AssistantDomainBuilder({
  disabled,
  onDraftReady,
  className,
}: AssistantDomainBuilderProps) {
  const [description, setDescription] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<unknown>(null)

  const handleGenerate = async () => {
    const text = description.trim()
    if (!text || disabled) return
    setErr(null)
    setBusy(true)
    try {
      const result = await generateAssistantAiDraft({ description: text })
      onDraftReady(result.body, result.draft)
    } catch (e) {
      setErr(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-amber/25 bg-gradient-to-br from-amber/[0.06] via-background to-background p-5 sm:p-6",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber/30 bg-amber/10 text-amber">
          <Wand2 className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Build a domain assistant with AI</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Describe your specialty — e.g. &quot;VC memo writer who exports PDF briefs&quot; or
              &quot;biology tutor with research citations&quot;. We draft the prompt, outputs, and
              knowledge settings for you to review.
            </p>
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="I need an assistant that helps with…"
            disabled={disabled || busy}
            className="min-h-[5.5rem] resize-y border-border/60 bg-background/80 text-sm"
            aria-label="Describe your domain assistant"
          />
          {err ? (
            <ApiErrorCallout
              error={err}
              title="Could not generate draft"
              fallbackMessage="Could not generate draft"
            />
          ) : null}
          <Button
            type="button"
            size="sm"
            className="gap-1.5 bg-amber text-amber-foreground hover:bg-amber/90"
            disabled={disabled || busy || !description.trim()}
            onClick={() => void handleGenerate()}
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Drafting…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden />
                Generate assistant draft
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  )
}
