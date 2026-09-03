"use client"

import { useCallback, useMemo, useState } from "react"
import { Edit2, LayoutGrid, Loader2, Plus, Trash2 } from "lucide-react"
import { AssistantFormatPill } from "@/components/agent-templates/sample-agent-gallery-card"
import { AgentTemplateFormDialog } from "@/components/agent-templates/agent-template-form-dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { UpgradeCTA, UpgradePopup } from "@/components/shared/feature-gate"
import { useAgentTemplates, useDeleteAgentTemplate, useUpsertAgentTemplate } from "@/hooks"
import { useChatAttachedAssistants } from "@/hooks/use-chat-attached-assistants"
import { useEntitlements } from "@/hooks/use-entitlements"
import { SAMPLE_AGENT_TEMPLATES } from "@/constants/sample-agent-templates"
import {
  attachTemplateToChat,
  clearChatAttachedTemplates,
  detachTemplateFromChat,
  gallerySampleToApiTemplate,
  listAttachedTemplateIds,
  resolveCustomizeAssistants,
} from "@/lib/chat-attached-assistants"
import {
  domainFocusBadgeClass,
  domainFocusForTemplate,
  outputFormatsForTemplate,
} from "@/lib/assistant-creator-meta"
import { assistantIconBg, iconForAssistant } from "@/lib/assistant-gallery-icons"
import { isGallerySampleTemplateId } from "@/lib/sample-agent-capability-defaults"
import {
  displayTemplateName,
  shortTemplateDescription,
  templateCardGrid,
} from "@/components/agent-templates/template-role-utils"
import { getErrorMessage } from "@/types/api"
import type { AgentTemplateApi, UpsertAgentTemplateBody } from "@/types/api"
import { cn } from "@/lib/utils"

