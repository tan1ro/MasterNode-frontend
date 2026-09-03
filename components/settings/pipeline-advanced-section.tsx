"use client"

import Link from "next/link"
import { GitBranch, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppAuth } from "@/hooks/use-app-auth"
import {
  CHAT_PIPELINE_EXECUTION_MODE,
  CHAT_PIPELINE_HUMAN_IN_LOOP,
  resolvePlanMaxParallelAgents,
} from "@/lib/pipeline-task-defaults"
import { formatChatPlanLabel } from "@/lib/plan-display"
import { ROUTES } from "@/lib/routes"

export function PipelineAdvancedSection() {
  const { plan, isSignedIn } = useAppAuth()
  const effectivePlan = isSignedIn ? plan : "free"
  const maxParallel = resolvePlanMaxParallelAgents(effectivePlan)
  const planLabel = formatChatPlanLabel(effectivePlan)

  return (
    <Card variant="minimal" interactive={false} id="pipeline-advanced" accent="emerald">
      <CardHeader className="space-y-1 p-4 pb-2">
        <div className="flex items-start gap-2">
          <GitBranch className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold leading-snug">Chat pipeline defaults</CardTitle>
            <CardDescription className="mt-1">
              Applied automatically when MasterNode starts a pipeline from Chat. Plan review and chat history
              are configured under Chat settings.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <dl className="space-y-3 rounded-lg border border-border/60 bg-muted/10 p-3 text-sm">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <dt className="text-muted-foreground">Execution mode</dt>
            <dd className="font-medium text-foreground capitalize">{CHAT_PIPELINE_EXECUTION_MODE} pipeline</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <dt className="text-muted-foreground">Max parallel agents</dt>
            <dd className="font-medium text-foreground">
              {maxParallel} agents
              <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                Based on your {planLabel} plan
              </span>
            </dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <dt className="text-muted-foreground">Human-in-the-loop</dt>
            <dd className="font-medium text-foreground">
              {CHAT_PIPELINE_HUMAN_IN_LOOP ? "On automatically" : "Off"}
              <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                Pauses after major stages until you continue from the task page
              </span>
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-start gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-400" aria-hidden />
          <p>
            Sequential mode is not used for chat pipelines. Upgrade your plan on{" "}
            <Link href={ROUTES.billing} className="font-medium text-foreground underline-offset-2 hover:underline">
              Billing
            </Link>{" "}
            to raise the parallel agent cap.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
