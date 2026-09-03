"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { X } from "lucide-react"
import type { WebSearchSource } from "@/types/api"
import { SourceFavicon, SourceFaviconStack } from "@/components/chat/chat-source-favicon"
import {
  citationPillLabel,
  displayHostname,
  groupSourcesBySite,
  siteLabelFromSource,
  type GroupedWebSearchSource,
} from "@/lib/chat-source-labels"
import { cn } from "@/lib/utils"
import { useChatPresentationPanelOptional } from "@/components/chat/chat-presentation-panel"

interface ChatSourcesPanelState {
  open: boolean
  sources: WebSearchSource[]
  messageId: string | null
  focusSourceUrl: string | null
}

interface ChatSourcesPanelContextValue {
  open: boolean
  sources: WebSearchSource[]
  messageId: string | null
  openSources: (
    sources: WebSearchSource[],
    options?: { messageId?: string | null; focusSourceUrl?: string | null }
  ) => void
  closeSources: () => void
  isOpenForMessage: (messageId: string) => boolean
}

const ChatSourcesPanelContext = createContext<ChatSourcesPanelContextValue | null>(null)

export function useChatSourcesPanel(): ChatSourcesPanelContextValue {
  const ctx = useContext(ChatSourcesPanelContext)
  if (!ctx) {
    throw new Error("useChatSourcesPanel must be used within ChatSourcesPanelProvider")
  }
  return ctx
}

export function useChatSourcesPanelOptional(): ChatSourcesPanelContextValue | null {
  return useContext(ChatSourcesPanelContext)
}

export function ChatSourcesPanelProvider({ children }: { children: ReactNode }) {
  const presentationPanel = useChatPresentationPanelOptional()
  const [state, setState] = useState<ChatSourcesPanelState>({
    open: false,
    sources: [],
    messageId: null,
    focusSourceUrl: null,
  })

  const openSources = useCallback(
    (
      sources: WebSearchSource[],
      options?: { messageId?: string | null; focusSourceUrl?: string | null }
    ) => {
      if (sources.length === 0) return
      presentationPanel?.closePresentation()
      setState({
        open: true,
        sources,
        messageId: options?.messageId ?? null,
        focusSourceUrl: options?.focusSourceUrl ?? null,
      })
    },
    [presentationPanel]
  )

  const closeSources = useCallback(() => {
    setState((prev) => ({ ...prev, open: false, focusSourceUrl: null }))
  }, [])

  const value = useMemo(
    () => ({
      open: state.open,
      sources: state.sources,
      messageId: state.messageId,
      openSources,
      closeSources,
      isOpenForMessage: (messageId: string) => state.open && state.messageId === messageId,
    }),
    [state, openSources, closeSources]
  )

  return (
    <ChatSourcesPanelContext.Provider value={value}>
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
        <ChatSourcesSidebar
          open={state.open}
          sources={state.sources}
          focusSourceUrl={state.focusSourceUrl}
          onClose={closeSources}
        />
      </div>
    </ChatSourcesPanelContext.Provider>
  )
}

function cleanSourceTitle(title: string): string {
  return title.replace(/\s+/g, " ").trim()
}

function SourceSidebarCard({
  source,
  highlighted,
  cardRef,
}: {
  source: WebSearchSource
  highlighted?: boolean
  cardRef?: React.Ref<HTMLAnchorElement | HTMLDivElement>
}) {
  const publisher = siteLabelFromSource(source)
  const domain = displayHostname(source.url)
  const title = cleanSourceTitle(source.title?.trim() || domain || "Untitled source")
  const snippet = source.snippet?.trim()

  const body = (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border border-border/50 bg-background">
          <SourceFavicon url={source.url} className="h-4 w-4" />
        </span>
        <span className="truncate text-xs font-medium text-muted-foreground">{publisher}</span>
      </div>
      <p className="mt-2.5 text-[15px] font-semibold leading-snug text-foreground">{title}</p>
      {snippet ? (
        <p className="mt-2 line-clamp-4 text-[13px] leading-relaxed text-muted-foreground/90">
          {snippet}
        </p>
      ) : domain ? (
        <p className="mt-2 truncate text-xs text-muted-foreground/80">{domain}</p>
      ) : null}
    </>
  )

  const className = cn(
    "block rounded-2xl border px-4 py-3.5 transition-colors",
    highlighted
      ? "border-amber/45 bg-amber/[0.06] ring-1 ring-amber/20"
      : "border-border/45 bg-muted/15 hover:border-border/70 hover:bg-muted/25"
  )

  if (source.url) {
    return (
      <a
        ref={cardRef as React.Ref<HTMLAnchorElement>}
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {body}
      </a>
    )
  }

  return (
    <div ref={cardRef as React.Ref<HTMLDivElement>} className={className}>
      {body}
    </div>
  )
}

