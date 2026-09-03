"use client"

import { useEffect, useRef, useState } from "react"
import { Flag, ThumbsDown, ThumbsUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ChatMessage } from "@/types/api"
import {
  responseFeedbackService,
  type NegativeFeedbackReason,
} from "@/services/response-feedback"
import { trackProductEvent } from "@/lib/analytics/track-event"
import { createEventId } from "@/lib/analytics/client-context"
import { cn } from "@/lib/utils"
import { MessageActionTooltip } from "@/components/chat/message-action-tooltip"

const NEGATIVE_REASONS: { id: NegativeFeedbackReason; label: string }[] = [
  { id: "incorrect_information", label: "Incorrect or incomplete" },
  { id: "didnt_follow_instructions", label: "Not what I asked for" },
  { id: "slow_response", label: "Slow or buggy" },
  { id: "style_or_tone", label: "Style or tone" },
  { id: "safety_or_legal", label: "Safety or legal concern" },
  { id: "other", label: "Other" },
]

function readMessageMetrics(msg: ChatMessage) {
  const meta = msg.metadata || {}
  return {
    model: typeof meta.model === "string" ? meta.model : undefined,
    prompt_tokens: typeof meta.prompt_tokens === "number" ? meta.prompt_tokens : undefined,
    completion_tokens:
      typeof meta.completion_tokens === "number" ? meta.completion_tokens : undefined,
    latency: typeof meta.latency_ms === "number" ? meta.latency_ms : undefined,
  }
}

function FeedbackIconButton({
  actionLabel,
  icon: Icon,
  active,
  onClick,
  disabled,
}: {
  actionLabel: string
  icon: typeof ThumbsUp
  active?: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <MessageActionTooltip actionLabel={actionLabel}>
      <button
        type="button"
        aria-label={actionLabel}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors",
          "hover:bg-muted hover:text-foreground disabled:opacity-50",
          active && "bg-muted text-foreground"
        )}
      >
        <Icon
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-[fill,stroke]",
            active ? "fill-current stroke-current" : "fill-none"
          )}
          strokeWidth={active ? 1.75 : 2}
          aria-hidden
        />
      </button>
    </MessageActionTooltip>
  )
}

function ReasonChip({
  label,
  selected,
  onToggle,
}: {
  label: string
  selected: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition-colors",
        selected
          ? "border-foreground/40 bg-foreground text-background"
          : "border-border/70 bg-transparent text-foreground/85 hover:border-foreground/35 hover:bg-muted/50"
      )}
    >
      {label}
    </button>
  )
}

