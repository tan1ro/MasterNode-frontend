"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Plus,
  Edit2,
  Trash2,
  Lock,
  Search,
  Sparkles,
} from "lucide-react"
import { AssistantFormatPill } from "@/components/agent-templates/sample-agent-gallery-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAgentTemplates, useUpsertAgentTemplate, useDeleteAgentTemplate } from "@/hooks"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { AgentTemplateFormDialog } from "@/components/agent-templates/agent-template-form-dialog"
import {
  displayTemplateName,
  shortTemplateDescription,
  templateCardBadge,
  templateCardBody,
  templateCardDesc,
  templateCardFooter,
  templateCardGrid,
  templateCardHeader,
  templateCardIcon,
  templateCardIconSize,
  templateCardShell,
  templateCardTitle,
} from "@/components/agent-templates/template-role-utils"
import { getErrorMessage } from "@/types/api"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { UpgradeCTA, UpgradePopup } from "@/components/shared/feature-gate"
import { useEntitlements } from "@/hooks/use-entitlements"
import type { AssistantAiDraft } from "@/lib/assistant-ai-draft"
import {
  domainFocusBadgeClass,
  domainFocusForTemplate,
  outputFormatsForTemplate,
} from "@/lib/assistant-creator-meta"
import {
  assistantIconBg,
  iconForAssistant,
} from "@/lib/assistant-gallery-icons"
import type { AgentTemplateApi, UpsertAgentTemplateBody } from "@/types/api"

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  pro_plus: "Premium",
  premium: "Infinity",
  enterprise: "Enterprise",
}

function lockBadge(t: AgentTemplateApi): string | null {
  if (t.unlocked !== false) return null
  const role = (t.required_role ?? "any").toLowerCase()
  const plan = (t.min_plan ?? "free").toLowerCase()
  const planLabel = PLAN_LABEL[plan] ?? plan
  if (role === "business" || role === "development" || role === "developer") return `Business · ${planLabel}+`
  if (role === "creator") return `Creator · ${planLabel}+`
  return `${planLabel}+`
}

interface TemplateCardProps {
  t: AgentTemplateApi
  onEdit: (t: AgentTemplateApi) => void
  onDelete: (t: AgentTemplateApi) => void
  actionsDisabled?: boolean
  compact?: boolean
  creatorMode?: boolean
}