export function ChatSourcesSidebar({
  open,
  sources,
  focusSourceUrl = null,
  onClose,
}: {
  open: boolean
  sources: WebSearchSource[]
  focusSourceUrl?: string | null
  onClose: () => void
}) {
  const focusCardRef = useRef<HTMLAnchorElement | HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !focusSourceUrl) return
    const id = window.requestAnimationFrame(() => {
      focusCardRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })
    })
    return () => window.cancelAnimationFrame(id)
  }, [open, focusSourceUrl, sources])

  if (!open || sources.length === 0) {
    return (
      <aside
        className="hidden w-0 shrink-0 overflow-hidden border-l-0 lg:block"
        aria-hidden
      />
    )
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close sources"
        className="fixed inset-0 z-[90] bg-background/55 backdrop-blur-[1px] lg:hidden"
        onClick={onClose}
      />
      <aside
        className={cn(
          "flex flex-col border-border/60 bg-background",
          "fixed inset-y-0 right-0 z-[95] w-full max-w-md shadow-2xl",
          "animate-in slide-in-from-right duration-200",
          "lg:static lg:z-auto lg:w-[min(28rem,38vw)] lg:max-w-none lg:shrink-0 lg:animate-none lg:border-l lg:shadow-none"
        )}
        aria-label="Sources"
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 px-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-foreground">Sources</h2>
            <p className="text-xs text-muted-foreground">{sources.length} results</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            aria-label="Close sources panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 scrollbar-thin">
          <div className="flex flex-col gap-3">
            {sources.map((source) => {
              const highlighted = Boolean(focusSourceUrl && focusSourceUrl === source.url)
              return (
                <SourceSidebarCard
                  key={`${source.url}-${source.title}`}
                  source={source}
                  highlighted={highlighted}
                  cardRef={highlighted ? focusCardRef : undefined}
                />
              )
            })}
          </div>
        </div>
      </aside>
    </>
  )
}

export function ChatSourcesActionButton({
  sources,
  messageId,
  className,
}: {
  sources: WebSearchSource[]
  messageId?: string
  className?: string
}) {
  const panel = useChatSourcesPanelOptional()
  if (!panel || sources.length === 0) return null

  const active = messageId ? panel.isOpenForMessage(messageId) : panel.open

  return (
    <button
      type="button"
      onClick={() =>
        active
          ? panel.closeSources()
          : panel.openSources(sources, { messageId: messageId ?? null })
      }
      aria-expanded={active}
      aria-label="View sources"
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md px-1 text-xs transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <SourceFaviconStack sources={sources} />
      <span>Sources</span>
    </button>
  )
}

export function InlineCitationPill({
  group,
  allSources,
  messageId,
  onOpen,
}: {
  group: GroupedWebSearchSource
  allSources: WebSearchSource[]
  messageId?: string
  onOpen?: (focusUrl: string | null) => void
}) {
  const panel = useChatSourcesPanelOptional()
  const focusUrl = group.sources[0]?.url || null

  const pillUrl = group.sources[0]?.url || ""

  return (
    <button
      type="button"
      onClick={() => {
        if (onOpen) {
          onOpen(focusUrl)
          return
        }
        panel?.openSources(allSources, {
          messageId: messageId ?? null,
          focusSourceUrl: focusUrl,
        })
      }}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-md",
        "bg-muted/85 px-1.5 py-0.5 text-[11px] font-normal leading-none text-foreground/90",
        "hover:bg-muted transition-colors"
      )}
    >
      {pillUrl ? (
        <SourceFavicon url={pillUrl} className="h-3 w-3 shrink-0 rounded-[2px]" />
      ) : null}
      <span className="truncate">{citationPillLabel(group)}</span>
    </button>
  )
}

export function InlineCitationPillGroup({
  groups,
  allSources,
  messageId,
  className,
}: {
  groups: GroupedWebSearchSource[]
  allSources: WebSearchSource[]
  messageId?: string
  className?: string
}) {
  if (groups.length === 0) return null

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      {groups.map((group) => (
        <InlineCitationPill
          key={group.label}
          group={group}
          allSources={allSources}
          messageId={messageId}
        />
      ))}
    </span>
  )
}

/** @deprecated Prefer ChatMarkdownWithCitations for inline section pills. */
export function ChatInlineSourcePills({
  sources,
  messageId,
  className,
}: {
  sources: WebSearchSource[]
  messageId?: string
  className?: string
}) {
  if (sources.length === 0) return null
  const groups = groupSourcesBySite(sources)

  return (
    <InlineCitationPillGroup
      groups={groups}
      allSources={sources}
      messageId={messageId}
      className={cn("mt-2", className)}
    />
  )
}
