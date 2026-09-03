"use client"

import React, { useEffect, useRef, useState } from "react"
import { Info } from "lucide-react"
import type { ChatAttachment } from "@/types/api"
import { cn } from "@/lib/utils"

export function MessageInlineEdit({
  initialContent,
  attachments = [],
  disabled = false,
  onCancel,
  onSave,
}: {
  initialContent: string
  attachments?: ChatAttachment[]
  disabled?: boolean
  onCancel: () => void
  onSave: (content: string) => void
}) {
  const [draft, setDraft] = useState(initialContent)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setDraft(initialContent)
  }, [initialContent])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.focus()
    const end = el.value.length
    el.setSelectionRange(end, end)
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 360)}px`
  }, [])

  const resize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 360)}px`
  }

  const canSave = draft.trim().length > 0 && !disabled

  return (
    <div className="w-full space-y-3">
      {attachments.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file) => (
            <span
              key={file.attachment_id}
              className="inline-flex max-w-[10rem] items-center gap-1 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground"
              title={file.filename}
            >
              <span className="truncate">{file.filename}</span>
            </span>
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          "rounded-2xl border-2 border-blue-500/70 bg-background/80 px-4 py-3 shadow-sm",
          "ring-1 ring-blue-500/20"
        )}
      >
        <textarea
          ref={textareaRef}
          value={draft}
          disabled={disabled}
          rows={3}
          className={cn(
            "w-full min-h-[5rem] max-h-[360px] resize-none bg-transparent text-lg leading-relaxed",
            "outline-none placeholder:text-muted-foreground"
          )}
          onChange={(e) => {
            setDraft(e.target.value)
            resize()
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault()
              onCancel()
            }
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSave) {
              e.preventDefault()
              onSave(draft.trim())
            }
          }}
        />
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className={cn(
              "rounded-full border border-border/70 px-4 py-1.5 text-sm text-foreground",
              "hover:bg-muted/60 transition-colors disabled:opacity-50"
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draft.trim())}
            disabled={!canSave}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              canSave
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "bg-muted text-muted-foreground"
            )}
          >
            Save
          </button>
        </div>
      </div>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          Editing this message will replace it and remove later replies. Send the updated
          text to get a new assistant answer from that point.
        </span>
      </p>
    </div>
  )
}
