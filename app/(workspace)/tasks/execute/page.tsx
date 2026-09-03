"use client"

import { Suspense } from "react"
import { ExecutePipelineView } from "@/components/tasks/execute-pipeline-view"
import { PageHeader } from "@/components/shared/page-header"

function ExecuteBody() {
  return <ExecutePipelineView />
}

export default function ExecutePipelinePage() {
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <PageHeader
        title="Execute pipeline"
        description="Configure execution, watch the DAG, and approve each stage when human-in-the-loop is enabled. Append ?taskId= to load a real run from the API."
      />
      <Suspense
        fallback={<p className="text-sm text-muted-foreground py-8">Loading…</p>}
      >
        <ExecuteBody />
      </Suspense>
    </div>
  )
}
