"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Bug } from "lucide-react"
import { useAppAuth } from "@/hooks/use-app-auth"
import { SuperuserAccessDenied } from "@/components/superuser/superuser-gate"
import { PageHeader } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { adminInboxService } from "@/services/admin-inbox"
import { ROUTES } from "@/lib/routes"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"

export default function SuperuserErrorsPage() {
  const { isSuperUser } = useAppAuth()
  const enabled = useProtectedQueryEnabled() && isSuperUser

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "bug-reports"],
    queryFn: () => adminInboxService.listBugReports({ limit: 200, skip: 0 }),
    enabled,
  })

  if (!isSuperUser) {
    return <SuperuserAccessDenied title="Reported errors" />
  }

  const reports = data?.reports ?? []

  return (
    <div className="container mx-auto space-y-6 p-4 sm:p-6 max-w-6xl">
      <PageHeader
        title="Reported errors"
        description="Bug reports submitted from the in-app help form across users and guests."
      />

      <div className="flex flex-wrap items-center gap-2">
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
            <Bug className="h-4 w-4 text-amber" />
            Bug report inbox
          </CardTitle>
          <CardDescription>
            {isLoading ? "Loading…" : `${data?.total ?? 0} reported ${data?.total === 1 ? "issue" : "issues"}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {error ? (
            <p className="text-sm text-destructive">Could not load bug reports.</p>
          ) : reports.length === 0 && !isLoading ? (
            <p className="text-sm text-muted-foreground">No bug reports yet.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">When</th>
                  <th className="py-2 pr-4 font-medium">Tenant</th>
                  <th className="py-2 pr-4 font-medium">Page</th>
                  <th className="py-2 font-medium">Message</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((row) => (
                  <tr key={String(row.id || `${row.ts}-${row.tenant_id}`)} className="border-b border-border/60 align-top">
                    <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                      {row.ts ? new Date(row.ts).toLocaleString() : "—"}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">{row.tenant_id || "—"}</td>
                    <td className="py-2 pr-4 max-w-[14rem] truncate text-xs">
                      {row.page_url || "—"}
                    </td>
                    <td className="py-2 max-w-xl whitespace-pre-wrap break-words">
                      {row.message?.trim() || "—"}
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
