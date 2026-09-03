"use client"

import { useMemo, useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { useConversations } from "@/hooks/use-conversations"
import { useAppAuth } from "@/hooks/use-app-auth"
import { chatService } from "@/services/chat"
import {
  EXPORT_FORMAT_META,
  runChatExport,
  type ChatExportFormat,
  type ConversationExport,
} from "@/lib/chat-export"
import type { ChatConversation } from "@/types/api"

const ALL_VALUE = "__all__"

export function ChatExportControls() {
  const { isSignedIn } = useAppAuth()
  const { conversations, archivedConversations, isLoading } = useConversations()

  const allConversations = useMemo<ChatConversation[]>(() => {
    const seen = new Set<string>()
    const merged: ChatConversation[] = []
    for (const c of [...conversations, ...archivedConversations]) {
      if (seen.has(c.conversation_id)) continue
      seen.add(c.conversation_id)
      merged.push(c)
    }
    return merged.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""))
  }, [conversations, archivedConversations])

  const [selection, setSelection] = useState<string>(ALL_VALUE)
  const [format, setFormat] = useState<ChatExportFormat>("markdown")
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null)

  if (!isSignedIn) {
    return (
      <p className="text-sm text-muted-foreground">
        Sign in to export your cloud-synced conversation history.
      </p>
    )
  }

  const hasConversations = allConversations.length > 0

  const handleExport = async () => {
    setBusy(true)
    setStatus(null)
    try {
      const targets =
        selection === ALL_VALUE
          ? allConversations
          : allConversations.filter((c) => c.conversation_id === selection)

      if (targets.length === 0) {
        setStatus({ ok: false, message: "No conversation selected." })
        return
      }

      const entries: ConversationExport[] = []
      let failedLoads = 0
      for (const conversation of targets) {
        try {
          const detail = await chatService.getConversation(conversation.conversation_id)
          entries.push({
            conversation: detail.conversation ?? conversation,
            messages: detail.messages ?? [],
          })
        } catch {
          failedLoads += 1
        }
      }

      if (entries.length === 0) {
        setStatus({ ok: false, message: "Could not load any conversations to export." })
        return
      }

      const result = runChatExport(entries, format)
      if (failedLoads > 0) {
        setStatus({
          ok: result.ok,
          message: `${result.message} (${failedLoads} conversation${failedLoads === 1 ? "" : "s"} failed to load.)`,
        })
      } else {
        setStatus(result)
      }
    } catch {
      setStatus({ ok: false, message: "Export failed. Please try again." })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Conversation</span>
          <Select
            value={selection}
            onChange={(e) => setSelection(e.target.value)}
            disabled={isLoading || !hasConversations}
            className="w-full"
          >
            <option value={ALL_VALUE}>
              All conversations{hasConversations ? ` (${allConversations.length})` : ""}
            </option>
            {allConversations.map((c) => (
              <option key={c.conversation_id} value={c.conversation_id}>
                {c.title || "Untitled conversation"}
                {c.archived ? " · archived" : ""}
              </option>
            ))}
          </Select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Format</span>
          <Select
            value={format}
            onChange={(e) => setFormat(e.target.value as ChatExportFormat)}
            className="w-full"
          >
            {(Object.keys(EXPORT_FORMAT_META) as ChatExportFormat[]).map((key) => (
              <option key={key} value={key}>
                {EXPORT_FORMAT_META[key].label}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={busy || isLoading || !hasConversations}
        >
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Download className="mr-2 h-4 w-4" aria-hidden />
          )}
          {busy ? "Exporting…" : "Export"}
        </Button>
        {!hasConversations && !isLoading ? (
          <span className="text-xs text-muted-foreground">No conversations yet.</span>
        ) : null}
        {status ? (
          <span
            className={status.ok ? "text-xs text-emerald-500" : "text-xs text-rose-400"}
            role="status"
          >
            {status.message}
          </span>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Exports include message text, roles, timestamps, attachments, and cited web sources. PDF
        opens your browser&apos;s print dialog — choose “Save as PDF”.
      </p>
    </div>
  )
}
