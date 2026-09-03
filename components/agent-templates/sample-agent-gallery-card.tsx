"use client"

import { useState } from "react"
import { Info, Loader2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { AssistantGalleryMeta } from "@/lib/assistant-gallery-meta"
import { AssistantDetailDialog } from "@/components/agent-templates/assistant-detail-dialog"
import { outputFormatLabel } from "@/constants/assistant-output-formats"
import {
  domainFocusBadgeClass,
  outputFormatBadgeClass,
} from "@/lib/assistant-creator-meta"
import {
  assistantIconBg,
  iconForAssistant,
  iconForOutputFormat,
} from "@/lib/assistant-gallery-icons"
import {
  pipelineRoleColors,
  pipelineRoleIconBg,
  templateCardDesc,
  templateCardIconSize,
  templateCardTitle,
} from "@/components/agent-templates/template-role-utils"

interface SampleAgentGalleryCardProps {
  title: string
  description: string | null
  role: string
  roleIcon: LucideIcon
  showRoleBadge?: boolean
  enabled: boolean
  busy?: boolean
  disabled?: boolean
  onEnabledChange: (enabled: boolean) => void
  /** Compact gallery tile — icon, title, blurb, toggle only (Assistants gallery). */
  variant?: "default" | "compact"
  /** Rich metadata for gallery detail dialog. */
  galleryMeta?: AssistantGalleryMeta | null
}

export function AssistantFormatPill({ fmt }: { fmt: string }) {
  const Icon = iconForOutputFormat(fmt)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[10px] font-medium",
        outputFormatBadgeClass(fmt)
      )}
    >
      <Icon className="h-2.5 w-2.5 shrink-0 opacity-80" aria-hidden />
      {outputFormatLabel(fmt)}
    </span>
  )
}

export function SampleAgentGalleryCard({
  title,
  description,
  role,
  roleIcon: RoleIcon,
  showRoleBadge = false,
  enabled,
  busy,
  disabled,
  onEnabledChange,
  variant = "default",
  galleryMeta,
}: SampleAgentGalleryCardProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const switchId = `assistant-chat-${title.replace(/\s+/g, "-").toLowerCase()}`
  const isCompact = variant === "compact"
  const summary = galleryMeta?.summary ?? description
  const creatorMode = !showRoleBadge

  const CardIcon =
    creatorMode && galleryMeta
      ? iconForAssistant(galleryMeta.templateId, galleryMeta.domainFocus)
      : RoleIcon

  const cardIconBg =
    creatorMode && galleryMeta
      ? assistantIconBg(galleryMeta.templateId, galleryMeta.domainFocus)
      : pipelineRoleIconBg[role] ?? pipelineRoleIconBg.Custom

  if (isCompact) {
    return (
      <>
        <Card
          variant="minimal"
          interactive={false}
          className={cn(
            "flex h-full min-h-[10.5rem] flex-col p-4 transition-[border-color,background-color] duration-200",
            enabled
              ? "border-amber/30 bg-amber/[0.04]"
              : "border-border/60 bg-card/30 hover:border-border hover:bg-muted/15"
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
            {galleryMeta ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 shrink-0 p-0 text-muted-foreground hover:text-foreground"
                aria-label={`More about ${title}`}
                onClick={() => setDetailOpen(true)}
              >
                <Info className="h-4 w-4" />
              </Button>
            ) : null}
          </div>

          {summary ? (
            <p
              className={cn(
                templateCardDesc,
                "mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed"
              )}
            >
              {summary}
            </p>
          ) : (
            <div className="mt-2 min-h-[2.5rem]" />
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {showRoleBadge ? (
              <span
                className={cn(
                  "inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-medium",
                  pipelineRoleColors[role] ?? pipelineRoleColors.Custom
                )}
              >
                {role}
              </span>
            ) : galleryMeta ? (
              <>
                <span
                  className={cn(
                    "inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-medium",
                    domainFocusBadgeClass(galleryMeta.domainFocus)
                  )}
                >
                  {galleryMeta.domainFocus}
                </span>
                {galleryMeta.outputFormats.slice(0, 3).map((fmt) => (
                  <AssistantFormatPill key={fmt} fmt={fmt} />
                ))}
                {galleryMeta.outputFormats.length > 3 ? (
                  <span className="text-[10px] text-muted-foreground">
                    +{galleryMeta.outputFormats.length - 3}
                  </span>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="mt-auto flex items-center justify-end gap-3 border-t border-border/40 pt-3">
            <div className="flex shrink-0 items-center gap-2">
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
              ) : null}
              <Switch
                id={switchId}
                checked={enabled}
                disabled={disabled || busy}
                size="sm"
                aria-label={`${enabled ? "Disable" : "Enable"} ${title}`}
                onCheckedChange={onEnabledChange}
              />
            </div>
          </div>
        </Card>

        <AssistantDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          meta={galleryMeta ?? null}
          creatorMode
        />
      </>
    )
  }

  return (
    <Card
      variant="minimal"
      interactive={false}
      className={cn(
        "relative flex h-full flex-col overflow-hidden p-0 transition-[border-color,box-shadow,background-color] duration-200",
        enabled
          ? "border-amber/35 bg-gradient-to-br from-amber/[0.07] via-background to-background shadow-[0_0_0_1px_rgba(244,164,41,0.08)]"
          : "border-border/60 bg-card/40 hover:border-border hover:bg-muted/20"
      )}
    >
      {enabled ? (
        <span
          className="pointer-events-none absolute inset-y-3 left-0 w-0.5 rounded-r-full bg-amber/70"
          aria-hidden
        />
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-5 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-border/40",
              cardIconBg
            )}
          >
            <CardIcon className={templateCardIconSize} aria-hidden />
          </div>

          <div className="min-w-0 flex-1">
            <p className={cn(templateCardTitle, "text-[0.9375rem] font-semibold")}>{title}</p>
          </div>
        </div>

        {description ? (
          <p className={cn(templateCardDesc, "min-h-[2.75rem] text-[0.8125rem] leading-relaxed")}>
            {description}
          </p>
        ) : (
          <div className="min-h-[2.75rem]" />
        )}
      </div>

      <div
        className={cn(
          "mt-auto flex items-center justify-end gap-2 border-t px-5 py-3.5",
          enabled ? "border-amber/20 bg-amber/[0.04]" : "border-border/50 bg-muted/15"
        )}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />
        ) : null}
        <Switch
          id={switchId}
          checked={enabled}
          disabled={disabled || busy}
          size="sm"
          aria-label={`${enabled ? "Disable" : "Enable"} ${title}`}
          onCheckedChange={onEnabledChange}
        />
      </div>
    </Card>
  )
}
