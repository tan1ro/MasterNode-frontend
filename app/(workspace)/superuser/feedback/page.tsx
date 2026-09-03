"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { MessagesSquare } from "lucide-react"
import { useAppAuth } from "@/hooks/use-app-auth"
import { SuperuserAccessDenied } from "@/components/superuser/superuser-gate"
import { PageHeader } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  adminInboxService,
  type AdminFeedbackTypeFilter,
} from "@/services/admin-inbox"
import { ROUTES } from "@/lib/routes"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"

const FILTERS: Array<{ id: "all" | AdminFeedbackTypeFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "negative", label: "Negative" },
  { id: "report", label: "Reports" },
  { id: "positive", label: "Positive" },
]

export default function SuperuserFeedbackPage() {
  const { isSuperUser } = useAppAuth()
  const enabled = useProtectedQueryEnabled() && isSuperUser
  const [filter, setFilter] = useState<"all" | AdminFeedbackTypeFilter>("all")

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "feedback", filter],
    queryFn: () =>
      adminInboxService.listFeedback({
        limit: 200,
        skip: 0,
        feedback_type: filter === "all" ? undefined : filter,
      }),
    enabled,
  })

  if (!isSuperUser) {
    return <SuperuserAccessDenied title="User feedback" />
  }

  const rows = data?.feedback ?? []

  return (
    <div className="container mx-auto space-y-6 p-4 sm:p-6 max-w-6xl">
      <PageHeader
        title="User feedback"
        description="Thumbs, reports, and comments from chat responses across tenants."
      />

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={filter === item.id ? "default" : "outline"}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </Button>
        ))}
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          Refresh
        </Button>
        <Link
          href={ROUTES.superuserTasks}
          className="ml-auto inline-flex h-9 items-center rounded-md px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Back to hub
        </Link>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessagesSquare className="h-4 w-4 text-amber" />
            Feedback inbox
          </CardTitle>
          <CardDescription>
            {isLoading ? "Loading…" : `${data?.total ?? 0} matching ${data?.total === 1 ? "item" : "items"}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {error ? (
            <p className="text-sm text-destructive">Could not load feedback.</p>
          ) : rows.length === 0 && !isLoading ? (
            <p className="text-sm text-muted-foreground">No feedback yet.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">User</th>
                  <th className="py-2 pr-4 font-medium">Reasons</th>
                  <th className="py-2 pr-4 font-medium">Comment</th>
                  <th className="py-2 pr-4 font-medium">Model</th>
                  <th className="py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={String(row.id || `${row.message_id}-${row.created_at}`)} className="border-b border-border/60 align-top">
                    <td className="py-2 pr-4 font-medium capitalize">{row.feedback_type || "—"}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{row.user_id || "—"}</td>
                    <td className="py-2 pr-4">
                      {Array.isArray(row.reasons) && row.reasons.length
                        ? row.reasons.join(", ")
                        : "—"}
                    </td>
                    <td className="py-2 pr-4 max-w-xs whitespace-pre-wrap break-words">
                      {row.comment?.trim() || "—"}
                    </td>
                    <td className="py-2 pr-4">{row.model || "—"}</td>
                    <td className="py-2 text-xs text-muted-foreground">
                      {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
