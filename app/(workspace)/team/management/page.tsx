"use client"

import dynamic from "next/dynamic"
import { PageHeader } from "@/components/shared/page-header"
import { PageShell } from "@/components/layout/page-shell"
import { AuditLogCard, TeamAdoptionDashboard } from "@/components/team"

const TeamMembersCard = dynamic(
  () => import("@/components/team/team-members-card").then((m) => ({ default: m.TeamMembersCard })),
  { ssr: false, loading: () => <p className="text-sm text-muted-foreground py-4">Loading team…</p> }
)

export default function TeamManagementPage() {
  return (
    <PageShell maxWidth="5xl" className="space-y-6">
      <PageHeader
        title="Team Management"
        description="Members from your app workspace, roles, and recent admin activity."
      />

      <TeamAdoptionDashboard />

      <div className="space-y-5">
        <TeamMembersCard />
        <AuditLogCard />
      </div>
    </PageShell>
  )
}
