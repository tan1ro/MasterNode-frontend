"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ROUTES } from "@/lib/routes"
import { authService } from "@/services/auth"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"

export function SuperuserUsersSummaryCard() {
  const enabled = useProtectedQueryEnabled()
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "users", "summary"],
    queryFn: () => authService.adminListUsers({ limit: 5, skip: 0 }),
    enabled,
  })

  const total = data?.total ?? data?.users?.length ?? 0
  const preview = data?.users?.slice(0, 3) ?? []

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-heading tracking-wide">
          <Users className="h-5 w-5 text-amber" aria-hidden />
          User administration
        </CardTitle>
        <CardDescription>Manage account types, plans, and workspace access</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p className="text-sm text-destructive">
            {error instanceof Error ? error.message : "Could not load users."}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading users…" : `${total} registered workspace ${total === 1 ? "user" : "users"}`}
          </p>
        )}
        {!isLoading && preview.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {preview.map((u) => (
              <li key={u.tenant_id} className="truncate text-foreground/90">
                {u.email || u.tenant_id}
                <span className="text-muted-foreground">
                  {" "}
                  · {u.account_type} / {u.plan}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <Link
          href={ROUTES.superuserUsers}
          className="inline-flex h-9 items-center justify-center rounded-md border border-border/50 bg-background px-3 text-sm font-medium hover:bg-muted/60"
        >
          Manage all users
        </Link>
      </CardContent>
    </Card>
  )
}
