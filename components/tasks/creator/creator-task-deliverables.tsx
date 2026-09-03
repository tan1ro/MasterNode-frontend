"use client"

import { Loader2 } from "lucide-react"
import { ChatDeliverableArtifactList } from "@/components/chat/chat-deliverable-artifact"
import { ChatDocumentArtifact } from "@/components/chat/chat-document-artifact"
import { ChatHtmlWriteupArtifact } from "@/components/chat/chat-html-writeup-artifact"
import { ChatPresentationArtifact } from "@/components/chat/chat-presentation-artifact"
import { TaskResultViewer } from "@/components/tasks/task-result-viewer"
import type { CreatorTaskDeliverables } from "@/lib/creator-task-experience"
import { cn } from "@/lib/utils"

interface CreatorTaskDeliverablesPanelProps {
  taskId: string
  taskDescription: string
  deliverables: CreatorTaskDeliverables
  isRunActive: boolean
  className?: string
}

export function CreatorTaskDeliverablesPanel({
  taskId,
  taskDescription,
  deliverables,
  isRunActive,
  className,
}: CreatorTaskDeliverablesPanelProps) {
  const {
    displayResult,
    htmlWriteup,
    documentBundle,
    presentation,
    slideOutline,
    downloadArtifacts,
    summaryReport,
  } = deliverables

  if (isRunActive && !htmlWriteup && !documentBundle?.markdown && !presentation && !displayResult) {
    return (
      <div className={cn("creator-task-deliverable-waiting", className)}>
        <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-amber" aria-hidden />
        <p className="text-sm font-medium text-foreground">Your result is on the way</p>
        <p className="mt-1 text-sm text-muted-foreground">
          It will show up here as soon as everything is finished and checked.
        </p>
      </div>
    )
  }

  return (
    <div className={cn("creator-task-deliverable-shell space-y-4", className)}>
      {summaryReport ? (
        <div className="creator-task-summary">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            At a glance
          </p>
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {summaryReport.summary}
          </p>
        </div>
      ) : null}

      {htmlWriteup ? <ChatHtmlWriteupArtifact {...htmlWriteup} /> : null}

      {!htmlWriteup && presentation ? (
        <ChatPresentationArtifact
          artifact={presentation.artifact}
          title={presentation.title}
          themeName={presentation.themeName}
          slidesCreated={presentation.slidesCreated}
          slideOutline={slideOutline}
          variant="presented"
        />
      ) : null}

      {!htmlWriteup && !presentation && documentBundle?.markdown ? (
        <ChatDocumentArtifact
          markdown={documentBundle.markdown}
          title={documentBundle.title}
          artifacts={documentBundle.artifacts}
        />
      ) : null}

      {!htmlWriteup && !presentation && !documentBundle?.markdown && downloadArtifacts.length > 0 ? (
        <ChatDeliverableArtifactList artifacts={downloadArtifacts} />
      ) : null}

      {!htmlWriteup &&
      !presentation &&
      !documentBundle?.markdown &&
      downloadArtifacts.length === 0 &&
      displayResult !== null &&
      displayResult !== undefined ? (
        <TaskResultViewer
          result={displayResult}
          taskDescription={taskDescription}
          taskId={taskId}
          variant="inline"
        />
      ) : null}

      {!htmlWriteup &&
      !presentation &&
      !documentBundle?.markdown &&
      downloadArtifacts.length === 0 &&
      (displayResult === null || displayResult === undefined) &&
      !isRunActive ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nothing was saved from this run yet. Try running the task again from chat.
        </p>
      ) : null}
    </div>
  )
}
