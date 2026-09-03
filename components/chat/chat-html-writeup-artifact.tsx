"use client"

import { useCallback, useId, useMemo, useState } from "react"
import { ExternalLink, FileCode2, Maximize2, Minimize2 } from "lucide-react"
import {
  ChatHtmlVisualizationCard,
  useChatPresentationPanelOptional,
} from "@/components/chat/chat-presentation-panel"
import { useChatSourcesPanelOptional } from "@/components/chat/chat-sources-panel"
import { ChatProjectDownloadMenu } from "@/components/chat/chat-project-download-menu"
import {
  openHtmlWriteupInNewTab,
  wrapHtmlWriteupDocument,
} from "@/lib/html-writeup"
import type { ProjectExportFile } from "@/lib/project-zip-export"
import { cn } from "@/lib/utils"

export interface ChatHtmlWriteupArtifactProps {
  html: string
  title?: string
  filename?: string
  files?: ProjectExportFile[]
  className?: string
  /** When set, highlights the card if this message's panel is open. */
  messageId?: string
  /** Prefer side-panel visualization when the chat panel provider is present. */
  preferSidePanel?: boolean
  /** Auto-open the side panel once when the artifact appears. */
  autoOpen?: boolean
}

function slugifyFilename(title: string): string {
  const slug = title.replace(/[^a-z0-9]+/gi, "_").toLowerCase().replace(/^_|_$/g, "")
  return slug || "writeup"
}

export function ChatHtmlWriteupArtifact({
  html,
  title,
  filename,
  files,
  className,
  messageId,
  preferSidePanel = true,
  autoOpen = true,
}: ChatHtmlWriteupArtifactProps) {
  const panel = useChatPresentationPanelOptional()
  const sourcesPanel = useChatSourcesPanelOptional()
  const canUseSidePanel = preferSidePanel && Boolean(panel?.openHtmlVisualization)

  const openSidePanel = useCallback(() => {
    sourcesPanel?.closeSources()
    panel?.openHtmlVisualization({
      html,
      title,
      filename,
      files,
      messageId: messageId ?? null,
    })
  }, [panel, sourcesPanel, html, title, filename, files, messageId])

  if (canUseSidePanel && panel) {
    return (
      <ChatHtmlVisualizationCard
        html={html}
        title={title}
        filename={filename}
        files={files}
        previewOpen={
          messageId
            ? panel.isOpenForMessage(messageId) && panel.kind === "html"
            : panel.open && panel.kind === "html"
        }
        onOpenPreview={openSidePanel}
        autoOpen={autoOpen}
        className={className}
      />
    )
  }

  return (
    <ChatHtmlWriteupInline
      html={html}
      title={title}
      filename={filename}
      files={files}
      className={className}
    />
  )
}

/** Inline iframe fallback (tasks / surfaces without the chat side panel). */
function ChatHtmlWriteupInline({
  html,
  title,
  filename,
  files,
  className,
}: {
  html: string
  title?: string
  filename?: string
  files?: ProjectExportFile[]
  className?: string
}) {
  const panelId = useId()
  const [expanded, setExpanded] = useState(false)
  const cardTitle = title?.trim() || "Project Write-up"
  const downloadName = filename?.trim() || `${slugifyFilename(cardTitle)}.html`
  const srcDoc = useMemo(() => wrapHtmlWriteupDocument(html), [html])

  const handleOpenTab = useCallback(() => {
    openHtmlWriteupInNewTab(html)
  }, [html])

  return (
    <div className={cn("mt-3 min-w-0", className)}>
      <div
        id={panelId}
        className={cn(
          "overflow-hidden rounded-2xl border border-border/60 bg-card text-card-foreground shadow-sm",
          expanded ? "shadow-md" : ""
        )}
      >
        <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet/15 text-violet">
            <FileCode2 className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{cardTitle}</p>
            <p className="text-[11px] text-muted-foreground">HTML write-up · live preview</p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <ChatProjectDownloadMenu
              title={cardTitle}
              html={html}
              htmlFilename={downloadName}
              files={files}
              compact
            />
            <button
              type="button"
              aria-label="Open in new tab"
              onClick={handleOpenTab}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label={expanded ? "Collapse preview" : "Expand preview"}
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              {expanded ? (
                <Minimize2 className="h-4 w-4" aria-hidden />
              ) : (
                <Maximize2 className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "relative bg-muted/25 dark:bg-[#111] transition-[height] duration-200",
            expanded ? "h-[min(78vh,880px)]" : "h-[min(28rem,52vh)]"
          )}
        >
          <iframe
            title={cardTitle}
            srcDoc={srcDoc}
            sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            className="h-full w-full border-0 bg-transparent"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}
