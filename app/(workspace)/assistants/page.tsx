"use client"

import { useState } from "react"
import { LayoutGrid, Library } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import {
  BusinessPackInstaller,
  EnabledAssistantsCustomize,
  ReadySampleAgents,
} from "@/components/agent-templates"
import { useChatAttachedAssistants } from "@/hooks/use-chat-attached-assistants"
import { UpgradeCTA } from "@/components/shared/feature-gate"
import { useAppAuth } from "@/hooks/use-app-auth"
import { useEntitlements } from "@/hooks/use-entitlements"
import { isBusinessAccountType } from "@/lib/account-types"
import { workspacePageClass } from "@/constants/chat-layout"
import { cn } from "@/lib/utils"

type AssistantsTab = "gallery" | "workspace"

const TABS: {
  id: AssistantsTab
  label: string
  icon: typeof LayoutGrid
}[] = [
  { id: "gallery", label: "Gallery", icon: LayoutGrid },
  { id: "workspace", label: "Customize", icon: Library },
]

export default function AssistantsPage() {
  const { accountType } = useAppAuth()
  const isBusiness = isBusinessAccountType(accountType)
  const { can } = useEntitlements()
  const canManageTemplates = can("templates.manage")
  const { attachedCount } = useChatAttachedAssistants()
  const [tab, setTab] = useState<AssistantsTab>("gallery")

  return (
    <div className={workspacePageClass()}>
      <PageHeader
        title="Assistants"
        description={
          isBusiness
            ? "Attach specialists for chat and tasks, or assign pipeline roles for multi-step runs."
            : "Attach domain experts to shape chat answers — and export to PPTX, PDF, DOCX, or HTML when you need a deliverable."
        }
        className="mb-5 sm:mb-6"
      />

      <div
        className="mb-6 -mx-3 flex gap-1 overflow-x-auto border-b border-border/80 px-3 scrollbar-thin sm:mx-0 sm:gap-2 sm:px-0"
        role="tablist"
        aria-label="Assistants sections"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium -mb-px transition-colors",
                active
                  ? id === "gallery" || (!isBusiness && id === "workspace")
                    ? "border-amber text-amber"
                    : "border-violet text-violet"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "opacity-100" : "opacity-70"
                )}
                aria-hidden
              />
              {label}
              {id === "workspace" && attachedCount > 0 ? (
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
                    isBusiness ? "bg-violet/20 text-violet" : "bg-amber/20 text-amber"
                  )}
                >
                  {attachedCount}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {tab === "gallery" ? (
        <div className="space-y-8">
          {!canManageTemplates ? <UpgradeCTA feature="templates.manage" /> : null}
          {isBusiness ? <BusinessPackInstaller compact /> : null}
          <ReadySampleAgents variant="gallery" />
        </div>
      ) : (
        <EnabledAssistantsCustomize
          creatorMode={!isBusiness}
          onBrowseGallery={() => setTab("gallery")}
        />
      )}
    </div>
  )
}
