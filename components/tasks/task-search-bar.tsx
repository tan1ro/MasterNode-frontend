"use client"

import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskSearchBarProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function TaskSearchBar({ value, onChange, className }: TaskSearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        placeholder="Search by task description…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full rounded-xl border border-border/50 bg-muted/15 py-2.5 pl-10 pr-10 text-sm text-foreground",
          "placeholder:text-muted-foreground/70",
          "focus:border-amber/40 focus:outline-none focus:ring-2 focus:ring-amber/20"
        )}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}
