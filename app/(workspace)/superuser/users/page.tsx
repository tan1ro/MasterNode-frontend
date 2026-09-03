"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ShieldCheck, UserPlus } from "lucide-react"
import { useAppAuth } from "@/hooks/use-app-auth"
import { PageHeader } from "@/components/shared"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CreateUserDialog } from "@/components/superuser/create-user-dialog"
import { UserAccessTable } from "@/components/superuser/user-access-table"
import { authService } from "@/services/auth"
import { useProtectedQueryEnabled } from "@/providers/auth-session-provider"

const PAGE_SIZE = 50

export default function SuperuserUsersPage() {
  const { isSuperUser } = useAppAuth()
  const queryEnabled = useProtectedQueryEnabled() && isSuperUser
  const [search, setSearch] = useState("")
  const [appliedQuery, setAppliedQuery] = useState("")
  const [page, setPage] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "users", appliedQuery, page],
    queryFn: () =>
      authService.adminListUsers({
        limit: PAGE_SIZE,
        skip: page * PAGE_SIZE,
        q: appliedQuery || undefined,
      }),
    enabled: queryEnabled,
  })

  if (!isSuperUser) {
    return (
      <div className="container mx-auto p-4 sm:p-6">
        <PageHeader
          title="User administration"
          description="This page is available only to the superuser account."
        />
        <div className="rounded-xl border border-border/60 bg-muted/20 p-5 text-sm text-muted-foreground">
          Access denied. Sign in as superuser to manage users.
        </div>
      </div>
    )
  }

  const total = data?.total ?? 0
  const users = data?.users ?? []
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-5xl">
      <PageHeader
        title="User administration"
        description="Create users with passwords, assign roles and plans, and remove workspace accounts."
      />

      <div className="mb-6 rounded-xl border border-amber/40 bg-amber/10 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-amber" />
          <div>
            <p className="text-sm font-semibold text-foreground">Superuser mode active</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Changes apply immediately in MongoDB and tenant profiles. New passwords are shown once
              after create.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>All users</CardTitle>
            <CardDescription>
              {isLoading ? "Loading…" : `${total} registered ${total === 1 ? "user" : "users"}`}
            </CardDescription>
          </div>
          <Button type="button" onClick={() => setCreateOpen(true)} className="shrink-0">
            <UserPlus className="mr-1.5 h-4 w-4" />
            Create user
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              setAppliedQuery(search.trim())
              setPage(0)
            }}
          >
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by email…"
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
            {appliedQuery ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearch("")
                  setAppliedQuery("")
                  setPage(0)
                }}
              >
                Clear
              </Button>
            ) : null}
          </form>

          {error ? (
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : "Could not load users."}
            </p>
          ) : isLoading ? (
            <p className="text-sm text-muted-foreground">Loading users…</p>
          ) : (
            <UserAccessTable users={users} onChanged={() => void refetch()} />
          )}

          {total > PAGE_SIZE ? (
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setPage(0)
          void refetch()
        }}
      />
    </div>
  )
}
