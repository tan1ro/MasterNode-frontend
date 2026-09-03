"use client"

import { useMemo } from "react"
import { AccordionGroup, AccordionItem } from "@/components/ui/accordion"
import {
  AgentPartialResult,
  ExtractedFilesList,
  humanizeAgentId,
} from "@/components/tasks/agent-partial-result"
import { TaskDetailSection, taskDetailInsetPanel } from "@/components/tasks/task-detail-section"
import { filterUserFacingPartialResults } from "@/lib/pipeline-internal-agents"
import {
  collectPartialResultConfidences,
  getPartialResultConfidence,
  mergeCodeFilesFromPartialResults,
} from "@/lib/task-result-parser"

interface PartialResultsCardProps {
  results: Record<string, unknown>
}

function toConfidencePercent(raw: number): number {
  return raw <= 1 ? raw * 100 : raw
}

function formatConfidenceSummary(values: number[]): string {
  if (values.length === 0) return ""
  const pct = values.map((v) => {
    const p = toConfidencePercent(v)
    return p >= 10 ? Math.round(p) : Math.round(p * 10) / 10
  })
  const lo = Math.min(...pct)
  const hi = Math.max(...pct)
  if (lo === hi) {
    return `${lo}%`
  }
  return `${lo}%–${hi}%`
}

export function PartialResultsCard({ results }: PartialResultsCardProps) {
  const visibleResults = useMemo(() => filterUserFacingPartialResults(results), [results])
  const entries = Object.entries(visibleResults)
  const mergedProjectFiles = useMemo(
    () => mergeCodeFilesFromPartialResults(visibleResults),
    [visibleResults]
  )
  const showCombinedProject =
    entries.length > 1 && mergedProjectFiles.length > 0
  const confidenceValues = useMemo(
    () => collectPartialResultConfidences(visibleResults),
    [visibleResults]
  )

  if (entries.length === 0) return null

  return (
    <TaskDetailSection
      className="mt-6"
      title={showCombinedProject ? "Generated project" : "Findings"}
      description={
        showCombinedProject ? (
          <>
            Final merged files below (one tree, longest version wins per path). This is the runnable proof of what
            the run produced. Per-agent notes are collapsed so you are not flooded with duplicate file maps.
          </>
        ) : (
          <>Output from each agent on this task.</>
        )
      }
      contentClassName="space-y-8"
    >
      {showCombinedProject && (
        <section className={taskDetailInsetPanel} aria-label="Combined project files from all agents">
          <h3 className="font-heading text-base font-semibold text-foreground">Final code bundle</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Paths such as{" "}
            <code className="rounded bg-muted/80 px-1 py-0.5 font-mono text-xs">webapp/index.html</code> are merged
            across agents; duplicate paths keep the longest body.
          </p>
          {confidenceValues.length > 0 && (
            <p className="mt-2 text-sm font-medium text-foreground">
              Reported agent confidence (range across this run):{" "}
              <span className="text-emerald">{formatConfidenceSummary(confidenceValues)}</span>
            </p>
          )}
          <div className="mt-4">
            <ExtractedFilesList files={mergedProjectFiles} />
          </div>
        </section>
      )}

      {showCombinedProject ? (
        <div className="space-y-2">
          <h4 className="font-heading text-sm font-semibold text-foreground">Per-agent output</h4>
          <p className="text-xs text-muted-foreground">
            Expand a row for that agent&apos;s narrative; file bodies already appear in the bundle above.
          </p>
          <AccordionGroup>
            {entries.map(([agentId, result]) => {
              const label = humanizeAgentId(agentId)
              const c = getPartialResultConfidence(result)
              const title =
                c !== null
                  ? `${label} · ${formatConfidenceSummary([c])} confidence`
                  : label
              return (
                <AccordionItem key={agentId} title={title} defaultOpen={false}>
                  <AgentPartialResult
                    agentId={agentId}
                    value={result}
                    omitFilePanels
                    suppressHeader
                  />
                </AccordionItem>
              )
            })}
          </AccordionGroup>
        </div>
      ) : (
        entries.map(([agentId, result]) => (
          <AgentPartialResult key={agentId} agentId={agentId} value={result} omitFilePanels={false} />
        ))
      )}
    </TaskDetailSection>
  )
}
