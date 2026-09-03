"use client"

import { HOME_PIPELINE_STAGES } from "@/components/home/home-pipeline-stages"
import {
  HomePipelineActiveExample,
  HomePipelineDomainProvider,
} from "@/components/home/home-pipeline-domain-context"
import { HomePipelineStageBlock } from "@/components/home/home-pipeline-stage-block"
import { cn } from "@/lib/utils"

export function HomePipelineWorkflow({ className }: { className?: string }) {
  return (
    <HomePipelineDomainProvider>
      <div className={cn("home-pipeline-workflow-inner mx-auto w-full max-w-7xl", className)}>
        <HomePipelineActiveExample className="mb-4 sm:mb-10" />

        <div className="space-y-6 sm:space-y-16 lg:space-y-24">
          {HOME_PIPELINE_STAGES.map((stage, index) => (
            <div key={stage.key} id={`pipeline-${stage.key}`} className="scroll-mt-28">
              <HomePipelineStageBlock stage={stage} index={index} />
            </div>
          ))}
        </div>
      </div>
    </HomePipelineDomainProvider>
  )
}
