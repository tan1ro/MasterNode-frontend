"use client"

import type { ReactNode } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { SETTINGS_SECTIONS } from "./settings-section-nav"
import { cn } from "@/lib/utils"
import { SettingsSaveStatus } from "./settings-save-status"
import type { PreferencesPersistStatus } from "./preferences-section"

interface SettingsPageLayoutProps {
  children: ReactNode
  persistStatus: PreferencesPersistStatus
  savedAt: Date | null
}

export function SettingsPageLayout({ children, persistStatus, savedAt }: SettingsPageLayoutProps) {
  return (
    <div className="min-h-[calc(100dvh-12rem)] border-t border-border/50 bg-muted/[0.12]">
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <PageHeader
          title="Settings"
          description="Configure defaults for LLM runs, chat, RAG, webhooks, and this browser. Most options save automatically; webhooks use Save on that section."
        />

        {(persistStatus !== "idle") && (
          <div className="mt-6 mb-8">
            <SettingsSaveStatus persistStatus={persistStatus} savedAt={savedAt} />
          </div>
        )}

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <aside className="lg:w-44 shrink-0">
            <nav className="flex flex-col gap-0.5" aria-label="Settings sections">
              {SETTINGS_SECTIONS.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-sm text-muted-foreground",
                    "hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>
          <div className="min-w-0 flex-1 space-y-10">{children}</div>
        </div>
      </div>
    </div>
  )
}
