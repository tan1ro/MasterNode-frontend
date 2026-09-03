"use client"

import { N8nPipelineSetup } from "@/components/integrations/n8n-pipeline-setup"

export function WorkflowsSection() {
  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Workflow templates</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Import ready-made automations into n8n, then connect the webhook URL on the n8n connector
          page.
        </p>
      </div>
      <N8nPipelineSetup />
    </div>
  )
}
