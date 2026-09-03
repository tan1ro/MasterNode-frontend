"use client"

import { Download, ExternalLink, Workflow } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const N8N_WORKFLOW_URL = "/integrations/n8n-masternode-pipeline.workflow.json"

const STEPS = [
  "In n8n, create a workflow and add a Webhook node (POST). Use Production URL when active.",
  "Import the MasterNode template (download below) or copy its Switch routing logic.",
  "Activate the workflow, then paste the webhook URL on this Integrations page.",
  "Chat: say “trigger n8n workflow …”. Tasks: pipeline events post automatically when connected.",
] as const

interface N8nPipelineSetupProps {
  className?: string
}

export function N8nPipelineSetup({ className }: N8nPipelineSetupProps) {
  return (
    <Card accent="destructive" className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-destructive shrink-0" aria-hidden />
          <div>
            <CardTitle>n8n pipeline setup</CardTitle>
            <CardDescription>
              Import a starter workflow for chat triggers and MasterNode task pipeline events
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          {STEPS.map((step) => (
            <li key={step} className="pl-1">
              {step}
            </li>
          ))}
        </ol>

        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs font-mono text-muted-foreground space-y-1">
          <p>
            <span className="text-foreground">chat.n8n_trigger</span> — user message from chat
          </p>
          <p>
            <span className="text-foreground">task.accepted</span> — task submitted to pipeline
          </p>
          <p>
            <span className="text-foreground">task.completed</span> — pipeline finished successfully
          </p>
          <p>
            <span className="text-foreground">task.failed</span> — pipeline error
          </p>
          <p>
            <span className="text-foreground">integration.test</span> — Test button on Integrations page
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <a href={N8N_WORKFLOW_URL} download="masternode-pipeline.workflow.json">
              <Download className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              Download workflow template
            </a>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <a
              href="https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" aria-hidden />
              n8n Webhook docs
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
