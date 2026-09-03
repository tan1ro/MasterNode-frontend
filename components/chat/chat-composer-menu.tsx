"use client"

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
} from "react"
import { createPortal } from "react-dom"
import {
  ArrowLeft,
  Bot,
  Brain,
  Check,
  ChevronRight,
  Paperclip,
  Plus,
  Workflow,
  X,
} from "lucide-react"
import {
  assistantContextChipStyleForTemplate,
  memoryContextChipStyle,
  pipelineModeChipStyle,
  type ContextChipStyle,
} from "@/lib/chat-context-chip-styles"
import { cn } from "@/lib/utils"
import type { ChatContextSelection } from "@/components/chat/chat-context-panel"
import type { AgentTemplateApi, RagFile } from "@/types/api"
import {
  ChatAssistantsPicker,
  ChatMemoryPicker,
  getAttachedAssistantId,
  getAttachedAssistantName,
  getMemoryChipLabel,
  hasAttachedAssistants,
  isMemoryActive,
} from "@/components/chat/chat-run-context-pickers"
import { readCapabilitiesForTemplate } from "@/lib/assistant-read-capabilities"
import { PipelineModeIconGlow } from "@/components/chat/pipeline-mode-icon-glow"
import { CHAT_TOUR_MENU_EVENT } from "@/lib/chat-intro-tour"

interface ChatComposerMenuProps {
  pipelineModeEnabled: boolean
  onPipelineModeChange?: (enabled: boolean) => void
  onAttach: () => void
  disabled?: boolean
  chatContext: ChatContextSelection
  onChatContextChange: (next: ChatContextSelection) => void
  ragFiles: RagFile[] | undefined
  ragLoading: boolean
  templates: AgentTemplateApi[] | undefined
  templatesLoading: boolean
}

type MenuView = "main" | "memory" | "assistants"

const MENU_WIDTH = 280

function MenuRow({
  icon: Icon,
  label,
  detail,
  accent,
  onClick,
  trailing,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  detail?: string
  accent?: "cyan" | "violet" | "amber" | "sky"
  onClick: () => void
  trailing?: React.ReactNode
}) {
  const iconClass =
    accent === "cyan"
      ? "text-cyan"
      : accent === "violet"
        ? "text-violet"
        : accent === "sky"
          ? "text-sky"
          : accent === "amber"
            ? "text-amber"
            : "text-muted-foreground"

  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50"
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background/60",
          accent === "cyan" && "border-cyan/25 bg-cyan/10",
          accent === "violet" && "border-violet/25 bg-violet/10",
          accent === "amber" && "border-amber/25 bg-amber/10",
          accent === "sky" && "border-sky/25 bg-sky/10"
        )}
      >
        <Icon className={cn("h-4 w-4", iconClass)} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-foreground">{label}</span>
        {detail ? (
          <span className="block truncate text-xs text-muted-foreground">{detail}</span>
        ) : null}
      </span>
      {trailing ?? <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
    </button>
  )
}

function MenuSubHeader({
  title,
  onBack,
}: {
  title: string
  onBack: () => void
}) {
  return (
    <div className="mb-2 flex items-center gap-2 border-b border-border/50 px-2 pb-2">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        aria-label="Back"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <p className="text-sm font-semibold text-foreground">{title}</p>
    </div>
  )
}

