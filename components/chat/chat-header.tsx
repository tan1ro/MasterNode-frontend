"use client"

import { Menu, PanelLeftClose, Workflow } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  title: string
  sidebarOpen: boolean
  onToggleSidebar: () => void
  pipelineRunning?: boolean
  pipelineModeEnabled?: boolean
}

export function ChatHeader({
  title,
  sidebarOpen,
  onToggleSidebar,
  pipelineRunning = false,
  pipelineModeEnabled = false,
}: Props) {
  return (
    <header className="h-14 border-b border-border/50 px-4 md:px-5 flex items-center gap-3 bg-background/90 backdrop-blur-sm">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-[0.95rem] font-medium truncate">{title}</p>
      </div>
      {pipelineRunning || pipelineModeEnabled ? (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 shrink-0 rounded-full border border-amber-500/40",
            "bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300"
          )}
        >
          <Workflow className={cn("h-3 w-3", pipelineRunning && "animate-pulse")} />
          {pipelineRunning ? "Running" : "Pipeline"}
        </span>
      ) : null}
    </header>
  )
}
