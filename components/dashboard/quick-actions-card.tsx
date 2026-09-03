"use client"

import Link from "next/link"
import { Key, MessageSquare, Workflow } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/routes"

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading tracking-wide">Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link href={ROUTES.chat}>
          <Button
            variant="outline"
            className="w-full justify-start border-border/50 hover:border-amber/30 hover:text-amber"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Open Chat
          </Button>
        </Link>
        <Link href={ROUTES.taskExecute}>
          <Button
            variant="outline"
            className="w-full justify-start border-border/50 hover:border-amber/30 hover:text-amber"
          >
            <Workflow className="mr-2 h-4 w-4" />
            Pipeline executor (HITL)
          </Button>
        </Link>
        <Link href={ROUTES.apiKeys}>
          <Button
            variant="outline"
            className="w-full justify-start border-border/50 hover:border-amber/30 hover:text-amber"
          >
            <Key className="mr-2 h-4 w-4" />
            Manage API Keys
          </Button>
        </Link>
        <Link href={ROUTES.settings}>
          <Button
            variant="outline"
            className="w-full justify-start border-border/50 hover:border-amber/30 hover:text-amber"
          >
            Settings
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
