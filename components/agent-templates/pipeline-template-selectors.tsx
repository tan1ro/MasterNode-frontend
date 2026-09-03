"use client"

import { useMemo } from "react"
import { Lock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { UpgradeCTA } from "@/components/shared/feature-gate"
import { PIPELINE_TEMPLATE_ROLE_SLOTS } from "@/constants/pipeline-template-roles"
import type { PipelineTemplateSelection } from "@/lib/pipeline-run-context"
import { cn } from "@/lib/utils"
import type { AgentTemplateApi } from "@/types/api"
import { useAppAuth } from "@/hooks/use-app-auth"
import { isBusinessAccountType } from "@/lib/account-types"

interface PipelineTemplateSelectorsProps {
  value: PipelineTemplateSelection
  onChange: (next: PipelineTemplateSelection) => void
  templates: AgentTemplateApi[] | undefined
  loading?: boolean
  disabled?: boolean
  idPrefix?: string
  /** Less copy and tighter layout (e.g. Agent templates page). */
  compact?: boolean
  /** One row of pipeline stages on large screens (create-task run context). */
  stageRowLayout?: boolean
}

function sortTemplatesByName(a: AgentTemplateApi, b: AgentTemplateApi): number {
  const an = (a.name || a.template_id || "").toLowerCase()
  const bn = (b.name || b.template_id || "").toLowerCase()
  return an.localeCompare(bn)
}

/** Any assistant can be assigned to any pipeline stage — stage is chosen here, not on the template. */
function templatesForSlot(list: AgentTemplateApi[] | undefined): AgentTemplateApi[] {
  const all = (list || []).filter((t) => (t.template_id || "").trim())
  all.sort(sortTemplatesByName)
  return all
}

function toggleId(cur: string[], id: string): string[] {
  return cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
}

function TemplateCheckboxGroup({
  title,
  items,
  selected,
  slotKey,
  idPrefix,
  disabled,
  onToggle,
  hideTitle,
}: {
  title: string
  items: AgentTemplateApi[]
  selected: string[]
  slotKey: string
  idPrefix: string
  disabled?: boolean
  onToggle: (id: string) => void
  hideTitle?: boolean
}) {
  if (items.length === 0) return null
  return (
    <div className="space-y-1">
      {!hideTitle ? (
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
      ) : null}
      {items.map((t) => {
        const id = t.template_id || ""
        const inputId = `${idPrefix}-${slotKey}-${id}`
        const locked = t.unlocked === false
        return (
          <label
            key={id}
            htmlFor={inputId}
            className={`flex items-center gap-2 text-xs rounded px-1 py-0.5 ${
              locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-muted/40"
            }`}
          >
            <Checkbox
              id={inputId}
              checked={selected.includes(id)}
              onChange={() => !locked && onToggle(id)}
              disabled={disabled || locked}
            />
            <span className="truncate flex items-center gap-1">
              {locked ? <Lock className="h-3 w-3 shrink-0 text-amber" aria-hidden /> : null}
              {t.name || id}
            </span>
          </label>
        )
      })}
    </div>
  )
}

export function PipelineTemplateSelectors({
  value,
  onChange,
  templates,
  loading,
  disabled,
  idPrefix = "pt",
  compact,
  stageRowLayout = false,
}: PipelineTemplateSelectorsProps) {
  const { accountType } = useAppAuth()
  const canUsePipelineTemplateOverrides = isBusinessAccountType(accountType)
  const slotsWithLists = useMemo(() => {
    return PIPELINE_TEMPLATE_ROLE_SLOTS.map(({ key, label }) => ({
      key,
      label,
      matching: templatesForSlot(templates),
      custom: [] as AgentTemplateApi[],
    }))
  }, [templates])

  return (
    <div className={compact ? "space-y-2" : "space-y-3 rounded-lg border border-border/60 bg-muted/10 p-4"}>
      {!canUsePipelineTemplateOverrides ? (
        <div className={compact ? "text-xs text-muted-foreground" : "rounded-md border border-border/50 bg-background/70 p-2.5 text-xs text-muted-foreground"}>
          Pipeline assistant overrides are available for business accounts only.
        </div>
      ) : null}
      {!compact ? (
        <div>
          <p className="text-sm font-medium text-foreground">Custom agents (optional)</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select one or more templates per pipeline stage. Multiple selections are merged at run time.
            Locked templates require a higher plan.
          </p>
        </div>
      ) : null}
      {canUsePipelineTemplateOverrides && (templates || []).some((t) => t.unlocked === false) ? (
        <UpgradeCTA feature="templates.use_locked" compact />
      ) : null}
      {loading ? <p className="text-xs text-muted-foreground">Loading…</p> : null}
      {canUsePipelineTemplateOverrides ? (
      <div
        className={
          stageRowLayout
            ? "grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            : compact
              ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-3"
        }
      >
        {slotsWithLists.map(({ key, label, matching, custom }) => {
          const selected = value[key] || []
          const setSelected = (next: string[]) => onChange({ ...value, [key]: next })
          const allOpts = [...matching, ...custom]
          if (!loading && allOpts.length === 0) {
            return compact ? null : (
              <div key={key} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">{label}:</span> none yet
              </div>
            )
          }
          if (compact && allOpts.length === 0) return null
          return (
            <div
              key={key}
              className={
                compact
                  ? cn(
                      "rounded-lg border border-border/40 bg-background/40 space-y-2",
                      stageRowLayout ? "p-3" : "p-2.5"
                    )
                  : "rounded-lg border border-border/40 bg-background/40 p-2.5 space-y-2"
              }
            >
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs text-foreground font-medium">{label}</Label>
                {selected.length > 0 ? (
                  <button
                    type="button"
                    className="text-[10px] text-muted-foreground hover:text-foreground underline"
                    disabled={disabled}
                    onClick={() => setSelected([])}
                  >
                    Clear ({selected.length})
                  </button>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Default</span>
                )}
              </div>
              <TemplateCheckboxGroup
                title="Assistants"
                items={matching}
                selected={selected}
                slotKey={key}
                idPrefix={idPrefix}
                disabled={disabled}
                hideTitle={compact}
                onToggle={(id) => setSelected(toggleId(selected, id))}
              />
              <TemplateCheckboxGroup
                title="Custom"
                items={custom}
                selected={selected}
                slotKey={key}
                idPrefix={idPrefix}
                disabled={disabled}
                hideTitle={compact || matching.length === 0}
                onToggle={(id) => setSelected(toggleId(selected, id))}
              />
            </div>
          )
        })}
      </div>
      ) : null}
    </div>
  )
}
