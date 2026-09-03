"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import type { AgentTemplateApi, RagFile } from "@/types/api"
import { PIPELINE_TEMPLATE_ROLE_SLOTS } from "@/constants/pipeline-template-roles"
import { ROUTES } from "@/lib/routes"

export type ExecutionMode = "parallel" | "sequential"

export interface TaskSetupValues {
  executionMode: ExecutionMode
  preferredProvider: string
  maxParallelAgents: number
  useRag: boolean
  selectedRagSources: string[]
  templateIds: Record<string, string>
  /** Pause the pipeline after major stages for review (same server as WebSocket). */
  humanInLoop: boolean
}

const defaultSetup: TaskSetupValues = {
  executionMode: "parallel",
  preferredProvider: "",
  maxParallelAgents: 5,
  useRag: false,
  selectedRagSources: [],
  templateIds: {},
  humanInLoop: true,
}

export function getDefaultTaskSetup(): TaskSetupValues {
  return { ...defaultSetup, selectedRagSources: [], templateIds: {} }
}

interface TaskSetupPanelProps {
  setup: TaskSetupValues
  onChange: (next: TaskSetupValues) => void
  llmProviders: string[]
  ragFiles: RagFile[] | undefined
  ragLoading: boolean
  templates: AgentTemplateApi[] | undefined
  templatesLoading: boolean
  disabled?: boolean
  /** Shorter collapse header when the card sits inside a chat message */
  embedded?: boolean
  /** Review step only: RAG + custom templates (no mode / provider / max) */
  wizardReviewOnly?: boolean
}

