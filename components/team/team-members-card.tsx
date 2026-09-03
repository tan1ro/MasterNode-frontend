"use client"

import { UserPlus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAppAuth } from "@/hooks/use-app-auth"

type Role = "Admin" | "Editor" | "Viewer"

const roleColors: Record<Role, string> = {
  Admin: "bg-primary/10 text-primary border-primary/20",
  Editor: "bg-cyan/10 text-cyan border-cyan/20",
  Viewer: "bg-muted text-muted-foreground border-border",
}

function mapOrgRole(r: string | undefined): Role {
  const x = String(r || "").trim().toLowerCase()
  if (!x) return "Viewer"

  if (x === "org:admin" || x.endsWith(":admin") || x.includes("admin")) return "Admin"
  if (x === "org:member" || x.endsWith(":member") || x.includes("member") || x.includes("basic")) return "Editor"
  return "Viewer"
}

export function TeamMembersCard() {
  const { user } = useAppAuth()
  const rows = user
    ? [{
        id: user.id,
        initials: user.username.slice(0, 2).toUpperCase(),
        name: user.username,
        email: user.email,
        role: mapOrgRole(user.accountType === "creator" ? "admin" : "member"),
        lastActive: "Now",
        status: "online" as const,
      }]
    : []
  const loaded = true
  const organizationName = user?.organization.name || ""

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Team Members</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {!loaded
              ? "Loading…"
              : organizationName
                ? `${rows.length} member${rows.length === 1 ? "" : "s"} · ${organizationName}`
                : "Sign in to see your profile"}
          </p>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" type="button" disabled title="Invite flows use your identity provider">
          <UserPlus className="h-3.5 w-3.5" aria-hidden />
          Invite Member
        </Button>
      </div>

      <Card
        noGrid
        className="overflow-hidden hover:translate-y-0 hover:scale-100 hover:shadow-md"
      >
        {!loaded ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading…</div>
        ) : !organizationName ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No organization is active. Create an account to set up a workspace.
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No members to show.
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Member", "Email", "Role", "Last Active", "Status", ""].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {m.initials}
                      </div>
                      <span className="font-medium text-foreground">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.email || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded border px-2 py-1 text-[10px] font-medium",
                        roleColors[m.role]
                      )}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{m.lastActive}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "flex items-center gap-1.5 text-[10px]",
                        m.status === "online" ? "text-emerald" : "text-muted-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          m.status === "online" ? "bg-emerald" : "bg-muted-foreground"
                        )}
                      />
                      {m.status === "online" ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="px-4 py-3 w-10" />
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  )
}
