"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { parseChatConversationIdFromPathname } from "@/lib/chat-path"
import { supportService } from "@/services/support"
import { useAppAuth } from "@/hooks/use-app-auth"
import { cn } from "@/lib/utils"

const MAX_CHARS = 2000

interface BugReportModalProps {
  open: boolean
  onClose: () => void
}

export function BugReportModal({ open, onClose }: BugReportModalProps) {
  const pathname = usePathname()
  const { isSignedIn } = useAppAuth()
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const trimmed = message.trim()
  const charCount = message.length
  const canSend = trimmed.length >= 2 && charCount <= MAX_CHARS && !pending

  useEffect(() => {
    if (!open) {
      setMessage("")
      setPending(false)
      setError(null)
      setSubmitted(false)
      return
    }
    const t = window.setTimeout(() => textareaRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  const handleSend = async () => {
    if (!canSend) return
    setPending(true)
    setError(null)
    try {
      await supportService.reportBug(
        {
          message: trimmed,
          page_url: typeof window !== "undefined" ? window.location.href : pathname,
          conversation_id: parseChatConversationIdFromPathname(pathname),
        },
        { usePublic: !isSignedIn }
      )
      setSubmitted(true)
      window.setTimeout(() => onClose(), 1200)
    } catch {
      setError("Could not send your report. Please try again.")
    } finally {
      setPending(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close bug report"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bug-report-title"
        className={cn(
          "relative z-10 w-full max-w-xl rounded-2xl border border-border bg-card shadow-xl",
          "max-h-[min(520px,calc(100dvh-1.5rem))] overflow-hidden"
        )}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
          <h2 id="bug-report-title" className="text-lg font-semibold text-foreground">
            What happened?
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-5">
          {submitted ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Thanks — your report was sent.
            </p>
          ) : (
            <>
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
                placeholder="Tell us about the issue you encountered"
                rows={8}
                disabled={pending}
                className="min-h-[12rem] resize-none rounded-xl border-border/80 bg-muted/30 text-base"
                aria-describedby="bug-report-char-count"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <p
                  id="bug-report-char-count"
                  className={cn(
                    "text-xs text-muted-foreground",
                    charCount > MAX_CHARS && "text-destructive"
                  )}
                >
                  {charCount} / {MAX_CHARS} characters used
                </p>
                {error ? <p className="text-xs text-destructive">{error}</p> : null}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={!canSend}
                  className="h-10 min-w-[5.5rem] rounded-full px-6 font-semibold"
                >
                  {pending ? "Sending…" : "Send"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
