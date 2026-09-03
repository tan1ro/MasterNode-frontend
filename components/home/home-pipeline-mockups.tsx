"use client"

import {
  ArrowRight,
  Calculator,
  Check,
  ChevronDown,
  ChevronRight,
  DollarSign,
  FileText,
  Image as ImageIcon,
  Lightbulb,
  List,
  Mail,
  Megaphone,
  Minus,
  Plus,
  Search,
  Sparkles,
  Table2,
  Target,
  Upload,
  Users,
} from "lucide-react"
import { HomePixelDecor } from "@/components/home/home-pixel-decor"
import { usePipelineDomain } from "@/components/home/home-pipeline-domain-context"
import { cn } from "@/lib/utils"

/** Shared surfaces inside pipeline stage mockups (mini app UI previews). */
const MOCK_SHELL =
  "home-pipeline-mockup relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[0.85rem] border bg-card p-1.5 sm:rounded-[1.35rem] sm:p-5 lg:p-7 dark:bg-[#050609]"
const MOCK_PANEL =
  "rounded-xl border border-border bg-muted/50 dark:border-white/10 dark:bg-black/40"
const MOCK_PANEL_SOFT =
  "rounded-xl border border-border bg-muted/35 dark:border-white/10 dark:bg-black/30"
const MOCK_PANEL_SM =
  "rounded border border-border bg-muted/50 p-1 dark:border-white/10 dark:bg-black/40 sm:rounded-lg sm:p-2"
const MOCK_LABEL = "text-[10px] font-medium text-foreground sm:text-xs"
const MOCK_CAPTION = "text-xs text-muted-foreground sm:text-sm"
const MOCK_TEXT = "text-[9px] text-foreground sm:text-[10px]"
const MOCK_TEXT_SM = "text-[8px] text-foreground sm:text-[9px]"
const MOCK_TEXT_MUTED = "text-[8px] text-muted-foreground"
const MOCK_TEXT_SUBTLE = "text-[7px] text-muted-foreground/75"
const MOCK_ICON_MUTED = "text-muted-foreground dark:text-white/70"
const MOCK_DIVIDER = "border-border dark:border-white/10"
const MOCK_CHIP =
  "flex size-4 items-center justify-center rounded border border-border bg-background/80 dark:border-white/10 dark:bg-black/35 sm:size-7 sm:rounded-md"

