"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  updateUserAccessBySuperUser,
  deleteUserBySuperUser,
  type AppAccountType,
  type AppPlan,
} from "@/lib/app-auth"
import type { AdminUserRow } from "@/services/auth"
import { SUPERUSER_EMAIL } from "@/lib/auth-constants"

interface UserAccessTableProps {
  users: AdminUserRow[]
  onChanged: () => void
}

export function UserAccessTable({ users, onChanged }: UserAccessTableProps) {
  const [feedback, setFeedback] = useState("")
  const [savingUserId, setSavingUserId] = useState<string | null>(null)
  const [draftRoleByUser, setDraftRoleByUser] = useState<Record<string, AppAccountType>>({})
  const [draftPlanByUser, setDraftPlanByUser] = useState<Record<string, AppPlan>>({})

  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground">No users found.</p>
  }

  return (
    <div className="space-y-3">
      {feedback ? (
        <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          {feedback}
        </div>
      ) : null}
      {users.map((user) => {
        const isBuiltInSuperuser =
          user.email?.toLowerCase() === SUPERUSER_EMAIL.toLowerCase() ||
          user.tenant_id === "usr_superuser"
        const roleValue = draftRoleByUser[user.tenant_id] || (user.account_type as AppAccountType)
        const planValue = draftPlanByUser[user.tenant_id] || (user.plan as AppPlan)
        const displayName = user.username || user.email?.split("@")[0] || user.tenant_id

        return (
          <div
            key={user.tenant_id}
            className="rounded-lg border border-border/60 bg-background px-3 py-3 sm:px-4"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground font-mono">{user.tenant_id}</p>
              </div>
              {isBuiltInSuperuser ? (
                <span className="inline-flex items-center rounded-full border border-amber/40 bg-amber/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber shrink-0">
                  Superuser
                </span>
              ) : null}
            </div>
            {!isBuiltInSuperuser ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-4">
                <select
                  className="h-9 rounded-md border border-border/60 bg-background px-2 text-sm"
                  value={roleValue}
                  onChange={(e) =>
                    setDraftRoleByUser((prev) => ({
                      ...prev,
                      [user.tenant_id]: e.target.value as AppAccountType,
                    }))
                  }
                >
                  <option value="creator">creator</option>
                  <option value="business">business</option>
                </select>
                <select
                  className="h-9 rounded-md border border-border/60 bg-background px-2 text-sm"
                  value={planValue}
                  onChange={(e) =>
                    setDraftPlanByUser((prev) => ({
                      ...prev,
                      [user.tenant_id]: e.target.value as AppPlan,
                    }))
                  }
                >
                  <option value="free">free</option>
                  <option value="pro">pro</option>
                  <option value="pro_plus">Premium</option>
                  <option value="premium">Infinity</option>
                  <option value="enterprise">enterprise</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={savingUserId === user.tenant_id}
                  onClick={() => {
                    void (async () => {
                      try {
                        setSavingUserId(user.tenant_id)
                        await updateUserAccessBySuperUser(user.tenant_id, {
                          accountType: roleValue,
                          plan: planValue,
                        })
                        setFeedback(`Updated access for ${displayName}.`)
                        onChanged()
                      } catch (e) {
                        setFeedback(e instanceof Error ? e.message : "Unable to update user.")
                      } finally {
                        setSavingUserId(null)
                      }
                    })()
                  }}
                >
                  Save access
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={savingUserId === user.tenant_id}
                  onClick={() => {
                    if (!confirm(`Permanently delete ${user.email}? This cannot be undone.`)) return
                    void (async () => {
                      try {
                        setSavingUserId(user.tenant_id)
                        await deleteUserBySuperUser(user.tenant_id)
                        setFeedback(`Deleted user ${displayName}.`)
                        onChanged()
                      } catch (e) {
                        setFeedback(e instanceof Error ? e.message : "Unable to delete user.")
                      } finally {
                        setSavingUserId(null)
                      }
                    })()
                  }}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Built-in superuser account is protected and cannot be edited or removed.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
