"use client"

import { Archive, Download, Share2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Callout } from "@/components/ui/callout"
import {
  SettingsSectionCard,
} from "@/components/settings/settings-pref-controls"
import { ChatExportControls } from "@/components/settings/chat-export-controls"
export function ChatManagementSection() {
  return (
    <Card variant="minimal" interactive={false} id="chat-management" accent="amber" className="scroll-mt-24">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-amber-400" />
          <div>
            <CardTitle>Chat management</CardTitle>
            <CardDescription>Archive, export, share, and restore conversations.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <SettingsSectionCard
          icon={Archive}
          title="Archive conversations"
          description="Hide chats from Chats without deleting them."
          accent="amber"
        >
          <p className="text-sm text-muted-foreground">
            Click the <strong className="font-medium text-foreground">⋯</strong> menu on any chat in the
            sidebar → <strong className="font-medium text-foreground">Archive</strong>. Archived chats appear
            in the <strong className="font-medium text-foreground">Archived</strong> section below Chats.
          </p>
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={Download}
          title="Export conversation"
          description="Download full chat history as Markdown, plain text, JSON, or PDF."
          accent="amber"
        >
          <ChatExportControls />
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={Share2}
          title="Share conversation"
          description="Generate a read-only link for others."
          accent="amber"
        >
          <Callout type="info">
            Use <strong className="font-medium text-foreground">Share</strong> in the chat top bar or
            sidebar. Anyone with the link can open a read-only snapshot at{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[0.8em]">/share/…</code>. Ghost Mode
            chats cannot be shared.
          </Callout>
        </SettingsSectionCard>
      </CardContent>
    </Card>
  )
}