function MockShell({
  accent,
  children,
  className,
  density = "sparse",
  mirror = false,
}: {
  accent: string
  children: React.ReactNode
  className?: string
  density?: "dense" | "sparse"
  /** Flip sparse corner clusters toward the outer edge of the pair. */
  mirror?: boolean
}) {
  return (
    <div
      className={cn(MOCK_SHELL, className)}
      style={{
        borderColor: `${accent}99`,
        boxShadow: `inset 0 4px 80px -20px ${accent}55, 0 0 48px -8px ${accent}33`,
      }}
    >
      <HomePixelDecor accentColor={accent} density={density} mirror={mirror} />
      <div className="home-pipeline-mockup-grid pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.07]" />
      <div
        className="pointer-events-none absolute -inset-px rounded-[1.35rem] opacity-60"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${accent}22 0%, transparent 65%)`,
        }}
      />
      <div className="home-pipeline-mockup-body relative z-10 flex w-full min-h-0 flex-1 flex-col justify-center overflow-hidden">
        {children}
      </div>
    </div>
  )
}

/** One stem → N ends (control bar → agents, root → tasks). */
function FanConnectors({
  accent,
  count = 4,
  className,
}: {
  accent: string
  count?: number
  className?: string
}) {
  const width = 400
  const height = 44
  const midX = width / 2
  const forkY = 12
  const ends = Array.from({ length: count }, (_, i) => {
    const slot = width / count
    return slot * i + slot / 2
  })

  return (
    <svg
      className={cn("home-mock-connectors mx-auto block w-full shrink-0", className)}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden
      preserveAspectRatio="none"
    >
      <path
        d={`M${midX} 0 L${midX} ${forkY}`}
        stroke={accent}
        strokeWidth="1.5"
        strokeOpacity="0.95"
      />
      {ends.map((x, i) => (
        <path
          key={i}
          d={`M${midX} ${forkY} L${x} ${height}`}
          stroke={accent}
          strokeWidth="1.5"
          strokeOpacity="0.8"
        />
      ))}
    </svg>
  )
}

/** N tops → one stem (drafts → bundle). */
function MergeConnectors({
  accent,
  count = 4,
  className,
}: {
  accent: string
  count?: number
  className?: string
}) {
  const width = 400
  const height = 36
  const midX = width / 2
  const joinY = height - 10
  const starts = Array.from({ length: count }, (_, i) => {
    const slot = width / count
    return slot * i + slot / 2
  })

  return (
    <svg
      className={cn("home-mock-connectors mx-auto block w-full shrink-0", className)}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden
      preserveAspectRatio="none"
    >
      {starts.map((x, i) => (
        <path
          key={i}
          d={`M${x} 0 L${midX} ${joinY}`}
          stroke={accent}
          strokeWidth="1.5"
          strokeOpacity="0.75"
        />
      ))}
      <path
        d={`M${midX} ${joinY} L${midX} ${height}`}
        stroke={accent}
        strokeWidth="1.5"
        strokeOpacity="0.9"
      />
    </svg>
  )
}

function StemConnector({
  accent,
  className,
}: {
  accent: string
  className?: string
}) {
  return (
    <div
      className={cn("home-mock-stem mx-auto shrink-0", className)}
      style={{
        width: 1,
        background: `linear-gradient(180deg, ${accent}aa, ${accent}55)`,
        boxShadow: `0 0 8px ${accent}55`,
      }}
      aria-hidden
    />
  )
}

function GlassPedestal({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div className="flex w-full min-w-0 flex-col items-center">
      <div
        className="flex aspect-square w-[72%] max-w-[3.5rem] items-center justify-center rounded-md border bg-muted/60 dark:bg-black/40 sm:max-w-[3.75rem] sm:rounded-xl"
        style={{ borderColor: `${accent}88`, boxShadow: `0 0 24px ${accent}55` }}
      >
        {children}
      </div>
      <div
        className="-mt-0.5 h-1.5 w-[72%] max-w-[3.5rem] rounded-b-md opacity-60 sm:h-2 sm:max-w-[3.75rem] sm:rounded-b-lg"
        style={{ background: `linear-gradient(180deg, ${accent}66, transparent)` }}
      />
    </div>
  )
}

function MasterColumnCheck({ accent }: { accent: string }) {
  return (
    <span
      className="absolute right-1 top-1 flex size-2.5 items-center justify-center rounded-[2px] border sm:right-2.5 sm:top-2.5 sm:size-4 sm:rounded-[3px]"
      style={{ borderColor: `${accent}99`, background: `${accent}18` }}
      aria-hidden
    >
      <Check className="size-1.5 sm:size-2.5" style={{ color: accent }} strokeWidth={3} />
    </span>
  )
}

function MasterGoalLines({ accent }: { accent: string }) {
  return (
    <div className="mt-1.5 space-y-1 sm:mt-3 sm:space-y-1.5">
      {[0.92, 0.72].map((width) => (
        <div
          key={width}
          className="h-[2px] rounded-full sm:h-[3px]"
          style={{
            width: `${width * 100}%`,
            background: `linear-gradient(90deg, ${accent}55, ${accent}22)`,
          }}
        />
      ))}
    </div>
  )
}

function MasterGlassCube({
  accent,
  children,
}: {
  accent: string
  children: React.ReactNode
}) {
  return (
    <div className="home-master-cube-wrap flex w-full min-w-0 flex-col items-center">
      <div
        className="home-master-cube flex aspect-square w-[78%] max-w-[3.75rem] items-center justify-center rounded-md border sm:max-w-[4rem] sm:rounded-xl"
        style={{
          borderColor: `${accent}77`,
          ["--cube-accent" as string]: accent,
        }}
      >
        {children}
      </div>
      <div
        className="home-master-cube-base -mt-0.5 h-1.5 w-[78%] max-w-[3.75rem] rounded-b-md sm:h-2 sm:max-w-[4rem]"
        style={{
          background: `linear-gradient(180deg, ${accent}55 0%, ${accent}22 40%, transparent 100%)`,
          boxShadow: `0 0 16px ${accent}33`,
        }}
      />
    </div>
  )
}

const MASTER_AGENT_ICONS = [Search, Lightbulb, Calculator, Megaphone] as const
const UPLOAD_FILE_ICONS = [ImageIcon, Table2, FileText, FileText] as const

type MockupDecorProps = {
  density?: "dense" | "sparse"
  mirror?: boolean
}

export function MasterStageMockup({ density = "sparse", mirror = false }: MockupDecorProps) {
  const { domain } = usePipelineDomain()
  const accent = "#00FFFE"
  const { prompt, agents } = domain.master
  const agentCount = Math.min(agents, MASTER_AGENT_ICONS.length)

  return (
    <MockShell accent={accent} className="home-master-mockup" density={density} mirror={mirror}>
      <div className="home-master-mockup-inner mx-auto flex h-full w-full max-w-2xl flex-col justify-center gap-0">
        <div className="relative mb-0.5 text-center sm:mb-1.5">
          <div className="pointer-events-none absolute inset-x-0 top-1 hidden justify-center gap-12 opacity-70 sm:flex">
            <span className="home-master-float home-master-float--a size-3 rounded-full border border-border bg-muted/60 dark:border-white/20 dark:bg-white/10" />
            <span className="home-master-float home-master-float--b size-4 rotate-45 rounded border border-border bg-muted/40 dark:border-white/15 dark:bg-white/5" />
            <span className="home-master-float home-master-float--c size-2.5 rounded-full border border-border bg-muted/60 dark:border-white/20 dark:bg-white/10" />
          </div>
          <p className="relative line-clamp-2 px-0.5 text-[0.55rem] leading-tight text-muted-foreground sm:line-clamp-none sm:text-sm">
            You drop{" "}
            <span className="font-medium" style={{ color: accent }}>
              &ldquo;{prompt}&rdquo;
            </span>
          </p>
          <StemConnector accent={accent} className="mt-0.5 h-2 sm:mt-1.5 sm:h-3" />
          <div
            className="mx-auto flex size-3.5 items-center justify-center sm:size-5"
            style={{ color: accent, filter: `drop-shadow(0 0 8px ${accent})` }}
          >
            <ChevronDown className="size-3.5 sm:size-5" strokeWidth={2.5} aria-hidden />
          </div>
        </div>

        <div
          className="home-master-control-bar grid grid-cols-3 overflow-hidden rounded-lg border border-border bg-gradient-to-b from-muted/70 to-muted/40 backdrop-blur-md dark:border-transparent dark:from-white/[0.07] dark:to-black/45 sm:rounded-2xl"
          style={{
            borderColor: `${accent}55`,
            boxShadow: `inset 0 1px 0 ${accent}44, inset 0 -1px 0 ${accent}22, 0 0 40px ${accent}18`,
          }}
        >
          <div className={cn("relative border-r px-1 py-1.5 sm:px-4 sm:py-5", MOCK_DIVIDER)}>
            <MasterColumnCheck accent={accent} />
            <Target className="size-2.5 sm:size-[1.125rem]" style={{ color: accent }} />
            <p className="mt-0.5 text-[0.5rem] font-medium leading-tight text-foreground sm:mt-2 sm:text-xs">
              Goals
            </p>
            <MasterGoalLines accent={accent} />
          </div>

          <div className={cn("relative border-r px-1 py-1.5 sm:px-4 sm:py-5", MOCK_DIVIDER)}>
            <MasterColumnCheck accent={accent} />
            <Upload className="size-2.5 sm:size-[1.125rem]" style={{ color: accent }} />
            <p className="mt-0.5 text-[0.5rem] font-medium leading-tight text-foreground sm:mt-2 sm:text-xs">
              Uploads to use
            </p>
            <div className="mt-1 flex flex-wrap gap-0.5 sm:mt-3 sm:gap-1.5">
              {UPLOAD_FILE_ICONS.map((Icon, i) => (
                <span key={i} className={MOCK_CHIP}>
                  <Icon className={cn("size-2 sm:size-3.5", MOCK_ICON_MUTED)} />
                </span>
              ))}
            </div>
          </div>

          <div className="relative px-1 py-1.5 sm:px-4 sm:py-5">
            <MasterColumnCheck accent={accent} />
            <Users className="size-2.5 sm:size-[1.125rem]" style={{ color: accent }} />
            <p className="mt-0.5 text-[0.5rem] font-medium leading-tight text-foreground sm:mt-2 sm:text-xs">
              Agents to run
            </p>
            <div
              className="mt-1 inline-flex items-center gap-0.5 rounded border px-1 py-0.5 sm:mt-3 sm:gap-2 sm:rounded-lg sm:px-2 sm:py-1"
              style={{ borderColor: `${accent}55`, background: `${accent}0D` }}
            >
              <Minus className="size-2 text-muted-foreground dark:text-white/45 sm:size-3" />
              <span
                className="min-w-[0.75rem] text-center text-[0.625rem] font-bold sm:min-w-[1.25rem] sm:text-sm"
                style={{ color: accent }}
              >
                {agents}
              </span>
              <Plus className="size-2 text-muted-foreground dark:text-white/45 sm:size-3" />
            </div>
          </div>
        </div>

        <FanConnectors
          accent={accent}
          count={agentCount}
          className="h-4 max-w-lg sm:h-11"
        />

        <div className="home-master-cubes-row grid w-full grid-cols-4 gap-2 sm:gap-4 lg:gap-5">
          {MASTER_AGENT_ICONS.slice(0, agentCount).map((Icon, i) => (
            <MasterGlassCube key={i} accent={accent}>
              <Icon className="size-3 sm:size-6" style={{ color: accent }} strokeWidth={1.75} />
            </MasterGlassCube>
          ))}
        </div>

        <button
          type="button"
          className="home-master-cta mx-auto mt-2 flex w-full max-w-md items-center justify-center gap-1 rounded-full border py-1 text-[0.55rem] font-semibold sm:mt-5 sm:gap-2 sm:py-2.5 sm:text-sm"
          style={{
            ["--cta-accent" as string]: accent,
            borderColor: `${accent}88`,
            color: accent,
            boxShadow: `0 0 28px ${accent}33, inset 0 1px 0 ${accent}33`,
          }}
        >
          Start planning
          <ArrowRight className="size-2.5 sm:size-4" />
        </button>
      </div>
    </MockShell>
  )
}

const TASK_ICONS = [Search, DollarSign, Mail, ImageIcon] as const
const PARALLEL_ICONS = [Mail, Search, ImageIcon] as const

export function DecomposeStageMockup({ density = "sparse", mirror = false }: MockupDecorProps) {
  const { domain } = usePipelineDomain()
  const accent = "#FFA600"
  const { rootLabel, tasks } = domain.decomposer

  return (
    <MockShell accent={accent} density={density} mirror={mirror}>
      <div
        className="mx-auto mb-1 h-1.5 w-10 rounded-full opacity-80 sm:mb-3 sm:h-5 sm:w-20"
        style={{ background: `linear-gradient(90deg, ${accent}44, #a78bfa44, ${accent}44)` }}
      />
      <div
        className="mx-auto w-full rounded-lg border px-1.5 py-1.5 text-center text-[0.55rem] leading-tight sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
        style={{ borderColor: `${accent}88`, color: accent }}
      >
        {rootLabel}
      </div>

      <FanConnectors
        accent={accent}
        count={tasks.length}
        className="mt-0.5 h-4 sm:mt-1 sm:h-10"
      />

      <div className="mx-auto grid w-full grid-cols-4 gap-2 sm:gap-4 lg:gap-5">
        {tasks.map(({ label, dependency }, i) => {
          const Icon = TASK_ICONS[i] ?? Search
          return (
            <div key={label} className="relative flex min-w-0 flex-col items-center">
              <GlassPedestal accent={accent}>
                <Icon className="size-2.5 sm:size-5" style={{ color: accent }} />
              </GlassPedestal>
              <p className="mt-1 w-full truncate px-0.5 text-center text-[0.45rem] leading-tight text-foreground sm:mt-2 sm:text-[10px] sm:whitespace-normal sm:break-words">
                {label}
              </p>
              {dependency ? (
                <span
                  className="mt-0.5 hidden max-w-full truncate rounded-full border px-1.5 py-0.5 text-[8px] uppercase tracking-wide sm:mt-1 sm:inline"
                  style={{ borderColor: `${accent}66`, color: accent }}
                >
                  {dependency}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
    </MockShell>
  )
}

export function ParallelStageMockup({ density = "sparse", mirror = false }: MockupDecorProps) {
  const { domain } = usePipelineDomain()
  const accent = "#8750CC"
  const { items, waiting } = domain.parallel

  return (
    <MockShell accent={accent} density={density} mirror={mirror}>
      <div className="mb-1 flex justify-center sm:mb-2">
        <div
          className={cn(
            "flex size-6 items-center justify-center rounded-md border sm:size-10 sm:rounded-xl",
            MOCK_PANEL
          )}
          style={{ boxShadow: `0 0 20px ${accent}44` }}
        >
          <Users className="size-3 sm:size-5" style={{ color: accent }} />
        </div>
      </div>

      <StemConnector accent={accent} className="mb-1 h-2 sm:mb-2 sm:h-3" />

      <div className="grid grid-cols-3 gap-1 sm:gap-3">
        {items.map(({ label, doneAt }, i) => {
          const Icon = PARALLEL_ICONS[i] ?? Mail
          return (
            <div key={label} className="flex min-w-0 flex-col items-stretch">
              <div className={cn(MOCK_PANEL, "p-1 sm:p-3")}>
                <Icon className="size-2.5 sm:size-4" style={{ color: accent }} />
                <p className="mt-0.5 truncate text-[0.45rem] leading-tight text-foreground sm:mt-1 sm:text-[10px]">
                  {label}
                </p>
                <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-muted dark:bg-white/10 sm:mt-2 sm:h-1">
                  <div
                    className="home-pipeline-progress-bar h-full w-2/3 rounded-full"
                    style={{ background: accent }}
                  />
                </div>
                <p className="mt-0.5 hidden text-[8px] text-muted-foreground sm:mt-1 sm:block">
                  Running…
                </p>
              </div>
              <StemConnector accent={accent} className="my-0.5 h-2.5 sm:my-1 sm:h-4" />
              <div className={cn(MOCK_PANEL_SOFT, "p-1 text-center sm:p-2.5")}>
                <Check className="mx-auto size-2 sm:size-3" style={{ color: accent }} />
                <p className="text-[0.45rem] font-medium text-muted-foreground sm:text-[8px]">
                  Done
                </p>
                <p className="hidden text-[7px] text-muted-foreground/75 sm:block">{doneAt}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-1.5 flex items-center justify-between gap-1 sm:mt-3 sm:gap-2">
        <div
          className={cn(
            MOCK_PANEL_SOFT,
            "truncate px-1.5 py-1 text-[0.45rem] text-muted-foreground sm:px-3 sm:py-2 sm:text-[8px]"
          )}
        >
          <DollarSign
            className="mb-0.5 inline size-2 sm:mb-1 sm:size-3"
            style={{ color: accent }}
          />{" "}
          {waiting}
        </div>
        <button
          type="button"
          className="flex shrink-0 items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[0.45rem] sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[10px]"
          style={{ borderColor: `${accent}88`, color: accent }}
        >
          <List className="size-2 sm:size-3" />
          Task board
        </button>
      </div>
    </MockShell>
  )
}

export function AggregateStageMockup({ density = "sparse", mirror = false }: MockupDecorProps) {
  const { domain } = usePipelineDomain()
  const accent = "#B0F900"
  const mergeAccent = "#8750CC"
  const { drafts, packTitle, packDescription, readyLabel } = domain.aggregator

  return (
    <MockShell accent={accent} density={density} mirror={mirror}>
      <div className="grid grid-cols-4 gap-0.5 sm:gap-2">
        {drafts.map((label) => (
          <div key={label} className={cn(MOCK_PANEL_SM, "text-center")}>
            <span className="hidden text-[7px] uppercase tracking-wide text-muted-foreground/75 sm:inline">
              Draft
            </span>
            <FileText
              className="mx-auto my-0.5 size-2.5 sm:my-1 sm:size-4"
              style={{ color: accent }}
            />
            <p className="truncate text-[0.45rem] leading-tight text-foreground sm:text-[9px]">
              {label}
            </p>
            <Check
              className="mx-auto mt-0.5 size-2 sm:mt-1 sm:size-2.5"
              style={{ color: accent }}
            />
            <div
              className="mx-auto mt-0.5 h-0.5 w-full max-w-[2.5rem] rounded-full sm:mt-1"
              style={{ background: accent }}
            />
          </div>
        ))}
      </div>

      <MergeConnectors
        accent={mergeAccent}
        count={drafts.length}
        className="my-1 h-4 sm:my-2 sm:h-8"
      />

      <div
        className={cn(
          "mx-auto w-full rounded-lg border p-2 text-center sm:rounded-2xl sm:p-4",
          MOCK_PANEL
        )}
        style={{
          borderColor: `${mergeAccent}88`,
          boxShadow: `inset 0 0 40px ${mergeAccent}22, 0 0 32px ${accent}18`,
        }}
      >
        <div
          className={cn(
            "mx-auto flex size-7 items-center justify-center rounded-md sm:size-12 sm:rounded-xl",
            MOCK_PANEL_SOFT
          )}
        >
          <FileText className="size-3.5 sm:size-6" style={{ color: accent }} />
        </div>
        <p className="mt-1.5 text-[0.625rem] font-semibold text-foreground sm:mt-3 sm:text-sm">
          {packTitle}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[0.5rem] leading-tight text-muted-foreground sm:mt-1 sm:line-clamp-none sm:text-xs sm:leading-relaxed">
          {packDescription}
        </p>
        <Sparkles className="mx-auto mt-1 size-2.5 sm:mt-2 sm:size-4" style={{ color: accent }} />
      </div>

      <StemConnector accent={accent} className="mx-auto mt-1.5 h-2 sm:mt-2.5 sm:h-3" />

      <button
        type="button"
        className="mx-auto flex items-center gap-1 rounded-full border px-2 py-1 text-[0.5rem] font-medium sm:gap-2 sm:px-4 sm:py-2 sm:text-xs"
        style={{ borderColor: accent, color: accent, boxShadow: `0 0 18px ${accent}33` }}
      >
        <Users className="size-2 sm:size-3" />
        {readyLabel}
      </button>
    </MockShell>
  )
}

export function SuperviseStageMockup({ density = "sparse", mirror = false }: MockupDecorProps) {
  const { domain } = usePipelineDomain()
  const accent = "#00D27E"
  const { promptEcho, goals, uploads, agents, ctaLabel } = domain.supervisor

  return (
    <MockShell accent={accent} density={density} mirror={mirror}>
      <div
        className={cn(
          "mx-auto w-full rounded-lg px-1.5 py-1 text-center text-[0.5rem] leading-tight sm:rounded-2xl sm:px-3 sm:py-2 sm:text-xs",
          MOCK_PANEL,
          "text-muted-foreground"
        )}
      >
        &ldquo;You drop &apos;{promptEcho}&apos;&rdquo;
      </div>

      <StemConnector accent={accent} className="my-1 h-2 sm:my-2 sm:h-3" />

      <div className="mx-auto grid w-full grid-cols-3 gap-1 sm:gap-3">
        <div className={cn(MOCK_PANEL_SOFT, "p-1 sm:p-3")}>
          <Target className="size-2.5 sm:size-4" style={{ color: accent }} />
          <p className="mt-0.5 text-[0.5rem] font-medium text-foreground sm:mt-1 sm:text-[10px]">
            Goals
          </p>
          <ul className="mt-1 space-y-0.5 text-[0.4rem] text-muted-foreground sm:mt-2 sm:space-y-1 sm:text-[8px]">
            {goals.map((goal) => (
              <li key={goal} className="flex items-center gap-0.5 sm:gap-1">
                <Check className="size-1.5 shrink-0 sm:size-2.5" style={{ color: accent }} />
                <span className="truncate">{goal}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={cn(MOCK_PANEL_SOFT, "p-1 sm:p-3")}>
          <Upload className="size-2.5 sm:size-4" style={{ color: accent }} />
          <p className="mt-0.5 text-[0.5rem] font-medium text-foreground sm:mt-1 sm:text-[10px]">
            Uploads
          </p>
          <div className="mt-1 grid grid-cols-1 gap-0.5 text-[0.4rem] text-muted-foreground sm:mt-2 sm:grid-cols-2 sm:gap-1 sm:text-[7px]">
            {uploads.map((file) => (
              <span key={file} className="truncate">
                {file}
              </span>
            ))}
          </div>
        </div>
        <div className={cn(MOCK_PANEL_SOFT, "p-1 sm:p-3")}>
          <Users className="size-2.5 sm:size-4" style={{ color: accent }} />
          <p className="mt-0.5 text-[0.5rem] font-medium text-foreground sm:mt-1 sm:text-[10px]">
            Agents
          </p>
          <div className="mt-1 flex items-center justify-center gap-1 sm:mt-2 sm:gap-2">
            <Minus className="size-2 text-muted-foreground dark:text-white/50 sm:size-3" />
            <span className="text-[0.625rem] font-bold sm:text-sm" style={{ color: accent }}>
              {agents}
            </span>
            <Plus className="size-2 text-muted-foreground dark:text-white/50 sm:size-3" />
          </div>
          <p className="mt-0.5 hidden text-[7px] text-muted-foreground/75 sm:mt-1 sm:block">
            Recommended: 3–6
          </p>
        </div>
      </div>

      <StemConnector accent={accent} className="mx-auto my-1.5 h-2 sm:my-3 sm:h-3" />

      <button
        type="button"
        className="mx-auto flex w-full items-center justify-center gap-1 rounded-full border py-1 text-[0.55rem] font-semibold sm:gap-2 sm:py-2.5 sm:text-sm"
        style={{ borderColor: accent, color: accent, boxShadow: `0 0 24px ${accent}33` }}
      >
        {ctaLabel}
        <ChevronRight className="size-2.5 sm:size-4" />
      </button>
    </MockShell>
  )
}

const MOCKUPS = {
  master: MasterStageMockup,
  decomposer: DecomposeStageMockup,
  parallel: ParallelStageMockup,
  aggregator: AggregateStageMockup,
  supervisor: SuperviseStageMockup,
} as const

export type PipelineMockupKey = keyof typeof MOCKUPS

export function HomePipelineStageMockup({
  stageKey,
  density = "sparse",
  mirror = false,
}: {
  stageKey: PipelineMockupKey
  density?: "dense" | "sparse"
  mirror?: boolean
}) {
  const Component = MOCKUPS[stageKey]
  return <Component density={density} mirror={mirror} />
}
