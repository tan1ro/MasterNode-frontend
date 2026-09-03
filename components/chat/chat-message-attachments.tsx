"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import type { ChatAttachment } from "@/types/api"
import type { ComposerAttachmentItem } from "@/lib/chat-composer-attachments"
import {
  attachmentAccentClass,
  attachmentBadgeLabel,
  attachmentTypeLabel,
  attachmentWarningMessage,
  canPreviewComposerAttachment,
  isImageAttachment,
} from "@/lib/chat-composer-attachments"
import { chatService } from "@/services/chat"
import { cn } from "@/lib/utils"
import { AttachmentPreviewModal } from "./chat-composer-attachments"
import { ChatImageAttachmentCard } from "@/components/chat/chat-image-attachment-card"

/**
 * Build a lightweight `File` from attachment metadata (no bytes) so the shared
 * attachment helpers can resolve the correct icon, label and type.
 */
function metadataFile(att: ChatAttachment): File {
  return new File([], att.filename || "attachment", {
    type: att.mime_type || "application/octet-stream",
  })
}

function AttachmentBadge({ file }: { file: File }) {
  const label = attachmentBadgeLabel(file)
  return (
    <span
      className={cn(
        "select-none font-bold leading-none tracking-[0.04em]",
        label.length > 3 ? "text-[8px]" : "text-[10px]"
      )}
    >
      {label}
    </span>
  )
}

function MessageAttachmentCard({
  attachment,
  conversationId,
  onOpen,
}: {
  attachment: ChatAttachment
  conversationId: string
  onOpen: (item: ComposerAttachmentItem) => void
}) {
  const file = metadataFile(attachment)
  const isImage = isImageAttachment(file)
  const canOpen =
    canPreviewComposerAttachment(file) && attachment.preview_available === true
  const storedWarning = attachmentWarningMessage(attachment)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [thumbUrl, setThumbUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isImage || !canOpen) return
    const resolvedConversationId = (conversationId || attachment.conversation_id || "").trim()
    const resolvedAttachmentId = (attachment.attachment_id || "").trim()
    if (!resolvedConversationId || !resolvedAttachmentId) return

    let cancelled = false
    let objectUrl: string | null = null

    void chatService
      .fetchAttachmentBlob(resolvedConversationId, resolvedAttachmentId)
      .then((blob) => {
        if (cancelled) return
        const mime = attachment.mime_type || blob.type || "image/png"
        objectUrl = URL.createObjectURL(new Blob([blob], { type: mime }))
        setThumbUrl(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setThumbUrl(null)
      })

    return () => {
      cancelled = true
      if (objectUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [attachment, canOpen, conversationId, isImage])

  const handleOpen = useCallback(async () => {
    if (!canOpen || loading) return
    const resolvedConversationId = (conversationId || attachment.conversation_id || "").trim()
    const resolvedAttachmentId = (attachment.attachment_id || "").trim()
    if (!resolvedConversationId || !resolvedAttachmentId) {
      setError("This file is not linked to a chat yet.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const blob = await chatService.fetchAttachmentBlob(
        resolvedConversationId,
        resolvedAttachmentId
      )
      const mime = attachment.mime_type || blob.type || "application/octet-stream"
      const realFile = new File([blob], attachment.filename || "attachment", {
        type: mime,
      })
      const previewUrl = URL.createObjectURL(
        new Blob([blob], { type: mime })
      )
      onOpen({
        localId: attachment.attachment_id,
        file: realFile,
        previewUrl,
        status: "ready",
        attachment,
      })
    } catch (err) {
      const message =
        err instanceof Error && err.message.trim()
          ? err.message.trim()
          : "Couldn't open this file."
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [attachment, canOpen, conversationId, loading, onOpen])

  if (isImage) {
    return (
      <ChatImageAttachmentCard
        filename={attachment.filename}
        previewUrl={thumbUrl || undefined}
        busy={loading || (!thumbUrl && canOpen)}
        disabled={!canOpen}
        error={Boolean(error)}
        onOpen={canOpen ? () => void handleOpen() : undefined}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      disabled={!canOpen || loading}
      className={cn(
        "group relative flex h-[3.25rem] w-[12.5rem] shrink-0 items-center gap-2.5 overflow-hidden rounded-xl border border-border/50 bg-background/70 px-2.5 text-left transition-colors",
        canOpen && "hover:border-border hover:bg-muted/50",
        !canOpen && "cursor-default opacity-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      )}
      title={`Open ${attachment.filename}`}
    >
      <span
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md shadow-sm",
          attachmentAccentClass(file)
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin opacity-90" aria-hidden />
        ) : (
          <AttachmentBadge file={file} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium leading-tight">
          {attachment.filename}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
          {error
            ? error
            : storedWarning
              ? storedWarning
              : canOpen
                ? isImage
                  ? "Image · click to view"
                  : `${attachmentTypeLabel(file)} · click to open`
                : attachment.preview_available === false
                  ? "Preview unavailable · text may still be used"
                  : attachmentTypeLabel(file)}
        </span>
      </span>
    </button>
  )
}

export function ChatMessageAttachments({
  attachments,
  conversationId,
  className,
}: {
  attachments?: ChatAttachment[] | null
  conversationId: string
  className?: string
}) {
  const [previewItem, setPreviewItem] = useState<ComposerAttachmentItem | null>(
    null
  )
  const previewItemRef = useRef<ComposerAttachmentItem | null>(null)

  useEffect(() => {
    previewItemRef.current = previewItem
  }, [previewItem])

  useEffect(() => {
    return () => {
      const current = previewItemRef.current
      if (current?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(current.previewUrl)
      }
    }
  }, [])

  const closePreview = useCallback(() => {
    setPreviewItem((current) => {
      if (current?.previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(current.previewUrl)
      }
      return null
    })
  }, [])

  if (!attachments || attachments.length === 0) return null

  return (
    <>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {attachments.map((attachment) => (
          <MessageAttachmentCard
            key={attachment.attachment_id}
            attachment={attachment}
            conversationId={conversationId}
            onOpen={(item) => {
              setPreviewItem((current) => {
                if (current?.previewUrl?.startsWith("blob:")) {
                  URL.revokeObjectURL(current.previewUrl)
                }
                return item
              })
            }}
          />
        ))}
      </div>
      {previewItem ? (
        <AttachmentPreviewModal item={previewItem} onClose={closePreview} />
      ) : null}
    </>
  )
}