export function TaskSetupPanel({
  setup,
  onChange,
  llmProviders,
  ragFiles,
  ragLoading,
  templates,
  templatesLoading,
  disabled,
  embedded,
  wizardReviewOnly,
}: TaskSetupPanelProps) {
  const [advancedOpen, setAdvancedOpen] = useState(true)

  const allTemplates = useMemo(() => {
    return (templates || [])
      .filter((t) => (t.template_id || "").trim())
      .slice()
      .sort((a, b) =>
        (a.name || a.template_id || "").localeCompare(b.name || b.template_id || "", undefined, {
          sensitivity: "base",
        })
      )
  }, [templates])

  const setField = <K extends keyof TaskSetupValues>(key: K, value: TaskSetupValues[K]) => {
    onChange({ ...setup, [key]: value })
  }

  const toggleRagFile = (sourceKey: string) => {
    const cur = setup.selectedRagSources
    const has = cur.includes(sourceKey)
    setField(
      "selectedRagSources",
      has ? cur.filter((s) => s !== sourceKey) : [...cur, sourceKey]
    )
  }

  if (wizardReviewOnly) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border/60 bg-card/60 text-left px-3.5 py-3.5 space-y-3",
          disabled && "opacity-60 pointer-events-none"
        )}
      >
        <p className="text-xs font-medium text-foreground">Optional: RAG & templates</p>
        <p className="text-xs text-muted-foreground">
          Adjust document scope or custom prompts before you run. You can leave everything as-is.
        </p>
        <div className="flex items-start gap-2 border border-border/50 rounded-lg px-2.5 py-2 bg-background/40">
          <Checkbox
            id="hitlWiz"
            checked={setup.humanInLoop}
            onChange={(e) => setField("humanInLoop", e.target.checked)}
            disabled={disabled}
            className="mt-0.5"
          />
          <Label htmlFor="hitlWiz" className="text-sm font-normal cursor-pointer leading-snug">
            Pause after each major pipeline stage (master, plan, workers, merge) so you can edit or request a rework
            before the run continues
          </Label>
        </div>
        <div className="border-t border-border/40 pt-3 space-y-3">
          <div className="flex items-start gap-2">
            <Checkbox
              id="useRagWiz"
              checked={setup.useRag}
              onChange={(e) => setField("useRag", e.target.checked)}
              disabled={disabled}
              className="mt-0.5"
            />
            <Label htmlFor="useRagWiz" className="text-sm font-normal cursor-pointer leading-snug">
              Use RAG (retrieve from uploaded documents)
            </Label>
          </div>
          {setup.useRag && (
            <div className="pl-1 space-y-2">
              {ragLoading && <p className="text-xs text-muted-foreground">Loading file list…</p>}
              {!ragLoading && (!ragFiles || ragFiles.length === 0) && (
                <p className="text-xs text-amber/90">
                  No RAG files yet.{" "}
                  <Link href={ROUTES.rag} className="underline underline-offset-2 hover:text-amber">
                    Upload on Memory
                  </Link>
                  .
                </p>
              )}
              <div className="max-h-28 overflow-y-auto space-y-1.5 scrollbar-thin border border-border/40 rounded-lg p-2">
                {(ragFiles || []).map((f) => {
                  const key = f.filename || f.file_id
                  if (!key) return null
                  return (
                    <label
                      key={f.file_id}
                      className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={setup.selectedRagSources.includes(key)}
                        onChange={() => toggleRagFile(key)}
                        disabled={disabled}
                      />
                      <span className="truncate">{f.filename || f.file_id}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Assistants (optional)</p>
            {templatesLoading && <p className="text-xs text-muted-foreground">Loading templates…</p>}
            {PIPELINE_TEMPLATE_ROLE_SLOTS.map(({ key, label }) => {
              const opts = allTemplates
              const cur = setup.templateIds[key] || ""
              return (
                <div key={key} className="grid grid-cols-[100px_1fr] gap-2 items-center">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <Select
                    value={cur}
                    onChange={(e) => setField("templateIds", { ...setup.templateIds, [key]: e.target.value })}
                    disabled={disabled || templatesLoading}
                    className="h-9 text-xs"
                  >
                    <option value="">Default</option>
                    {opts.map((t) => (
                      <option key={t.template_id} value={t.template_id || ""}>
                        {t.name || t.template_id}
                      </option>
                    ))}
                  </Select>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card/60 text-left",
        disabled && "opacity-60 pointer-events-none"
      )}
    >
      <button
        type="button"
        onClick={() => setAdvancedOpen(!advancedOpen)}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-foreground hover:bg-muted/40 rounded-t-xl transition-colors"
      >
        <SlidersHorizontal className="h-4 w-4 text-amber shrink-0" />
        <span>
          {embedded
            ? "Execution & advanced options"
            : "Human in the loop — review settings before running"}
        </span>
        {advancedOpen ? (
          <ChevronDown className="h-4 w-4 ml-auto shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 ml-auto shrink-0 text-muted-foreground" />
        )}
      </button>

      <div className={cn("px-3.5 pb-3.5 space-y-3.5", !advancedOpen && "hidden")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Execution mode</Label>
            <Select
              className="mt-1"
              value={setup.executionMode}
              onChange={(e) => setField("executionMode", e.target.value as ExecutionMode)}
              disabled={disabled}
            >
              <option value="parallel">Parallel (decompose + multi-agent)</option>
              <option value="sequential">Sequential (single pass)</option>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">LLM provider</Label>
            <Select
              className="mt-1"
              value={setup.preferredProvider || ""}
              onChange={(e) => setField("preferredProvider", e.target.value)}
              disabled={disabled}
            >
              <option value="">Default (orchestrator chooses)</option>
              {llmProviders.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="maxPar" className="text-xs text-muted-foreground">
            Max parallel agents
          </Label>
          <Input
            id="maxPar"
            type="number"
            min={1}
            max={64}
            className="mt-1 h-9 border-border/50"
            value={setup.maxParallelAgents}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10)
              setField("maxParallelAgents", Number.isFinite(n) ? Math.min(64, Math.max(1, n)) : 5)
            }}
            disabled={disabled}
          />
        </div>

        <div className="border-t border-border/40 pt-3 space-y-3">
          <p className="text-xs font-medium text-foreground">Advanced</p>

          <div className="flex items-start gap-2">
            <Checkbox
              id="useRag"
              checked={setup.useRag}
              onChange={(e) => setField("useRag", e.target.checked)}
              disabled={disabled}
              className="mt-0.5"
            />
            <Label htmlFor="useRag" className="text-sm font-normal cursor-pointer leading-snug">
              Use RAG (retrieve from your uploaded documents during execution)
            </Label>
          </div>

          {setup.useRag && (
            <div className="pl-1 space-y-2">
              <p className="text-xs text-muted-foreground">
                Limit to specific files (optional). Leave none checked to search all ingested docs.
              </p>
              {ragLoading && (
                <p className="text-xs text-muted-foreground">Loading file list…</p>
              )}
              {!ragLoading && (!ragFiles || ragFiles.length === 0) && (
                <p className="text-xs text-amber/90">
                  No RAG files yet.{" "}
                  <Link href={ROUTES.rag} className="underline underline-offset-2 hover:text-amber">
                    Upload on Memory
                  </Link>
                  , then refresh.
                </p>
              )}
              <div className="max-h-32 overflow-y-auto space-y-1.5 scrollbar-thin border border-border/40 rounded-lg p-2">
                {(ragFiles || []).map((f) => {
                  const key = f.filename || f.file_id
                  if (!key) return null
                  return (
                    <label
                      key={f.file_id}
                      className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={setup.selectedRagSources.includes(key)}
                        onChange={() => toggleRagFile(key)}
                        disabled={disabled}
                      />
                      <span className="truncate">{f.filename || f.file_id}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Assistants (optional)</p>
            {templatesLoading && (
              <p className="text-xs text-muted-foreground">Loading templates…</p>
            )}
            {PIPELINE_TEMPLATE_ROLE_SLOTS.map(({ key, label }) => {
              const opts = allTemplates
              const cur = setup.templateIds[key] || ""
              return (
                <div key={key} className="grid grid-cols-[100px_1fr] gap-2 items-center">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <Select
                    value={cur}
                    onChange={(e) =>
                      setField("templateIds", { ...setup.templateIds, [key]: e.target.value })
                    }
                    disabled={disabled || templatesLoading}
                    className="h-9 text-xs"
                  >
                    <option value="">Default</option>
                    {opts.map((t) => (
                      <option key={t.template_id} value={t.template_id || ""}>
                        {t.name || t.template_id}
                      </option>
                    ))}
                  </Select>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
