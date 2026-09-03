"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { Building2, Check, ChevronDown, Loader2, Search, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FieldError } from "@/components/auth/field-error"
import { organizationsService, type OrganizationSummary } from "@/services/organizations"
import type { ApiError } from "@/types/api"

export interface OrganizationSearchComboboxProps {
  selected: OrganizationSummary | null
  onSelect: (org: OrganizationSummary | null) => void
  error?: string
  disabled?: boolean
}

export function OrganizationSearchCombobox({
  selected,
  onSelect,
  error,
  disabled,
}: OrganizationSearchComboboxProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(selected?.name ?? "")
  const [results, setResults] = useState<OrganizationSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    if (selected) setQuery(selected.name)
  }, [selected])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim()
    if (trimmed.length < 2) {
      setResults([])
      setSearchError(null)
      return
    }
    setLoading(true)
    setSearchError(null)
    try {
      const data = await organizationsService.search(trimmed, 12)
      setResults(data.organizations || [])
    } catch (err) {
      setResults([])
      const apiErr = err as ApiError
      const status = apiErr.httpStatus
      if (status === 404) {
        setSearchError(
          "Organization search is not available on this API build. Rebuild the backend (e.g. docker compose build api && docker compose up -d) or run the latest server locally."
        )
      } else if (apiErr.isBackendUnavailable || apiErr.isConnectionError) {
        setSearchError("Backend is unavailable. Waiting for the API to come back online.")
      } else {
        const detail = err instanceof Error ? err.message : "Unknown error"
        setSearchError(detail || "Could not load organizations. Try again.")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open || selected) return
    const t = window.setTimeout(() => void runSearch(query), 280)
    return () => window.clearTimeout(t)
  }, [query, open, selected, runSearch])

  const pick = (org: OrganizationSummary) => {
    onSelect(org)
    setQuery(org.name)
    setOpen(false)
    setResults([])
  }

  const clearSelection = () => {
    onSelect(null)
    setQuery("")
    setResults([])
    setOpen(true)
  }

  return (
    <div ref={rootRef} className="space-y-2">
      <Label htmlFor={`${listId}-input`} className="text-base font-medium">
        Find your organization
      </Label>
      <p className="text-xs text-muted-foreground">
        Search by name and select your team workspace. You will join as a member.
      </p>

      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id={`${listId}-input`}
            value={query}
            onChange={(e) => {
              const v = e.target.value
              setQuery(v)
              if (selected && v !== selected.name) onSelect(null)
              setOpen(true)
            }}
            onFocus={() => {
              if (!disabled) setOpen(true)
            }}
            placeholder="Type at least 2 characters…"
            disabled={disabled}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-invalid={Boolean(error)}
            className={cn(
              "h-11 pl-9 pr-10 text-base sm:h-12",
              error && "border-destructive focus-visible:ring-destructive/40"
            )}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
            onClick={() => setOpen((v) => !v)}
            disabled={disabled}
            aria-label="Toggle organization list"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
            )}
          </button>
        </div>

        {selected ? (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-amber/30 bg-amber/5 px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber/15">
                <Building2 className="h-4 w-4 text-amber" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{selected.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {selected.member_count} member{selected.member_count === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <Check className="h-4 w-4 text-amber shrink-0" />
          </div>
        ) : null}

        {open && !selected ? (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-popover shadow-lg py-1"
          >
            {query.trim().length < 2 ? (
              <li className="px-3 py-2.5 text-sm text-muted-foreground">Type at least 2 characters to search</li>
            ) : loading ? (
              <li className="px-3 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Searching…
              </li>
            ) : searchError ? (
              <li className="px-3 py-2.5 text-sm text-destructive">{searchError}</li>
            ) : results.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-muted-foreground">
                No organizations found. Try another name or create a new one.
              </li>
            ) : (
              results.map((org) => (
                <li key={org.org_id}>
                  <button
                    type="button"
                    role="option"
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted/60 transition-colors"
                    onClick={() => pick(org)}
                  >
                    <Building2 className="h-4 w-4 text-amber shrink-0" />
                    <span className="font-medium truncate flex-1">{org.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {org.member_count} member{org.member_count === 1 ? "" : "s"}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>

      {selected ? (
        <button
          type="button"
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          onClick={clearSelection}
          disabled={disabled}
        >
          Clear selection
        </button>
      ) : null}

      <FieldError message={error} />
    </div>
  )
}
