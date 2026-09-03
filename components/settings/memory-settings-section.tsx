"use client"

import Link from "next/link"
import { BookOpen, Brain, History } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsToggleRow } from "@/components/settings/settings-pref-controls"
import { ROUTES } from "@/lib/routes"

interface MemorySettingsSectionProps {
  /** Gates Knowledge (RAG) attachment on chat streams and tasks. */
  memoryEnabled: boolean
  /** Gates keyword Memory OS (facts from past chats). */
  keywordMemoryEnabled: boolean
  onMemoryEnabledChange: (value: boolean) => void
  onKeywordMemoryEnabledChange: (value: boolean) => void
}

export function MemorySettingsSection({
  memoryEnabled,
  keywordMemoryEnabled,
  onMemoryEnabledChange,
  onKeywordMemoryEnabledChange,
}: MemorySettingsSectionProps) {
  return (
    <Card variant="minimal" interactive={false} id="memory" accent="violet">
      <CardHeader className="space-y-1 p-4 pb-2">
        <div className="flex items-start gap-2">
          <Brain className="h-5 w-5 shrink-0 text-violet-400 mt-0.5" />
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold leading-snug">Memory & knowledge</CardTitle>
            <CardDescription className="mt-1">
              Both memory types are on by default. Turn off either toggle to stop that source in new
              chats and tasks.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-3">
          <div className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 shrink-0 mt-0.5 text-violet-400" aria-hidden />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-foreground">Knowledge files</p>
              <p className="text-xs text-muted-foreground">
                Uploaded documents you enable on the Memory page. Retrieved and cited during chat and
                tasks.
              </p>
            </div>
          </div>

          <SettingsToggleRow
            id="memoryEnabled"
            checked={memoryEnabled}
            onChange={onMemoryEnabledChange}
            label="Use knowledge base"
            description="When on, enabled files may be used in responses. When off, files stay stored but are not retrieved unless you turn Memory on for a single run in chat."
          />

          <Link
            href={ROUTES.rag}
            className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Manage knowledge files
          </Link>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-3">
          <div className="flex items-start gap-2">
            <History className="h-4 w-4 shrink-0 mt-0.5 text-violet-400" aria-hidden />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-foreground">Chat memory</p>
              <p className="text-xs text-muted-foreground">
                Facts, preferences, and context learned from your previous conversations — used to
                personalize later replies.
              </p>
            </div>
          </div>

          <SettingsToggleRow
            id="keywordMemoryEnabled"
            checked={keywordMemoryEnabled}
            onChange={onKeywordMemoryEnabledChange}
            label="Remember from past chats"
            description="When on, MasterNode may recall prior topics and preferences. When off, each chat starts without that history-based personalization."
          />

          <Link
            href={ROUTES.memory}
            className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Open Memory page
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