export function ChatComposerMenu({
  pipelineModeEnabled,
  onPipelineModeChange,
  onAttach,
  disabled,
  chatContext,
  onChatContextChange,
  ragFiles,
  ragLoading,
  templates,
  templatesLoading,
}: ChatComposerMenuProps) {
  const [open, setOpen] = useState(false)
  const [tourForcedOpen, setTourForcedOpen] = useState(false)
  const [view, setView] = useState<MenuView>("main")
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const showPipelineToggle = Boolean(onPipelineModeChange)

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setMenuPosition(null)
      return
    }
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - MENU_WIDTH - 8))
      setMenuPosition({ top: rect.top - 8, left })
    }
    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)
    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setView("main")
      return
    }
    const onPointerDown = (event: MouseEvent) => {
      if (tourForcedOpen) return
      const target = event.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
      setView("main")
    }
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (tourForcedOpen) return
        if (view !== "main") {
          setView("main")
          return
        }
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onEscape)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onEscape)
    }
  }, [open, view, tourForcedOpen])

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ open?: boolean }>).detail
      if (detail?.open) {
        setView("main")
        setTourForcedOpen(true)
        setOpen(true)
      } else {
        setTourForcedOpen(false)
        setOpen(false)
        setView("main")
      }
    }
    window.addEventListener(CHAT_TOUR_MENU_EVENT, handler)
    return () => window.removeEventListener(CHAT_TOUR_MENU_EVENT, handler)
  }, [])

  const memoryChosen = isMemoryActive(chatContext)
  const assistantChosen = hasAttachedAssistants(chatContext)
  const memoryDetail = memoryChosen
    ? getMemoryChipLabel(chatContext, ragFiles)
    : "Search uploaded documents"
  const attachedTemplate = (templates || []).find(
    (t) => String(t.template_id || "").trim() === getAttachedAssistantId(chatContext)
  )
  const readCaps = readCapabilitiesForTemplate(attachedTemplate)
  const assistantDetail = assistantChosen
    ? readCaps.superThink
      ? `${readCaps.superThinkProfile.framework} · ${readCaps.superThinkProfile.label}`
      : readCaps.superRead
        ? readCaps.summary
        : getAttachedAssistantName(templates, chatContext) ?? "Selected"
    : "Pick one for super thinking in its field"

  const pickerProps = {
    value: chatContext,
    onChange: onChatContextChange,
    disabled,
  }

  const menuPanel =
    open && menuPosition ? (
      <div
        ref={menuRef}
        role="menu"
        style={{
          position: "fixed",
          top: menuPosition.top,
          left: menuPosition.left,
          width: MENU_WIDTH,
          transform: "translateY(-100%)",
        }}
        className={cn(
          // Above the dimmed backdrop (100000) so Pipeline mode stays visible
          // and clickable; tour card sits higher (100003) so step copy stays readable.
          tourForcedOpen ? "z-[100001]" : "z-[200]",
          "overflow-hidden rounded-2xl",
          "border border-border/70 bg-popover shadow-xl"
        )}
      >
        {view === "main" ? (
          <div className="p-1.5">
            <MenuRow
              icon={Paperclip}
              label="Upload files"
              detail="Photos and documents"
              onClick={() => {
                onAttach()
                setOpen(false)
                setView("main")
              }}
            />

            <div className="my-1 border-t border-border/50" role="separator" />

            <MenuRow
              icon={Brain}
              label="Memory"
              detail={memoryDetail}
              accent="cyan"
              onClick={() => setView("memory")}
            />
            <MenuRow
              icon={Bot}
              label="Assistants"
              detail={assistantDetail}
              accent="violet"
              onClick={() => setView("assistants")}
            />

            {showPipelineToggle ? (
              <>
                <div className="my-1 border-t border-border/50" role="separator" />
                <button
                  type="button"
                  role="menuitemcheckbox"
                  data-chat-tour="pipeline-toggle"
                  aria-checked={pipelineModeEnabled}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/50",
                    pipelineModeEnabled && "bg-muted/30"
                  )}
                  onClick={() => {
                    const next = !pipelineModeEnabled
                    onPipelineModeChange?.(next)
                    // Close after enabling so the Pipeline mode chip is visible;
                    // keep open during the tour so the checkmark stays in view.
                    if (next && !tourForcedOpen) {
                      setOpen(false)
                      setView("main")
                    }
                  }}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-background/60",
                      pipelineModeEnabled && "border-sky/25 bg-sky/10"
                    )}
                  >
                    {pipelineModeEnabled ? (
                      <PipelineModeIconGlow size="sm" surface="popover" />
                    ) : (
                      <Workflow className="h-4 w-4 text-sky" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-foreground">Pipeline mode</span>
                    <span className="block text-xs text-muted-foreground">
                      Multi-agent workflow for complex tasks
                    </span>
                  </span>
                  {pipelineModeEnabled ? (
                    <Check className="h-4 w-4 shrink-0 text-sky" aria-hidden />
                  ) : null}
                </button>
              </>
            ) : null}
          </div>
        ) : null}

        {view === "memory" ? (
          <div className="p-3">
            <MenuSubHeader title="Memory" onBack={() => setView("main")} />
            <ChatMemoryPicker
              {...pickerProps}
              ragFiles={ragFiles}
              ragLoading={ragLoading}
              hideHeader
            />
          </div>
        ) : null}

        {view === "assistants" ? (
          <div className="p-3">
            <MenuSubHeader title="Assistants" onBack={() => setView("main")} />
            <ChatAssistantsPicker
              {...pickerProps}
              templates={templates}
              templatesLoading={templatesLoading}
              hideHeader
            />
          </div>
        ) : null}
      </div>
    ) : null

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        data-chat-tour="composer-menu"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={
          pipelineModeEnabled
            ? "Pipeline mode on — run options"
            : "Add attachments and run options"
        }
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full",
          pipelineModeEnabled
            ? "text-foreground/90 hover:bg-background/50 hover:text-foreground"
            : "text-muted-foreground hover:bg-background/50 hover:text-foreground",
          open && "bg-background/50 text-foreground",
          disabled && "pointer-events-none opacity-50"
        )}
        onClick={() => setOpen((v) => !v)}
      >
        {pipelineModeEnabled ? (
          <PipelineModeIconGlow size="md" />
        ) : (
          <Plus className="h-5 w-5" strokeWidth={1.75} />
        )}
      </button>

      {typeof document !== "undefined" && menuPanel
        ? createPortal(menuPanel, document.body)
        : null}
    </div>
  )
}

