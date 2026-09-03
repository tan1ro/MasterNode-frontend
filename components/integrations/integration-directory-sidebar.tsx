"use client"

import { Bell, LayoutGrid, Workflow } from "lucide-react"
import type { IntegrationDirectorySection } from "@/constants/integration-directory"
import { INTEGRATION_DIRECTORY_SECTIONS } from "@/constants/integration-directory"
import { cn } from "@/lib/utils"

const SECTION_ICONS = {
  connectors: LayoutGrid,
  workflows: Workflow,
  webhooks: Bell,
} as const

interface IntegrationDirectorySidebarProps {
  section: IntegrationDirectorySection
  onSectionChange: (section: IntegrationDirectorySection) => void
  connectorCount?: number
}

export function IntegrationDirectorySidebar({
  section,
  onSectionChange,
  connectorCount = 0,
}: IntegrationDirectorySidebarProps) {
  return (
    <aside className="w-full shrink-0 lg:w-52">
      <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-thin" aria-label="Integrations directory">
        {INTEGRATION_DIRECTORY_SECTIONS.map(({ id, label }) => {
          const Icon = SECTION_ICONS[id]
          const active = section === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSectionChange(id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-amber/15 text-amber"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              {label}
              {id === "connectors" && connectorCount > 0 ? (
                <span className="ml-auto hidden lg:inline text-[10px] tabular-nums text-muted-foreground">
                  {connectorCount}
                </span>
              ) : null}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
