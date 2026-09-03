"use client"

import Link from "next/link"
import { ShieldCheck, Activity } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamAdoptionDashboard } from "@/components/team/team-adoption-dashboard"
import { PageShell } from "@/components/layout/page-shell"
import { ROUTES } from "@/lib/routes"

export default function TeamHubPage() {
  return (
    <PageShell maxWidth="6xl" className="space-y-6">
      <PageHeader
        title="Team"
        description="Adoption and consumption per member and per team."
      />

      <TeamAdoptionDashboard />

      <div className="grid gap-4 md:grid-cols-2 border-t border-border/50 pt-6">
        <Link href={ROUTES.teamManagement} className="block group">
          <Card accent="amber" className="h-full transition-transform group-hover:-translate-y-0.5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                <div>
                  <CardTitle>Team Management</CardTitle>
                  <CardDescription>Invite members, set roles, and review admin activity.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Members, roles, and recent admin events for your workspace.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={ROUTES.teamLogs} className="block group">
          <Card accent="cyan" className="h-full transition-transform group-hover:-translate-y-0.5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                <div>
                  <CardTitle>Team Logs</CardTitle>
                  <CardDescription>Audit timeline of team and billing activity.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Invites, role changes, billing, and API key events scoped to the team.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </PageShell>
  )
}
