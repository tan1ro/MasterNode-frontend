"use client"

import { Search, X, FileText } from "lucide-react"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

interface DocsSidebarProps {
  /** Grouped nav (Cursor-style sections). */
  groups: NavGroup[]
  activeSection: string
  isOpen: boolean
  onClose: () => void
  onNavigate: (id: string) => void
  /** Sidebar heading; defaults to "Documentation". */
  title?: string
  /** Filter labels (sidebar search). */
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function DocsSidebar({
  groups,
  activeSection,
  isOpen,
  onClose,
  onNavigate,
  title = "Documentation",
  searchQuery,
  onSearchChange,
}: DocsSidebarProps) {
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return groups
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => item.label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length > 0)
  }, [groups, searchQuery])

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-[var(--home-landing-nav-height)] z-40 h-[calc(100vh-var(--home-landing-nav-height))] w-[17.5rem] transform overflow-y-auto border-r border-border bg-background/80 backdrop-blur-xl transition-transform duration-300 ease-in-out dark:bg-black/60 lg:sticky",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-5 pb-8">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative mb-5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="search"
              placeholder="Search docs…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-muted/30 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-border focus:outline-none focus:ring-1 focus:ring-ring/30"
              aria-label="Search documentation"
            />
          </div>
          <nav className="space-y-6">
            {filteredGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon ?? FileText
                    const active = activeSection === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onNavigate(item.id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors",
                          active
                            ? "bg-amber/10 font-medium text-amber"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {typeof Icon === "function" && (
                          <Icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-amber" : "opacity-70")} />
                        )}
                        <span className="truncate">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            {filteredGroups.length === 0 && (
              <p className="px-2 text-sm text-muted-foreground">No pages match your search.</p>
            )}
          </nav>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-[var(--home-landing-nav-height)] z-30 bg-background/70 backdrop-blur-sm dark:bg-black/70 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  )
}
