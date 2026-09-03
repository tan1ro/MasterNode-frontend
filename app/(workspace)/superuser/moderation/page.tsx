"use client"

import { useCallback, useEffect, useState } from "react"
import { ShieldAlert } from "lucide-react"
import { useAppAuth } from "@/hooks/use-app-auth"
import { PageHeader } from "@/components/shared"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  adminModerationService,
  type ChatModerationReport,
  type FlaggedChatUser,
} from "@/services/admin-moderation"

export default function SuperuserModerationPage() {
  const { isSuperUser } = useAppAuth()
  const [reports, setReports] = useState<ChatModerationReport[]>([])
  const [flaggedUsers, setFlaggedUsers] = useState<FlaggedChatUser[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState("")
  const [pendingOnly, setPendingOnly] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [reportData, userData] = await Promise.all([
        adminModerationService.listReports({ limit: 200, pending_only: pendingOnly }),
        adminModerationService.listFlaggedUsers(200),
      ])
      setReports(reportData.reports || [])
      setFlaggedUsers(userData.users || [])
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Failed to load moderation data")
    } finally {
      setLoading(false)
    }
  }, [pendingOnly])

  useEffect(() => {
    if (isSuperUser) void load()
  }, [isSuperUser, load])

  const markReviewed = async (reportId: string) => {
    try {
      await adminModerationService.markReviewed(reportId, true)
      setFeedback(`Marked ${reportId} as reviewed.`)
      await load()
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : "Could not update report")
    }
  }

  if (!isSuperUser) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <PageHeader
          title="Chat moderation"
          description="Superuser access required."
        />
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
          Access denied.
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
      <PageHeader
        title="Chat moderation"
        description="Flagged users and reported chat policy violations (NSFW / abusive language)."
      />

      {feedback ? (
        <div className="mb-4 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber" />
              Flagged users
            </CardTitle>
            <CardDescription>Accounts with one or more blocked chat messages.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : flaggedUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No flagged users.</p>
            ) : (
              <ul className="space-y-2 max-h-[420px] overflow-y-auto">
                {flaggedUsers.map((u) => (
                  <li
                    key={u.tenant_id}
                    className="rounded-lg border border-border/50 bg-muted/15 px-3 py-2 text-sm"
                  >
                    <p className="font-medium truncate">{u.email || u.tenant_id}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{u.tenant_id}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Violations: {u.violation_count} · Last:{" "}
                      {u.last_moderation_at ? new Date(u.last_moderation_at).toLocaleString() : "—"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Individual incidents stored for compliance review.</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPendingOnly((v) => !v)}
            >
              {pendingOnly ? "Show all" : "Pending only"}
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : reports.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reports.</p>
            ) : (
              <ul className="space-y-3 max-h-[420px] overflow-y-auto">
                {reports.map((r) => (
                  <li
                    key={r.report_id}
                    className="rounded-lg border border-border/50 bg-background px-3 py-2 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-xs text-muted-foreground">{r.report_id}</p>
                        <p className="font-medium truncate">{r.email || r.tenant_id}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.categories.join(", ")} · {r.channel} ·{" "}
                          {new Date(r.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!r.reviewed ? (
                        <Button type="button" size="sm" variant="outline" onClick={() => void markReviewed(r.report_id)}>
                          Reviewed
                        </Button>
                      ) : (
                        <span className="text-[10px] uppercase text-muted-foreground shrink-0">Reviewed</span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-3">{r.content_preview}</p>
                    <p className="mt-1 text-[10px] font-mono text-muted-foreground truncate">
                      chat: {r.conversation_id}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
