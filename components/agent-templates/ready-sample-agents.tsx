"use client"

import { useState, useCallback, useMemo } from "react"
import { Loader2, MessageSquare, Search, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SampleAgentGalleryCard } from "@/components/agent-templates/sample-agent-gallery-card"
import { cn } from "@/lib/utils"
import { useAgentTemplates, useUpsertAgentTemplate } from "@/hooks"
import {
  SAMPLE_AGENT_TEMPLATES,
  type SampleAgentCategory,
  type SampleAgentTemplate,
} from "@/constants/sample-agent-templates"
import {
  ASSISTANT_GALLERY_CATEGORY_LABELS,
} from "@/constants/assistant-gallery-network"
import { defaultSampleCategoryForRole } from "@/constants/business-packs"
import {
  isGalleryCategoryComingSoon,
  isGalleryCategoryVisible,
  resolveGalleryCategory,
} from "@/constants/gallery-visibility"
import { ComingSoonBadge } from "@/components/settings/settings-pref-controls"
import { useAppAuth } from "@/hooks/use-app-auth"
import { ApiErrorCallout } from "@/components/shared/api-error-callout"
import { UpgradePopup } from "@/components/shared/feature-gate"
import { useEntitlements } from "@/hooks/use-entitlements"
import { useChatAttachedAssistants } from "@/hooks/use-chat-attached-assistants"
import {
  attachTemplateToChat,
  customAgentGalleryBlurb,
  detachTemplateFromChat,
  listUserCustomAgentTemplates,
} from "@/lib/chat-attached-assistants"
import type { AgentTemplateApi } from "@/types/api"
import {
  categoryAccentActive,
  displayTemplateName,
  shortTemplateDescription,
  templateCardGrid,
} from "@/components/agent-templates/template-role-utils"
import { assistantIconBg, iconForAssistant } from "@/lib/assistant-gallery-icons"
import { getAssistantGalleryMeta } from "@/lib/assistant-gallery-meta"
import {
  domainFocusForSample,
  domainFocusForTemplate,
  outputFormatsForSample,
} from "@/lib/assistant-creator-meta"

const CATEGORY_LABELS = ASSISTANT_GALLERY_CATEGORY_LABELS

const CATEGORY_ORDER: SampleAgentCategory[] = [
  "general",
  "sales_marketing",
  "academics",
  "legal",
  "compliance",
  "codebase",
  "sdlc",
  "custom",
]

function categoriesWithSamples(): SampleAgentCategory[] {
  const seen = new Set<SampleAgentCategory>()
  for (const s of SAMPLE_AGENT_TEMPLATES) {
    const cat = resolveGalleryCategory(s.category, domainFocusForSample(s))
    if (!isGalleryCategoryVisible(cat)) continue
    if (isGalleryCategoryComingSoon(cat)) continue
    seen.add(cat)
  }
  const fromSamples = CATEGORY_ORDER.filter(
    (cat) => cat !== "custom" && seen.has(cat) && isGalleryCategoryVisible(cat)
  )
  const comingSoon = CATEGORY_ORDER.filter(
    (cat) => isGalleryCategoryComingSoon(cat) && isGalleryCategoryVisible(cat)
  )
  return [...fromSamples, ...comingSoon, "custom"]
}