function TemplateCard({ t, onEdit, onDelete, actionsDisabled, compact, creatorMode }: TemplateCardProps) {
  const domainFocus = domainFocusForTemplate(t.template_id, t.config)
  const outputFormats = outputFormatsForTemplate(t.template_id, t.config)
  const title = displayTemplateName(t.name || t.template_id || "Template")
  const desc = shortTemplateDescription(t.description) ?? null
  const locked = t.unlocked === false
  const lockText = lockBadge(t)
  const templateId = String(t.template_id ?? "").trim()
  const CardIcon = iconForAssistant(templateId, domainFocus)
  const cardIconBg = assistantIconBg(templateId, domainFocus)

  const actionButtons = (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Edit template"
        title={locked ? "Locked by your plan/role" : "Edit"}
        onClick={() => onEdit(t)}
        disabled={locked || actionsDisabled}
      >
        <Edit2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Delete template"
        title={locked ? "Locked by your plan/role" : "Delete"}
        onClick={() => onDelete(t)}
        disabled={locked || actionsDisabled}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )

  if (creatorMode) {
    return (
      <Card
        variant="minimal"
        interactive={!locked}
        className={cn(
          "flex h-full min-h-[10.5rem] flex-col p-4 transition-[border-color,background-color] duration-200",
          "border-border/60 bg-card/30 hover:border-border hover:bg-muted/15",
          locked && "opacity-60"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              cardIconBg
            )}
          >
            <CardIcon className={templateCardIconSize} aria-hidden />
          </div>
          <p
            className={cn(
              templateCardTitle,
              "min-w-0 flex-1 text-[0.9375rem] font-semibold leading-snug line-clamp-2"
            )}
          >
            {title}
          </p>
        </div>

        {desc ? (
          <p
            className={cn(
              templateCardDesc,
              "mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed"
            )}
          >
            {desc}
          </p>
        ) : (
          <div className="mt-2 min-h-[2.5rem]" />
        )}

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-medium",
              domainFocusBadgeClass(domainFocus)
            )}
          >
            {domainFocus}
          </span>
          {outputFormats.slice(0, 3).map((fmt) => (
            <AssistantFormatPill key={fmt} fmt={fmt} />
          ))}
          {outputFormats.length > 3 ? (
            <span className="text-[10px] text-muted-foreground">
              +{outputFormats.length - 3}
            </span>
          ) : null}
          {lockText ? (
            <span
              className={cn(
                "inline-flex h-5 items-center gap-1 rounded-full border border-amber/30 bg-amber/10 px-2 text-[10px] font-medium text-amber"
              )}
            >
              <Lock className="h-3 w-3" aria-hidden />
              {lockText}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-end border-t border-border/40 pt-3">
          {actionButtons}
        </div>
      </Card>
    )
  }

  return (
    <Card
      variant="minimal"
      interactive={!locked}
      className={cn(templateCardShell, locked && "opacity-60")}
    >
      <div className={templateCardHeader}>
        <div className={cn(templateCardIcon, cardIconBg)}>
          <CardIcon className={templateCardIconSize} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className={cn(templateCardTitle, "truncate")}>{title}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn(templateCardBadge, domainFocusBadgeClass(domainFocus))}>
              {domainFocus}
            </span>
            {lockText ? (
              <span className={cn(templateCardBadge, "gap-1 border-amber/30 bg-amber/10 text-amber")}>
                <Lock className="h-3.5 w-3.5" aria-hidden />
                {lockText}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className={templateCardBody}>
        {desc && !compact ? <p className={templateCardDesc}>{desc}</p> : null}
      </div>

      <div className={templateCardFooter}>{actionButtons}</div>
    </Card>
  )
}

export function AgentTemplatesGrid({
  compact,
  variant = "default",
  creatorMode = false,
  pendingDraft = null,
  onPendingDraftConsumed,
}: {
  compact?: boolean
  variant?: "default" | "workspace"
  creatorMode?: boolean
  pendingDraft?: { body: UpsertAgentTemplateBody; draft: AssistantAiDraft } | null
  onPendingDraftConsumed?: () => void
}) {
  const { data, isLoading, error, isFetching, refetch } = useAgentTemplates()
  const upsertMutation = useUpsertAgentTemplate()
  const deleteMutation = useDeleteAgentTemplate()
  const { can } = useEntitlements()
  const canManageTemplates = can("templates.manage")

  const templates = data?.templates ?? []

  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create")
  const [editorInitial, setEditorInitial] = useState<AgentTemplateApi | null>(null)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<AgentTemplateApi | null>(null)
  const [deleteErr, setDeleteErr] = useState<string | null>(null)
  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredTemplates = normalizedSearch
    ? templates.filter((template) => {
        const title = displayTemplateName(template.name || template.template_id || "Template").toLowerCase()
        const description = shortTemplateDescription(template.description)?.toLowerCase() ?? ""
        const id = String(template.template_id ?? "").toLowerCase()
        return title.includes(normalizedSearch) || description.includes(normalizedSearch) || id.includes(normalizedSearch)
      })
    : templates

  useEffect(() => {
    if (!pendingDraft || !canManageTemplates) return
    const { body } = pendingDraft
    upsertMutation.reset()
    setEditorMode("create")
    setEditorInitial({
      template_id: body.template_id,
      name: body.name,
      description: body.description,
      prompt_template: body.prompt_template,
      config: body.config,
      variables: body.variables,
    })
    setEditorOpen(true)
    onPendingDraftConsumed?.()
  }, [pendingDraft, canManageTemplates, onPendingDraftConsumed, upsertMutation])

  const openCreate = useCallback(() => {
    if (!canManageTemplates) {
      setShowUpgradePopup(true)
      return
    }
    upsertMutation.reset()
    setEditorMode("create")
    setEditorInitial(null)
    setEditorOpen(true)
  }, [upsertMutation, canManageTemplates])

  const openEdit = useCallback(
    (t: AgentTemplateApi) => {
      if (!canManageTemplates) {
        setShowUpgradePopup(true)
        return
      }
      upsertMutation.reset()
      setEditorMode("edit")
      setEditorInitial(t)
      setEditorOpen(true)
    },
    [upsertMutation, canManageTemplates]
  )

  const handleFormSubmit = useCallback(
    (body: UpsertAgentTemplateBody) => {
      upsertMutation.mutate(body, {
        onSuccess: () => setEditorOpen(false),
      })
    },
    [upsertMutation]
  )

  const requestDelete = useCallback((t: AgentTemplateApi) => {
    if (!canManageTemplates) {
      setShowUpgradePopup(true)
      return
    }
    setDeleteErr(null)
    setPendingDelete(t)
    setDeleteOpen(true)
  }, [canManageTemplates])

  const confirmDelete = useCallback(() => {
    const id = String(pendingDelete?.template_id ?? "").trim()
    if (!id) return
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteOpen(false)
        setPendingDelete(null)
        setDeleteErr(null)
      },
      onError: (e) => setDeleteErr(getErrorMessage(e, "Delete failed")),
    })
  }, [pendingDelete, deleteMutation])

  return (
    <div className="space-y-5">
      <UpgradePopup
        open={showUpgradePopup}
        onOpenChange={setShowUpgradePopup}
        feature="templates.manage"
        title="Upgrade required to manage templates"
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o)
          if (!o) {
            setPendingDelete(null)
            setDeleteErr(null)
          }
        }}
        title={
          pendingDelete
            ? `Delete template "${pendingDelete.name || pendingDelete.template_id}"?`
            : "Delete template?"
        }
        description="This removes the saved prompt for your workspace. Tasks that already ran keep their history."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        pendingLabel="Deleting…"
        variant="destructive"
        isPending={deleteMutation.isPending}
        errorMessage={deleteErr}
        onConfirm={confirmDelete}
      />

      <AgentTemplateFormDialog
        open={editorOpen}
        onOpenChange={(o) => {
          if (!o) upsertMutation.reset()
          setEditorOpen(o)
        }}
        mode={editorMode}
        initial={editorInitial}
        isPending={upsertMutation.isPending}
        submitError={upsertMutation.isError ? upsertMutation.error : null}
        creatorMode={creatorMode}
        onSubmit={handleFormSubmit}
      />

      {!canManageTemplates ? (
        <div className="mb-4">
          <UpgradeCTA feature="templates.manage" />
        </div>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1 lg:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={creatorMode ? "Search your assistants..." : "Search custom templates..."}
            className="h-10 border-border/70 bg-background/60 pl-9"
            aria-label="Search custom templates"
          />
        </div>
        {creatorMode && templates.length > 0 ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground tabular-nums">
            <Sparkles className="h-3.5 w-3.5 text-amber" aria-hidden />
            {filteredTemplates.length} assistant{filteredTemplates.length === 1 ? "" : "s"}
          </span>
        ) : null}
        <Button
          type="button"
          onClick={openCreate}
          size="sm"
          className={cn(
            "h-10 shrink-0 gap-1.5 sm:self-end lg:ml-auto",
            creatorMode
              ? "border-amber/35 bg-amber text-amber-foreground hover:bg-amber/90"
              : "bg-violet text-white hover:bg-violet/90"
          )}
          disabled={isLoading || Boolean(error)}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          {creatorMode ? "New assistant" : "New"}
        </Button>
      </div>

      {error ? (
        <>
          <ApiErrorCallout error={error} title="Could not load templates" fallbackMessage="Could not load templates" />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching ? "Retrying…" : "Retry"}
          </Button>
        </>
      ) : null}
      {isLoading && <p className="text-xs text-muted-foreground">Loading…</p>}

      <div
        className={cn(
          compact
            ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch"
            : templateCardGrid,
          creatorMode && "gap-5"
        )}
      >
        {filteredTemplates.map((t, idx) => (
          <TemplateCard
            key={String(t.template_id ?? idx)}
            t={t}
            onEdit={openEdit}
            onDelete={requestDelete}
            actionsDisabled={deleteMutation.isPending || upsertMutation.isPending}
            compact={compact}
            creatorMode={creatorMode}
          />
        ))}

        {!isLoading && !error && templates.length === 0 ? (
          <div
            className={cn(
              "col-span-full rounded-lg border border-dashed py-10 text-center",
              creatorMode
                ? "border-amber/25 bg-amber/[0.03]"
                : "border-violet/25 bg-violet/[0.03]"
            )}
          >
            <p className="text-sm text-muted-foreground">
              {creatorMode ? "No custom assistants yet" : "No templates yet"}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={cn(
                "mt-3",
                creatorMode
                  ? "border-amber/30 text-amber hover:bg-amber/10"
                  : "border-violet/30 text-violet hover:bg-violet/10"
              )}
              onClick={openCreate}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              {creatorMode ? "Create assistant" : "Create"}
            </Button>
          </div>
        ) : null}
        {!isLoading && !error && templates.length > 0 && filteredTemplates.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed border-border/70 bg-muted/20 py-10 text-center">
            <p className="text-sm text-muted-foreground">No custom templates match your search</p>
          </div>
        ) : null}

        {!isLoading && !error && templates.length > 0 ? (
          <button
            type="button"
            onClick={openCreate}
            disabled={isLoading || Boolean(error)}
            className={cn(
              "flex h-full min-h-[10.5rem] flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-5 text-left transition-colors focus-visible:outline-none",
              creatorMode
                ? "border-amber/25 hover:border-amber/40 hover:bg-amber/[0.03] focus-visible:ring-2 focus-visible:ring-amber/40"
                : "border-violet/25 hover:border-violet/40 hover:bg-violet/[0.03] focus-visible:ring-2 focus-visible:ring-violet/40"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                creatorMode ? "bg-amber/15 text-amber" : "bg-violet/15 text-violet"
              )}
            >
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {creatorMode ? "New assistant" : "New template"}
            </span>
          </button>
        ) : null}
      </div>
    </div>
  )
}
