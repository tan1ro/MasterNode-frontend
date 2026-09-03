"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Search, Trash2, X } from "lucide-react"
import {
  CHAT_DATE_FILTER_OPTIONS,
  CHAT_SORT_OPTIONS,
  filterAndSortConversations,
  type ChatConversationDateFilter,
  type ChatConversationSortKey,
} from "@/lib/chat-conversation-search"
import { formatUserDateTime } from "@/lib/datetime-local"
import { useLocaleDisplayPrefs } from "@/hooks/use-locale-display-prefs"
import { plainTextFromChatContent } from "@/lib/chat-markdown"
import { cn } from "@/lib/utils"
import type { ChatConversation } from "@/types/api"

interface ChatSearchModalProps {
  open: boolean
  onClose: () => void
  conversations: ChatConversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
}

export function ChatSearchModal({
  open,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
}: ChatSearchModalProps) {
  useLocaleDisplayPrefs()
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<ChatConversationSortKey>("newest")
  const [dateFilter, setDateFilter] = useState<ChatConversationDateFilter>("all")
  const [customFrom, setCustomFrom] = useState("")
  const [customTo, setCustomTo] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(
    () =>
      filterAndSortConversations(conversations, {
        query,
        sortKey,
        dateFilter,
        customFrom: dateFilter === "custom" ? customFrom : undefined,
        customTo: dateFilter === "custom" ? customTo : undefined,
      }),
    [conversations, query, sortKey, dateFilter, customFrom, customTo]
  )

  useEffect(() => {
    if (!open) {
      setQuery("")
      setSortKey("newest")
      setDateFilter("all")
      setCustomFrom("")
      setCustomTo("")
      return
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-background/15 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-search-title"
        className={cn(
          "relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border/80",
          "bg-background shadow-2xl",
          "max-h-[min(640px,calc(100dvh-1.5rem))]"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3">
          <h2 id="chat-search-title" className="text-sm font-semibold">
            Search chats
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 border-b border-border/60 px-4 py-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or message…"
              aria-label="Search chats"
              className={cn(
                "w-full rounded-lg border border-border/60 bg-muted/25 py-2.5 pl-9 pr-3 text-sm",
                "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Sort by
              </span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as ChatConversationSortKey)}
                className="w-full rounded-lg border border-border/60 bg-background px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                aria-label="Sort by"
              >
                {CHAT_SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Date
              </span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as ChatConversationDateFilter)}
                className="w-full rounded-lg border border-border/60 bg-background px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                aria-label="Filter by date"
              >
                {CHAT_DATE_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {dateFilter === "custom" ? (
            <div className="grid grid-cols-2 gap-2">
              <label className="block space-y-1">
                <span className="text-[11px] text-muted-foreground">From</span>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-background px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                  aria-label="From date"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-[11px] text-muted-foreground">To</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-background px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                  aria-label="To date"
                />
              </label>
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 scrollbar-thin">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No chats match your search.
            </p>
          ) : (
            <ul className="space-y-0.5" role="listbox" aria-label="Search results">
              {results.map((item) => {
                const active = activeConversationId === item.conversation_id
                const activityIso = item.updated_at || item.created_at
                return (
                  <li key={item.conversation_id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onSelectConversation(item.conversation_id)
                        onClose()
                      }}
                      className={cn(
                        "group flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left transition-colors",
                        active
                          ? "bg-muted/70 text-foreground"
                          : "text-foreground hover:bg-muted/50"
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {item.title || "New chat"}
                        </span>
                        {item.last_message_preview ? (
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {plainTextFromChatContent(item.last_message_preview)}
                          </span>
                        ) : null}
                        <span className="mt-1 block text-[11px] text-muted-foreground">
                          {formatUserDateTime(activityIso, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        className="mt-0.5 shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted/50 hover:text-foreground group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteConversation(item.conversation_id)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            e.stopPropagation()
                            onDeleteConversation(item.conversation_id)
                          }
                        }}
                        aria-label="Delete chat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
