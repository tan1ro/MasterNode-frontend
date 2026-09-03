"use client"

import { PipelineModuleCards } from "@/components/pipeline/pipeline-panel-ui"
import { cn } from "@/lib/utils"

export interface ChatPipelineModuleGraphProps {
  modules?: string[]
  completedStages?: number
  totalStages?: number
  className?: string
  hideStageCount?: boolean
}

export function ChatPipelineModuleGraph({
  modules = [],
  completedStages = 0,
  totalStages = 5,
  className,
  hideStageCount = false,
}: ChatPipelineModuleGraphProps) {
  const selected =
    modules.length > 0 ? modules : ["Master", "Planner", "Validator", "Output Generator"]

  return (
    <div className={cn("space-y-2.5", className)}>
      <PipelineModuleCards modules={selected} />
      {!hideStageCount && totalStages > 0 && completedStages >= 0 ? (
        <p className="text-xs font-medium tabular-nums text-white/70">
          Stage {Math.min(completedStages, totalStages)}/{totalStages} complete
        </p>
      ) : null}
    </div>
  )
}