export function EnabledAssistantsCustomize({
  creatorMode = false,
  onBrowseGallery,
}: {
  creatorMode?: boolean
  onBrowseGallery?: () => void
}) {
  const { data, isLoading, error, refetch, isFetching } = useAgentTemplates()
  const { attached } = useChatAttachedAssistants()
  const upsertMutation = useUpsertAgentTemplate()
  const deleteMutation = useDeleteAgentTemplate()
  const { can } = useEntitlements()
  const canManageTemplates = can("templates.manage")

  const [searchQuery, setSearchQuery] = useState("")
  const [disablingId, setDisablingId] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<"create" | "edit">("edit")
  const [editorInitial, setEditorInitial] = useState<AgentTemplateApi | null>(null)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<AgentTemplateApi | null>(null)
  const [deleteErr, setDeleteErr] = useState<string | null>(null)
  const [removeAllOpen, setRemoveAllOpen] = useState(false)
  const [removeAllBusy, setRemoveAllBusy] = useState(false)

  const attachedIds = useMemo(() => listAttachedTemplateIds(attached), [attached])

  const customizeRows = useMemo(
    () => resolveCustomizeAssistants(attachedIds, data?.templates),
    [attachedIds, data?.templates]
  )

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredRows = normalizedSearch
    ? customizeRows.filter(({ template }) => {
        const title = displayTemplateName(template.name || template.template_id || "").toLowerCase()
        const description = shortTemplateDescription(template.description)?.toLowerCase() ?? ""
        const id = String(template.template_id ?? "").toLowerCase()
        return title.includes(normalizedSearch) || description.includes(normalizedSearch) || id.includes(normalizedSearch)
      })
    : customizeRows

  const attachedCount = customizeRows.filter((row) => row.attached).length

  const setAssistantAttached = useCallback(async (templateId: string, attached: boolean) => {
    setDisablingId(templateId)
    try {
      if (attached) {
        attachTemplateToChat(templateId)
      } else {
        detachTemplateFromChat(templateId)
      }
    } finally {
      setDisablingId(null)
    }
  }, [])

  const confirmRemoveAll = useCallback(() => {
    setRemoveAllBusy(true)
    try {
      clearChatAttachedTemplates()
      setRemoveAllOpen(false)
    } finally {
      setRemoveAllBusy(false)
    }
  }, [])

  const openCreate = useCallback(() => {
    if (!canManageTemplates) {
      setShowUpgradePopup(true)
      return
    }
    upsertMutation.reset()
    setEditorMode("create")
    setEditorInitial(null)
    setEditorOpen(true)
  }, [canManageTemplates, upsertMutation])

  const openEdit = useCallback(
    (t: AgentTemplateApi) => {
      if (!canManageTemplates) {
        setShowUpgradePopup(true)
        return
      }
      upsertMutation.reset()
      const templateId = String(t.template_id ?? "").trim()
      const sample = SAMPLE_AGENT_TEMPLATES.find((s) => s.template_id === templateId)
      const initial =
        sample && isGallerySampleTemplateId(templateId)
          ? { ...gallerySampleToApiTemplate(sample), ...t, template_id: templateId }
          : t
      setEditorMode("edit")
      setEditorInitial(initial)
      setEditorOpen(true)
    },
    [canManageTemplates, upsertMutation]
  )

  const requestDelete = useCallback(
    (t: AgentTemplateApi) => {
      if (!canManageTemplates) {
        setShowUpgradePopup(true)
        return
      }
      if (isGallerySampleTemplateId(t.template_id)) return
      setDeleteErr(null)
      setPendingDelete(t)
      setDeleteOpen(true)
    },
    [canManageTemplates]
  )

  const confirmDelete = useCallback(() => {
    const id = String(pendingDelete?.template_id ?? "").trim()
    if (!id) return
    deleteMutation.mutate(id, {
      onSuccess: () => {
        detachTemplateFromChat(id)
        setDeleteOpen(false)
        setPendingDelete(null)
        setDeleteErr(null)
      },
      onError: (e) => setDeleteErr(getErrorMessage(e, "Delete failed")),
    })
  }, [pendingDelete, deleteMutation])

  const isEmpty = !isLoading && !error && customizeRows.length === 0

  const handleFormSubmit = useCallback(
    (body: UpsertAgentTemplateBody) => {
      upsertMutation.mutate(body, {
        onSuccess: async () => {
          if (editorMode === "create" && body.template_id) {
            attachTemplateToChat(body.template_id)
          }
          setEditorOpen(false)
          await refetch()
        },
      })
    },
    [editorMode, refetch, upsertMutation]
  )

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
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) {
            setPendingDelete(null)
            setDeleteErr(null)
          }
        }}
        title={
          pendingDelete
            ? `Delete "${pendingDelete.name || pendingDelete.template_id}"?`
            : "Delete assistant?"
        }
        description="This removes your custom prompt. Built-in gallery assistants can only be disabled, not deleted."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        pendingLabel="Deleting…"
        variant="destructive"
        isPending={deleteMutation.isPending}
        errorMessage={deleteErr}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={removeAllOpen}
        onOpenChange={setRemoveAllOpen}
        title="Remove all enabled assistants?"
        description={`This disables ${attachedCount} assistant${attachedCount === 1 ? "" : "s"} for chat. Your custom prompts are kept — re-enable anytime from the Custom gallery category or here.`}
        confirmLabel="Remove all"
        cancelLabel="Cancel"
        pendingLabel="Removing…"
        variant="destructive"
        isPending={removeAllBusy}
        onConfirm={confirmRemoveAll}
      />

      <AgentTemplateFormDialog
        open={editorOpen}
        onOpenChange={(open) => {
          if (!open) upsertMutation.reset()
          setEditorOpen(open)
        }}
        mode={editorMode}
        initial={editorInitial}
        isPending={upsertMutation.isPending}
        submitError={upsertMutation.isError ? upsertMutation.error : null}
        creatorMode={creatorMode}
        onSubmit={handleFormSubmit}
      />

      {!canManageTemplates ? <UpgradeCTA feature="templates.manage" /> : null}

      {!isEmpty ? (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search assistants..."
              className="h-10 border-border/70 bg-background/60"
              aria-label="Search assistants"
            />
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground tabular-nums">
            {filteredRows.length} shown
          </span>
          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 gap-1.5 border-border/70 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              disabled={attachedCount === 0 || removeAllBusy || Boolean(disablingId)}
              onClick={() => setRemoveAllOpen(true)}
            >
              {removeAllBusy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              )}
              Remove all
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-10 gap-1.5 border-amber/35 bg-amber text-amber-foreground hover:bg-amber/90"
              onClick={openCreate}
              disabled={isLoading || Boolean(error)}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              New custom assistant
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <>
          <ApiErrorCallout error={error} title="Could not load assistants" fallbackMessage="Could not load assistants" />
          <Button type="button" size="sm" variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? "Retrying…" : "Retry"}
          </Button>
        </>
      ) : null}

      {isLoading ? <p className="text-xs text-muted-foreground">Loading…</p> : null}

      {filteredRows.length > 0 ? (
        <div className={cn(templateCardGrid, "gap-5")}>
          {filteredRows.map(({ template, attached }) => {
          const templateId = String(template.template_id || "").trim()
          const builtIn = isGallerySampleTemplateId(templateId)
          const title = displayTemplateName(template.name || templateId)
          const desc = shortTemplateDescription(template.description)
          const domainFocus = domainFocusForTemplate(templateId, template.config)
          const outputFormats = outputFormatsForTemplate(templateId, template.config)
          const CardIcon = iconForAssistant(templateId, domainFocus)
          const cardIconBg = assistantIconBg(templateId, domainFocus)
          const busy = disablingId === templateId

          return (
            <Card
              key={templateId}
              variant="minimal"
              className="flex h-full min-h-[10.5rem] flex-col border-border/60 bg-card/30 p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    cardIconBg
                  )}
                >
                  <CardIcon className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.9375rem] font-semibold leading-snug line-clamp-2 normal-case">{title}</p>
                  {builtIn ? (
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Built-in
                    </p>
                  ) : (
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-amber">
                      Custom
                    </p>
                  )}
                </div>
              </div>

              {desc ? (
                <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
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
              </div>

              <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/40 pt-3">
                <div className="flex items-center gap-2">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden /> : null}
                  <Switch
                    checked={attached}
                    disabled={busy}
                    size="sm"
                    aria-label={attached ? `Disable ${title}` : `Enable ${title}`}
                    onCheckedChange={(checked) => {
                      void setAssistantAttached(templateId, checked)
                    }}
                  />
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground disabled:opacity-50"
                    aria-label={`Edit ${title}`}
                    onClick={() => openEdit(template)}
                    disabled={!canManageTemplates}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  {!builtIn ? (
                    <button
                      type="button"
                      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      aria-label={`Delete ${title}`}
                      onClick={() => requestDelete(template)}
                      disabled={!canManageTemplates}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            </Card>
          )
          })}
        </div>
      ) : null}

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/15 px-6 py-16 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-muted-foreground">
            <LayoutGrid className="h-5 w-5" aria-hidden />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">No assistants yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create a custom assistant here, or enable built-in ones from the Gallery. Disabled custom assistants stay in the Gallery under Custom.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {onBrowseGallery ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-amber/30 text-amber hover:bg-amber/10"
                onClick={onBrowseGallery}
              >
                <LayoutGrid className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Browse gallery
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              className="gap-1.5 border-amber/35 bg-amber text-amber-foreground hover:bg-amber/90"
              onClick={openCreate}
              disabled={isLoading || Boolean(error)}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              New custom assistant
            </Button>
          </div>
        </div>
      ) : null}

      {!isLoading && !error && customizeRows.length > 0 && filteredRows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 py-8 text-center">
          <p className="text-sm text-muted-foreground">No assistants match your search</p>
        </div>
      ) : null}
    </div>
  )
}
