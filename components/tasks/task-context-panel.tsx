"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Bot, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CustomAgentsBadges } from "@/components/tasks/custom-agents-badges"
import { TaskDetailSection, taskDetailInsetPanel } from "@/components/tasks/task-detail-section"
import { useTaskMetrics, taskMetricsFetchEnabled } from "@/hooks/use-metrics"
import { chatService } from "@/services/chat"
import { normalizeTaskResultForViewer } from "@/lib/pipeline-output"
import { ROUTES } from "@/lib/routes"
import { rememberTaskConversationLink, resolveTaskConversationId } from "@/lib/task-chat-link"
import { buildChatTaskInsights, buildTaskSummaryReport } from "@/lib/task-overview"
import {
  buildAgentUsageRows,
  buildLlmContributionRows,
  buildTokenShareSummary,
} from "@/lib/task-stage-metrics"
import { LlmContributionTable } from "@/components/tasks/llm-contribution-table"
import { LlmProviderBadge } from "@/components/tasks/llm-provider-badge"
import type { Task } from "@/types/api"

interface TaskContextPanelProps {
  task: Task
  queryChatId?: string | null
}

function ShareBar({ label, pct, tone }: { label: string; pct: number; tone: "input" | "output" }) {
  const barClass = tone === "input" ? "bg-cyan/80" : "bg-amber/80"
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function TaskContextPanel({ task, queryChatId }: TaskContextPanelProps) {
  const conversationId = resolveTaskConversationId(task, task.task_id, queryChatId)
  const [chatTitle, setChatTitle] = useState<string | null>(null)
  const [chatInsightsText, setChatInsightsText] = useState<string | null>(null)
  const [chatUserPrompt, setChatUserPrompt] = useState<string | null>(null)

  const poll =
    task.status === "running" || task.status === "decomposing"
  const { data: metricsPayload } = useTaskMetrics(
    task.task_id,
    taskMetricsFetchEnabled(task.status),
    poll ? 2000 : false
  )
  const metrics = metricsPayload?.metrics

  const displayResult = useMemo(
    () => normalizeTaskResultForViewer(task as unknown as Record<string, unknown>),
    [task]
  )
  const summaryReport = useMemo(
    () => buildTaskSummaryReport(displayResult, task.task),
    [displayResult, task.task]
  )

  const tokenShare = useMemo(() => buildTokenShareSummary(metrics), [metrics])
  const llmRows = useMemo(
    () => buildLlmContributionRows(metrics, task.partial_results),
    [metrics, task.partial_results]
  )
  const agentRows = useMemo(
    () => buildAgentUsageRows(metrics, task.partial_results),
    [metrics, task.partial_results]
  )

  useEffect(() => {
    if (conversationId) {
      rememberTaskConversationLink(task.task_id, conversationId)
    }
  }, [conversationId, task.task_id])

  useEffect(() => {
    if (!conversationId) {
      setChatTitle(null)
      setChatInsightsText(null)
      setChatUserPrompt(null)
      return
    }

    let cancelled = false
    void chatService
      .getConversation(conversationId)
      .then((data) => {
        if (cancelled) return
        setChatTitle(data.conversation.title?.trim() || "Chat thread")
        const insights = buildChatTaskInsights(data.messages, task.task_id)
        if (!insights) {
          setChatInsightsText(null)
          setChatUserPrompt(null)
          return
        }
        setChatUserPrompt(insights.userPrompt || null)
        const notes = insights.assistantNotes.join("\n\n")
        setChatInsightsText(notes || null)
      })
      .catch(() => {
        if (cancelled) return
        setChatTitle(null)
        setChatInsightsText(null)
        setChatUserPrompt(null)
      })

    return () => {
      cancelled = true
    }
  }, [conversationId, task.task_id])

  const hasAgents =
    Boolean(task.template_ids && Object.values(task.template_ids).some((v) => String(v || "").trim())) ||
    agentRows.length > 0

  return (
    <div className="space-y-4">
      {conversationId ? (
        <div className="flex flex-wrap items-center gap-3">
          <Link href={ROUTES.chatConversation(conversationId)}>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to chat
            </Button>
          </Link>
          {chatTitle ? (
            <p className="text-sm text-muted-foreground">
              <MessageSquare className="inline h-4 w-4 mr-1.5 align-text-bottom" />
              {chatTitle}
            </p>
          ) : null}
        </div>
      ) : null}

      <TaskDetailSection
        title="Task overview"
        description="Summarized report and chat context for this run"
      >
          {summaryReport ? (
            <div className={taskDetailInsetPanel}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Summarized report
              </p>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {summaryReport.summary}
              </p>
              {summaryReport.details.length > 0 ? (
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {summaryReport.details.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              A summarized report will appear here when the pipeline publishes a final output.
            </p>
          )}

          {chatUserPrompt || chatInsightsText ? (
            <div className={taskDetailInsetPanel}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Chat insights
              </p>
              {chatUserPrompt ? (
                <div className="mb-3">
                  <p className="text-[11px] font-medium text-muted-foreground mb-1">Your prompt</p>
                  <p className="text-sm whitespace-pre-wrap text-foreground">{chatUserPrompt}</p>
                </div>
              ) : null}
              {chatInsightsText ? (
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground mb-1">Assistant updates</p>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{chatInsightsText}</p>
                </div>
              ) : null}
            </div>
          ) : null}
      </TaskDetailSection>

      <TaskDetailSection
        title="Agents & LLM usage"
        description="Pipeline agents used and token share across input and output"
        contentClassName="space-y-5"
      >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Agents used
            </p>
            {hasAgents ? (
              <div className="space-y-3">
                <CustomAgentsBadges templateIds={task.template_ids} />
                {agentRows.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-border/50">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50 bg-muted/40 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <th className="px-3 py-2">Stage</th>
                          <th className="px-3 py-2">LLM</th>
                          <th className="px-3 py-2">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agentRows.map((row) => (
                          <tr key={row.id} className="border-b border-border/30 last:border-0">
                            <td className="px-3 py-2.5 font-medium text-foreground">
                              <span className="inline-flex items-center gap-1.5">
                                <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                                {row.label}
                              </span>
                            </td>
                            <td className="px-3 py-2.5">
                              <LlmProviderBadge provider={row.provider} showAutoRoute={false} />
                            </td>
                            <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                              {typeof row.durationSeconds === "number" ? `${row.durationSeconds}s` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Default pipeline agents for all stages.</p>
            )}
          </div>

          {tokenShare ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                LLM token share
              </p>
              <div className="grid gap-3 sm:grid-cols-2 mb-3">
                <ShareBar label="Input tokens" pct={tokenShare.inputSharePct} tone="input" />
                <ShareBar label="Output tokens" pct={tokenShare.outputSharePct} tone="output" />
              </div>
              <p className="text-xs text-muted-foreground tabular-nums">
                {tokenShare.promptTokens.toLocaleString()} input ·{" "}
                {tokenShare.completionTokens.toLocaleString()} output ·{" "}
                {tokenShare.totalTokens.toLocaleString()} total
              </p>
            </div>
          ) : null}

          {llmRows.length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Provider contribution
              </p>
              <LlmContributionTable
                rows={llmRows}
                stageAttributionAvailable={Boolean(
                  metrics?.stage_provider_calls &&
                    Object.keys(metrics.stage_provider_calls).length > 0
                )}
              />
            </div>
          ) : !tokenShare ? (
            <p className="text-sm text-muted-foreground">
              LLM usage metrics will appear once execution data is recorded for this task.
            </p>
          ) : null}
      </TaskDetailSection>
    </div>
  )
}
