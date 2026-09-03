import {
  extractPresentationFromTaskResult,
  parseSlideOutline,
  type PresentationArtifact,
} from "@/components/chat/chat-presentation-artifact"
import { extractDocumentFromTaskResult } from "@/lib/document-from-task-result"
import { extractHtmlWriteupFromTaskResult } from "@/lib/html-writeup"
import {
  classifyPipelineOutput,
  extractPipelineArtifacts,
  normalizeTaskResultForViewer,
  pipelineOutputKindLabel,
} from "@/lib/pipeline-output"
import { isActiveTaskStatus } from "@/lib/task-list-filters"
import { buildTaskSummaryReport } from "@/lib/task-overview"
import type { Task } from "@/types/api"

export type CreatorTaskRunPhase = "active" | "review" | "completed" | "failed"

export function getCreatorTaskRunPhase(status: Task["status"]): CreatorTaskRunPhase {
  if (status === "completed") return "completed"
  if (status === "failed") return "failed"
  if (status === "awaiting_human" || status === "awaiting_plan_review") return "review"
  if (isActiveTaskStatus(status)) return "active"
  return "failed"
}

export interface CreatorTaskStatusCopy {
  label: string
  description: string
}

export function getCreatorTaskStatusCopy(status: Task["status"]): CreatorTaskStatusCopy {
  switch (status) {
    case "pending":
      return {
        label: "Starting soon",
        description: "Your task is queued and will begin in a moment.",
      }
    case "decomposing":
      return {
        label: "Planning your task",
        description: "We are figuring out the best way to tackle your request.",
      }
    case "running":
      return {
        label: "Working on it",
        description: "Hang tight — we are putting your result together.",
      }
    case "awaiting_plan_review":
      return {
        label: "Waiting on you",
        description: "Review the plan below, choose an output format, then continue.",
      }
    case "awaiting_human":
      return {
        label: "Needs your input",
        description: "Open the chat thread to answer a quick question and continue.",
      }
    case "completed":
      return {
        label: "All done",
        description: "Your result is ready below.",
      }
    case "failed":
      return {
        label: "Could not finish",
        description: "Something went wrong. You can try again from chat or create a new task.",
      }
    default:
      return {
        label: "Unavailable",
        description: "This run ended before a result was ready.",
      }
  }
}

export interface CreatorTaskDeliverables {
  displayResult: unknown
  htmlWriteup: ReturnType<typeof extractHtmlWriteupFromTaskResult>
  documentBundle: ReturnType<typeof extractDocumentFromTaskResult>
  presentation: ReturnType<typeof extractPresentationFromTaskResult>
  slideOutline: ReturnType<typeof parseSlideOutline>
  downloadArtifacts: PresentationArtifact[]
  outputKindLabel: string
  summaryReport: ReturnType<typeof buildTaskSummaryReport>
}

function artifactKey(artifact: PresentationArtifact): string {
  return `${artifact.filename}:${artifact.mime_type}`
}

export function resolveCreatorTaskDeliverables(task: Task): CreatorTaskDeliverables {
  const displayResult = normalizeTaskResultForViewer(task as unknown as Record<string, unknown>)
  const outputKind = displayResult ? classifyPipelineOutput(displayResult) : "text"

  const htmlWriteup = displayResult ? extractHtmlWriteupFromTaskResult(displayResult) : null
  const documentBundle = displayResult ? extractDocumentFromTaskResult(displayResult) : null
  const presentation = displayResult ? extractPresentationFromTaskResult(displayResult) : null
  const slideOutline =
    displayResult && typeof displayResult === "object"
      ? parseSlideOutline(displayResult as Record<string, unknown>)
      : null

  const claimed = new Set<string>()
  if (presentation?.artifact) claimed.add(artifactKey(presentation.artifact))
  for (const artifact of documentBundle?.artifacts ?? []) {
    claimed.add(artifactKey(artifact))
  }

  const downloadArtifacts =
    displayResult && !htmlWriteup
      ? extractPipelineArtifacts(displayResult)
          .filter((artifact) => !claimed.has(artifactKey(artifact)))
          .map((artifact) => ({
            filename: artifact.filename,
            mime_type: artifact.mime_type,
            base64: artifact.base64,
          }))
      : []

  return {
    displayResult,
    htmlWriteup,
    documentBundle,
    presentation,
    slideOutline,
    downloadArtifacts,
    outputKindLabel: pipelineOutputKindLabel(outputKind),
    summaryReport: buildTaskSummaryReport(displayResult, task.task),
  }
}

export function creatorTaskHasDeliverableContent(deliverables: CreatorTaskDeliverables): boolean {
  return Boolean(
    deliverables.htmlWriteup ||
      deliverables.documentBundle?.markdown ||
      deliverables.presentation ||
      deliverables.downloadArtifacts.length > 0 ||
      (deliverables.displayResult !== null && deliverables.displayResult !== undefined)
  )
}