export function ReadySampleAgents({
  compact,
  variant = "default",
}: {
  compact?: boolean
  variant?: "default" | "gallery"
}) {
  const isGallery = variant === "gallery" || compact
  const { accountType } = useAppAuth()
  const { data, isLoading } = useAgentTemplates()
  const upsert = useUpsertAgentTemplate()
  const [category, setCategory] = useState<SampleAgentCategory>(() =>
    defaultSampleCategoryForRole(accountType)
  )
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [bulkAction, setBulkAction] = useState<"enable" | "disable" | null>(null)
  const bulkBusy = bulkAction !== null
  const { isAttached } = useChatAttachedAssistants()
  const [err, setErr] = useState<unknown>(null)
  const [showUpgradePopup, setShowUpgradePopup] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { can } = useEntitlements()
  const canManageTemplates = can("templates.manage")

  const categoryOptions = useMemo(() => categoriesWithSamples(), [])

  const userCustomTemplates = useMemo(
    () => listUserCustomAgentTemplates(data?.templates),
    [data?.templates]
  )

  const isCustomCategory = category === "custom"

  const isComingSoonCategory = isGalleryCategoryComingSoon(category)

  const categorySamples = useMemo(
    () =>
      isCustomCategory || isComingSoonCategory
        ? []
        : SAMPLE_AGENT_TEMPLATES.filter(
            (sample) =>
              resolveGalleryCategory(sample.category, domainFocusForSample(sample)) === category
          ),
    [category, isComingSoonCategory, isCustomCategory]
  )

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredSamples = useMemo(() => {
    if (!normalizedSearch) return categorySamples
    return categorySamples.filter((sample) => {
      const title = displayTemplateName(sample.name).toLowerCase()
      const description = shortTemplateDescription(sample.description)?.toLowerCase() ?? ""
      const id = sample.template_id.toLowerCase()
      return title.includes(normalizedSearch) || description.includes(normalizedSearch) || id.includes(normalizedSearch)
    })
  }, [categorySamples, normalizedSearch])

  const filteredCustomTemplates = useMemo(() => {
    if (!isCustomCategory) return []
    if (!normalizedSearch) return userCustomTemplates
    return userCustomTemplates.filter((template) => {
      const title = displayTemplateName(template.name || template.template_id || "").toLowerCase()
      const description = customAgentGalleryBlurb(template)?.toLowerCase() ?? ""
      const id = String(template.template_id ?? "").toLowerCase()
      return title.includes(normalizedSearch) || description.includes(normalizedSearch) || id.includes(normalizedSearch)
    })
  }, [isCustomCategory, normalizedSearch, userCustomTemplates])

  const visibleCount = isCustomCategory ? filteredCustomTemplates.length : filteredSamples.length

  const existingIds = useMemo(() => {
    const set = new Set<string>()
    for (const t of data?.templates ?? []) {
      const id = String(t.template_id ?? "").trim()
      if (id) set.add(id)
    }
    return set
  }, [data?.templates])

  const enabledInCategoryCount = useMemo(() => {
    if (isCustomCategory) {
      return userCustomTemplates.filter((template) => isAttached(template.template_id)).length
    }
    return categorySamples.filter((sample) => isAttached(sample.template_id)).length
  }, [categorySamples, isAttached, isCustomCategory, userCustomTemplates])

  const categoryTotalCount = isCustomCategory ? userCustomTemplates.length : categorySamples.length

  const ensureTemplateInstalled = useCallback(
    async (body: SampleAgentTemplate) => {
      if (existingIds.has(body.template_id)) return
      const { category: _category, ...payload } = body
      const baseConfig =
        payload.config && typeof payload.config === "object" ? { ...payload.config } : {}
      await upsert.mutateAsync({
        ...payload,
        config: {
          ...baseConfig,
          domain_focus: baseConfig.domain_focus ?? domainFocusForSample(body),
          export_formats: baseConfig.export_formats ?? outputFormatsForSample(body),
        },
      })
    },
    [existingIds, upsert]
  )

  const setCustomAgentEnabled = useCallback((template: AgentTemplateApi, enabled: boolean) => {
    setErr(null)
    setTogglingId(template.template_id)
    try {
      if (enabled) attachTemplateToChat(template.template_id)
      else detachTemplateFromChat(template.template_id)
    } catch (e) {
      setErr(e)
    } finally {
      setTogglingId(null)
    }
  }, [])

  const setSampleEnabled = useCallback(
    async (body: SampleAgentTemplate, enabled: boolean) => {
      setErr(null)
      setTogglingId(body.template_id)
      try {
        if (enabled) {
          const installed = existingIds.has(body.template_id)
          if (!installed && !canManageTemplates) {
            setShowUpgradePopup(true)
            return
          }
          if (!installed) {
            await ensureTemplateInstalled(body)
          }
          attachTemplateToChat(body.template_id)
        } else {
          detachTemplateFromChat(body.template_id)
        }
      } catch (e) {
        setErr(e)
      } finally {
        setTogglingId(null)
      }
    },
    [canManageTemplates, ensureTemplateInstalled, existingIds]
  )

  const enableAllInCategory = useCallback(async () => {
    if (isCustomCategory) {
      setErr(null)
      setBulkAction("enable")
      try {
        for (const template of userCustomTemplates) {
          attachTemplateToChat(template.template_id)
        }
      } catch (e) {
        setErr(e)
      } finally {
        setBulkAction(null)
      }
      return
    }
    if (!canManageTemplates) {
      setShowUpgradePopup(true)
      return
    }
    setErr(null)
    setBulkAction("enable")
    try {
      for (const body of categorySamples) {
        await ensureTemplateInstalled(body)
        attachTemplateToChat(body.template_id)
      }
    } catch (e) {
      setErr(e)
    } finally {
      setBulkAction(null)
    }
  }, [canManageTemplates, categorySamples, ensureTemplateInstalled, isCustomCategory, userCustomTemplates])

  const disableAllInCategory = useCallback(() => {
    setErr(null)
    setBulkAction("disable")
    try {
      if (isCustomCategory) {
        for (const template of userCustomTemplates) {
          detachTemplateFromChat(template.template_id)
        }
        return
      }
      for (const body of categorySamples) {
        detachTemplateFromChat(body.template_id)
      }
    } catch (e) {
      setErr(e)
    } finally {
      setBulkAction(null)
    }
  }, [categorySamples, isCustomCategory, userCustomTemplates])

  const categoryLabel = CATEGORY_LABELS[category] ?? "templates"

  return (
    <section className={isGallery ? "space-y-5" : "mb-10 space-y-5"}>
      <UpgradePopup
        open={showUpgradePopup}
        onOpenChange={setShowUpgradePopup}
        feature="templates.manage"
        title="Upgrade required to manage templates"
      />

      {!isGallery ? (
        <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3.5 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-amber/25 bg-amber/10 text-amber">
                <MessageSquare className="h-4 w-4" aria-hidden />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-foreground">Chat assistants</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Turn on one or more assistants — they appear as chips above the chat composer.
                  Disable anytime in Customize or with{" "}
                  <span className="font-medium text-foreground/80">×</span> in chat.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start sm:pt-0.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-xs text-muted-foreground tabular-nums">
                <Sparkles className="h-3 w-3 text-amber" aria-hidden />
                {enabledInCategoryCount} of {categoryTotalCount} active
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1 lg:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={`Search ${categoryLabel}...`}
              className="h-10 border-border/70 bg-background/60 pl-9"
              aria-label="Search templates in selected category"
            />
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground tabular-nums">
            <Sparkles className="h-3.5 w-3.5 text-amber" aria-hidden />
            {enabledInCategoryCount} of {categoryTotalCount} active
          </span>
          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 border-border/70 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              disabled={
                isComingSoonCategory ||
                bulkBusy ||
                isLoading ||
                categoryTotalCount === 0 ||
                enabledInCategoryCount === 0
              }
              onClick={() => disableAllInCategory()}
            >
              {bulkAction === "disable" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Disabling…
                </>
              ) : (
                "Disable all in category"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 border-amber/35 text-amber hover:bg-amber/10"
              disabled={
                isComingSoonCategory ||
                bulkBusy ||
                upsert.isPending ||
                isLoading ||
                categoryTotalCount === 0 ||
                enabledInCategoryCount === categoryTotalCount
              }
              onClick={() => void enableAllInCategory()}
            >
              {bulkAction === "enable" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Enabling…
                </>
              ) : (
                "Enable all in category"
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categories">
          {categoryOptions.map((cat) => {
            const active = category === cat
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? categoryAccentActive[cat] ?? "border-amber/40 bg-amber/10 text-amber"
                    : "border-border/70 bg-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            )
          })}
        </div>
      </div>

      {err ? (
        <ApiErrorCallout error={err} title="Could not add template" fallbackMessage="Could not add template" />
      ) : null}

      <div className={cn(templateCardGrid, "gap-5")}>
        {isCustomCategory
          ? filteredCustomTemplates.map((template) => {
              const templateId = String(template.template_id || "").trim()
              const enabled = isAttached(templateId)
              const busy = togglingId === templateId || bulkBusy
              const domainFocus = domainFocusForTemplate(templateId, template.config)
              const RoleIcon = iconForAssistant(templateId, domainFocus)
              const title = displayTemplateName(template.name || templateId)
              const blurb = customAgentGalleryBlurb(template)

              return (
                <SampleAgentGalleryCard
                  key={templateId}
                  title={title}
                  description={blurb}
                  role="Custom"
                  roleIcon={RoleIcon}
                  showRoleBadge
                  variant={isGallery ? "compact" : "default"}
                  enabled={enabled}
                  busy={busy}
                  disabled={isLoading}
                  onEnabledChange={(checked) => setCustomAgentEnabled(template, checked)}
                />
              )
            })
          : filteredSamples.map((sample) => {
          const enabled = isAttached(sample.template_id)
          const busy = togglingId === sample.template_id || bulkBusy
          const domainFocus = domainFocusForSample(sample)
          const role = domainFocus
          const RoleIcon = iconForAssistant(sample.template_id, domainFocus)
          const title = displayTemplateName(sample.name)
          const galleryMeta = isGallery ? getAssistantGalleryMeta(sample) : null
          const blurb = isGallery
            ? galleryMeta?.summary ?? shortTemplateDescription(sample.description)
            : compact
              ? null
              : shortTemplateDescription(sample.description)

          return (
            <SampleAgentGalleryCard
              key={sample.template_id}
              title={title}
              description={blurb}
              role={role}
              roleIcon={RoleIcon}
              showRoleBadge={false}
              variant={isGallery ? "compact" : "default"}
              galleryMeta={galleryMeta}
              enabled={enabled}
              busy={busy}
              disabled={upsert.isPending || isLoading}
              onEnabledChange={(checked) => void setSampleEnabled(sample, checked)}
            />
          )
        })}
      </div>
      {!isLoading && visibleCount === 0 ? (
        <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 py-8 text-center">
          {isComingSoonCategory ? (
            <div className="mx-auto flex max-w-sm flex-col items-center gap-2 px-4">
              <ComingSoonBadge />
              <p className="text-sm font-medium text-foreground">
                {CATEGORY_LABELS[category] ?? "This category"} is coming soon
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Assistants for this domain are in progress and will appear here when ready.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isCustomCategory
                ? normalizedSearch
                  ? "No custom assistants match your search."
                  : "No custom assistants yet. Create one in Customize — it will stay here even when disabled."
                : `No templates match this search in ${CATEGORY_LABELS[category] ?? "this category"}.`}
            </p>
          )}
        </div>
      ) : null}
    </section>
  )
}