function StyledContextChip({
  style,
  label,
  onClear,
  disabled,
  clearLabel,
}: {
  style: ContextChipStyle
  label: string
  onClear: () => void
  disabled?: boolean
  clearLabel: string
}) {
  const Icon = style.Icon
  return (
    <span className={cn("inline-flex max-w-full shrink-0", style.chipClass)}>
      <span className={style.iconClass}>
        <Icon className="h-3 w-3" aria-hidden />
      </span>
      <span className="truncate">{label}</span>
      <button
        type="button"
        disabled={disabled}
        className={style.clearClass}
        aria-label={clearLabel}
        onClick={onClear}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

interface PipelineModeChipProps {
  onDisable: () => void
  disabled?: boolean
}

export function PipelineModeChip({ onDisable, disabled }: PipelineModeChipProps) {
  return (
    <span className="pipeline-mode-chip-glow inline-flex max-w-full shrink-0">
      <StyledContextChip
        style={pipelineModeChipStyle()}
        label="Pipeline mode"
        onClear={onDisable}
        disabled={disabled}
        clearLabel="Turn off pipeline mode"
      />
    </span>
  )
}

export function AssistantChip({
  templateId,
  templates,
  name,
  onClear,
  disabled,
}: {
  templateId: string
  templates: AgentTemplateApi[] | undefined
  name: string
  onClear: () => void
  disabled?: boolean
}) {
  const style = assistantContextChipStyleForTemplate(templateId, templates)
  return (
    <StyledContextChip
      style={style}
      label={name}
      onClear={onClear}
      disabled={disabled}
      clearLabel="Remove assistant"
    />
  )
}

export function MemoryChip({
  label,
  memoryExt,
  onClear,
  disabled,
}: {
  label: string
  memoryExt: string | null
  onClear: () => void
  disabled?: boolean
}) {
  const style = memoryContextChipStyle(memoryExt)
  return (
    <StyledContextChip
      style={style}
      label={label}
      onClear={onClear}
      disabled={disabled}
      clearLabel="Turn off memory"
    />
  )
}