export function ResponseFeedbackActions({
  conversationId,
  message,
  disabled,
  onNotice,
}: {
  conversationId?: string | null
  message: ChatMessage
  disabled?: boolean
  onNotice?: (message: string, variant?: "success" | "error" | "info") => void
}) {
  const [feedback, setFeedback] = useState<"up" | "down" | "report" | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState<NegativeFeedbackReason[]>([])
  const [comment, setComment] = useState("")
  const [pending, setPending] = useState(false)
  const idempotencyRef = useRef<string>(createEventId("fb"))

  const metrics = readMessageMetrics(message)
  const canSubmit = Boolean(conversationId)
  const canSubmitNegative =
    selectedReasons.length > 0 || comment.trim().length > 0

  const submitFeedback = async (
    feedbackType: "positive" | "negative" | "report",
    reasons: NegativeFeedbackReason[] = [],
    extraComment?: string
  ) => {
    if (!conversationId) {
      onNotice?.("Feedback is unavailable in this session.", "error")
      return
    }
    setPending(true)
    try {
      await responseFeedbackService.submit({
        conversation_id: conversationId,
        message_id: message.message_id,
        feedback_type: feedbackType,
        reasons,
        comment: extraComment,
        ...metrics,
        idempotency_key: idempotencyRef.current,
      })
      if (feedbackType === "positive") {
        setFeedback("up")
        onNotice?.("Thanks for your feedback.", "success")
        void trackProductEvent("thumbs_up", { message_id: message.message_id }, { conversationId })
      } else if (feedbackType === "negative") {
        setFeedback("down")
        onNotice?.("Thanks for your feedback.", "success")
        void trackProductEvent("thumbs_down", { message_id: message.message_id }, { conversationId })
      } else {
        setFeedback("report")
        onNotice?.("Report submitted. Our team will review it.", "success")
        void trackProductEvent("report_response", { message_id: message.message_id }, { conversationId })
      }
      void trackProductEvent(
        "feedback_submitted",
        { feedback_type: feedbackType, message_id: message.message_id },
        { conversationId }
      )
      idempotencyRef.current = createEventId("fb")
    } catch {
      onNotice?.("Could not save feedback. Please try again.", "error")
    } finally {
      setPending(false)
      setDialogOpen(false)
      setReportOpen(false)
    }
  }

  const handleThumbsUp = () => {
    if (feedback === "up") return
    idempotencyRef.current = createEventId("fb")
    void submitFeedback("positive")
  }

  const handleThumbsDown = () => {
    idempotencyRef.current = createEventId("fb")
    setSelectedReasons([])
    setComment("")
    setDialogOpen(true)
  }

  const handleReport = () => {
    idempotencyRef.current = createEventId("fb")
    setComment("")
    setReportOpen(true)
  }

  const toggleReason = (id: NegativeFeedbackReason) => {
    setSelectedReasons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    if (!dialogOpen && !reportOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setDialogOpen(false)
        setReportOpen(false)
      }
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [dialogOpen, reportOpen])

  return (
    <>
      <FeedbackIconButton
        actionLabel="Helpful"
        icon={ThumbsUp}
        active={feedback === "up"}
        disabled={disabled || pending || !canSubmit}
        onClick={handleThumbsUp}
      />
      <FeedbackIconButton
        actionLabel="Not helpful"
        icon={ThumbsDown}
        active={feedback === "down" || dialogOpen}
        disabled={disabled || pending || !canSubmit}
        onClick={handleThumbsDown}
      />
      <FeedbackIconButton
        actionLabel="Report"
        icon={Flag}
        active={feedback === "report"}
        disabled={disabled || pending || !canSubmit}
        onClick={handleReport}
      />

      {dialogOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6" role="presentation">
          <button
            type="button"
            aria-label="Close feedback dialog"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setDialogOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="negative-feedback-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="negative-feedback-title" className="text-base font-semibold text-foreground">
                Share feedback
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setDialogOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {NEGATIVE_REASONS.map((reason) => (
                <ReasonChip
                  key={reason.id}
                  label={reason.label}
                  selected={selectedReasons.includes(reason.id)}
                  onToggle={() => toggleReason(reason.id)}
                />
              ))}
            </div>

            <Textarea
              id="feedback-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details (optional)"
              className="mt-4 min-h-[110px] resize-none"
              maxLength={2000}
              aria-label="Share details"
            />

            <p className="mt-3 rounded-lg border border-border/50 bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              This conversation may be reviewed with your feedback so we can improve MasterNode.
            </p>

            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                disabled={pending || !canSubmitNegative}
                onClick={() =>
                  void submitFeedback("negative", selectedReasons, comment.trim() || undefined)
                }
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {reportOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6" role="presentation">
          <button
            type="button"
            aria-label="Close report dialog"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setReportOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-response-title"
            className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="report-response-title" className="text-base font-semibold text-foreground">
                Report response
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setReportOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Flag this response for review. Do not include sensitive personal data.
            </p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Why are you reporting this response?"
              className="mt-4 min-h-[96px]"
              maxLength={2000}
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setReportOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={pending || comment.trim().length < 2}
                onClick={() => void submitFeedback("report", ["other"], comment.trim())}
              >
                Submit report
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
