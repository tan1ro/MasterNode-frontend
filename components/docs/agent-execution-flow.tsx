"use client"

import { cn } from "@/lib/utils"

function Node({
  label,
  sublabel,
  className,
  accent = "default",
}: {
  label: string
  sublabel?: string
  className?: string
  accent?: "default" | "primary" | "layer"
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 text-center min-w-[140px]",
        accent === "primary" && "border-primary/50 bg-primary/5 dark:bg-primary/10",
        accent === "layer" && "border-primary/40 bg-primary/5 dark:bg-primary/10",
        accent === "default" && "border-border bg-card",
        className
      )}
    >
      <p className="font-semibold text-sm text-foreground">{label}</p>
      {sublabel && (
        <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
      )}
    </div>
  )
}

function ArrowDown({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg width="12" height="16" viewBox="0 0 12 16" className="text-muted-foreground/60">
        <path d="M6 0v12M2 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function AgentExecutionFlow({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* User Task */}
      <Node label="User Task" accent="default" />

      <ArrowDown className="my-1" />

      <Node label="MasterAgent" sublabel="analyzes task" accent="primary" />

      <ArrowDown className="my-1" />

      <Node label="TaskDecomposer" sublabel="splits into subtasks" accent="primary" />

      <ArrowDown className="my-1" />

      <Node label="DAG Builder" sublabel="creates execution graph" accent="primary" />

      <ArrowDown className="my-1" />

      {/* Parallel Agent Execution Layer */}
      <div className="w-full max-w-2xl rounded-xl border-2 border-primary/25 bg-card/80 dark:bg-card/60 overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 border-b border-border bg-primary/5 dark:bg-primary/10">
          <p className="font-semibold text-sm text-foreground text-center">
            Parallel Agent Execution Layer
          </p>
          <p className="text-xs text-muted-foreground text-center mt-0.5">
            Celery workers + LangGraph
          </p>
        </div>
        <div className="p-4 flex gap-3 justify-center items-start flex-wrap">
          {/* Agent A column */}
          <div className="flex flex-col items-center gap-2 min-w-[100px]">
            <Node label="Agent A" accent="layer" className="w-full" />
            <svg width="10" height="12" viewBox="0 0 10 12" className="text-muted-foreground/50 shrink-0">
              <path d="M5 0v8M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Node label="SubAgents" sublabel="" className="w-full text-xs py-2" accent="default" />
          </div>
          {/* Agent B column */}
          <div className="flex flex-col items-center gap-2 min-w-[100px]">
            <Node label="Agent B" accent="layer" className="w-full" />
            <svg width="10" height="12" viewBox="0 0 10 12" className="text-muted-foreground/50 shrink-0">
              <path d="M5 0v8M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Node label="SubAgents" sublabel="" className="w-full text-xs py-2" accent="default" />
          </div>
          {/* Agent C column */}
          <div className="flex flex-col items-center gap-2 min-w-[100px]">
            <Node label="Agent C" accent="layer" className="w-full" />
            <svg width="10" height="12" viewBox="0 0 10 12" className="text-muted-foreground/50 shrink-0">
              <path d="M5 0v8M2 5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Node label="SubAgents" sublabel="" className="w-full text-xs py-2" accent="default" />
          </div>
        </div>
      </div>

      <ArrowDown className="my-1" />

      <Node label="AggregatorAgent" sublabel="merges results" accent="primary" />

      <ArrowDown className="my-1" />

      <Node label="SupervisorAgent" sublabel="validates output" accent="primary" />

      <ArrowDown className="my-1" />

      <Node label="Final Result" accent="default" className="border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10" />
    </div>
  )
}
