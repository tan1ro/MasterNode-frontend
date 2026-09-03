"use client"

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTask, useTaskMetrics, useCreateTask, useAgentTemplates, useRagFiles } from "@/hooks"
import { ChatContextPanel } from "@/components/chat/chat-context-panel"
import {
  loadStoredRunContext,
  persistStoredRunContext,
  runContextToTaskOptions,
  type PipelineRunContext,
} from "@/lib/pipeline-run-context"
import { buildCreateTaskDefaults } from "@/lib/settings-preferences"
import type { ExecutionMetricsRow } from "@/types/api"
import ReactFlow, { Background, Handle, Position, type Edge, type Node, type NodeProps } from "reactflow"
import "reactflow/dist/style.css"
import { ChevronDown, ChevronUp, Play, Save, Check, X, RotateCcw, UserCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { tasksService } from "@/services/tasks"
import { ROUTES } from "@/lib/routes"
import type { AgentTemplateApi } from "@/types/api"

type DagStatus = "done" | "running" | "waiting"
type PipelineStatus = "Waiting" | "Running" | "Done"
type HumanValidationStatus =
  | "none"
  | "pending"
  | "approved"
  | "rejected"
  | "revision_requested"

interface AgentNodeData {
  label: string
  emoji: string
  status: DagStatus
}

const statusColors: Record<DagStatus, { border: string; bg: string; text: string }> = {
  done: { border: "#4ade80", bg: "rgba(74,222,128,0.08)", text: "#4ade80" },
  running: { border: "hsl(var(--violet))", bg: "hsl(var(--violet) / 0.12)", text: "hsl(var(--violet))" },
  waiting: { border: "hsl(var(--border))", bg: "hsl(var(--muted) / 0.5)", text: "hsl(var(--muted-foreground))" },
}

const AgentNode = memo(function AgentNode({ data }: NodeProps<AgentNodeData>) {
  const sc = statusColors[data.status] ?? statusColors.waiting
  return (
    <div
      className="text-center font-semibold"
      style={{
        background: sc.bg,
        border: `1.5px solid ${sc.border}`,
        borderRadius: 10,
        padding: "8px 16px",
        minWidth: 110,
        color: sc.text,
        fontSize: 11,
        fontFamily: "var(--font-sans), system-ui, sans-serif",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: sc.border, border: "none", width: 6, height: 6 }}
      />
      <div style={{ fontSize: 16, marginBottom: 2 }}>{data.emoji}</div>
      <div>{data.label}</div>
      {data.status === "running" && (
        <div className="text-[9px] mt-0.5 text-muted-foreground">● Processing…</div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: sc.border, border: "none", width: 6, height: 6 }}
      />
    </div>
  )
})

const NODE_LAYOUT: Array<{ id: string; position: { x: number; y: number }; emoji: string; label: string }> = [
  { id: "1", position: { x: 180, y: 10 }, emoji: "🎯", label: "Master" },
  { id: "2", position: { x: 180, y: 100 }, emoji: "🔀", label: "Decomposer" },
  { id: "3", position: { x: 20, y: 200 }, emoji: "🤖", label: "Agent 1" },
  { id: "4", position: { x: 170, y: 200 }, emoji: "🤖", label: "Agent 2" },
  { id: "5", position: { x: 320, y: 200 }, emoji: "🤖", label: "Agent 3" },
  { id: "6", position: { x: 180, y: 300 }, emoji: "🔗", label: "Aggregator" },
  { id: "7", position: { x: 180, y: 390 }, emoji: "👁️", label: "Supervisor" },
]

const EDGE_TEMPLATE: Omit<Edge, "animated">[] = [
  { id: "e1-2", source: "1", target: "2", style: { stroke: "#4ade80", strokeWidth: 1.5 } },
  { id: "e2-3", source: "2", target: "3", style: { stroke: "#4ade80", strokeWidth: 1.5 } },
  { id: "e2-4", source: "2", target: "4", style: { stroke: "#4ade80", strokeWidth: 1.5 } },
  { id: "e2-5", source: "2", target: "5", style: { stroke: "#4ade80", strokeWidth: 1.5 } },
  { id: "e3-6", source: "3", target: "6", style: { stroke: "#4ade80", strokeWidth: 1.5 } },
  { id: "e4-6", source: "4", target: "6", style: { stroke: "#4ade80", strokeWidth: 1.5 } },
  { id: "e5-6", source: "5", target: "6", style: { stroke: "#4ade80", strokeWidth: 1.5 } },
  { id: "e6-7", source: "6", target: "7", style: { stroke: "#4ade80", strokeWidth: 1.5 } },
]

export interface StageRow {
  id: string
  stage: string
  nodeId: string
  pipelineStatus: PipelineStatus
  llm: string
  time: string
  pct: number
  humanValidation: HumanValidationStatus
  validationNotes: string
}

const INITIAL_STAGES: StageRow[] = [
  {
    id: "master",
    stage: "Master Planner",
    nodeId: "1",
    pipelineStatus: "Done",
    llm: "GPT-4o",
    time: "1.2s",
    pct: 100,
    humanValidation: "none",
    validationNotes: "",
  },
  {
    id: "decomposer",
    stage: "Decomposer",
    nodeId: "2",
    pipelineStatus: "Done",
    llm: "GPT-4o",
    time: "0.8s",
    pct: 100,
    humanValidation: "none",
    validationNotes: "",
  },
  {
    id: "a1",
    stage: "Agent 1",
    nodeId: "3",
    pipelineStatus: "Done",
    llm: "DeepSeek R1",
    time: "3.4s",
    pct: 100,
    humanValidation: "none",
    validationNotes: "",
  },
  {
    id: "a2",
    stage: "Agent 2",
    nodeId: "4",
    pipelineStatus: "Running",
    llm: "GPT-4o",
    time: "—",
    pct: 62,
    humanValidation: "none",
    validationNotes: "",
  },
  {
    id: "a3",
    stage: "Agent 3",
    nodeId: "5",
    pipelineStatus: "Waiting",
    llm: "Gemini 1.5",
    time: "—",
    pct: 0,
    humanValidation: "none",
    validationNotes: "",
  },
  {
    id: "agg",
    stage: "Aggregator",
    nodeId: "6",
    pipelineStatus: "Waiting",
    llm: "GPT-4o",
    time: "—",
    pct: 0,
    humanValidation: "none",
    validationNotes: "",
  },
  {
    id: "sup",
    stage: "Supervisor",
    nodeId: "7",
    pipelineStatus: "Waiting",
    llm: "GPT-4o",
    time: "—",
    pct: 0,
    humanValidation: "none",
    validationNotes: "",
  },
]

const llmProviders = ["GPT-4o", "DeepSeek R1", "Gemini 1.5", "Mistral", "Claude 3.5", "Llama 3"] as const
const tabs = ["Final Output", "Per-Agent", "Conflicts", "Validation", "Human gates"] as const

function pipelineToDagStatus(s: PipelineStatus): DagStatus {
  if (s === "Done") return "done"
  if (s === "Running") return "running"
  return "waiting"
}

function PipelineStatusBadge({ status }: { status: PipelineStatus }) {
  const cls =
    status === "Done"
      ? "bg-emerald/15 text-emerald border-emerald/30"
      : status === "Running"
        ? "bg-violet/15 text-violet border-violet/30"
        : "bg-muted text-muted-foreground border-border"
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium", cls)}>
      {status}
    </span>
  )
}

function HumanGateBadge({
  hitlEnabled,
  status,
}: {
  hitlEnabled: boolean
  status: HumanValidationStatus
}) {
  if (!hitlEnabled) {
    return <span className="text-[10px] text-muted-foreground">Auto</span>
  }
  const map: Record<HumanValidationStatus, { label: string; className: string }> = {
    none: { label: "—", className: "text-muted-foreground" },
    pending: { label: "Awaiting you", className: "text-amber border border-amber/40 bg-amber/10 px-2 py-0.5 rounded-md" },
    approved: { label: "Approved", className: "text-emerald" },
    rejected: { label: "Rejected", className: "text-destructive" },
    revision_requested: { label: "Revision", className: "text-cyan border border-cyan/30 bg-cyan/10 px-2 py-0.5 rounded-md" },
  }
  const m = map[status]
  return <span className={cn("text-[10px] font-medium inline-flex items-center gap-1", m.className)}>{m.label}</span>
}

const STAGE_MS = 1100

function stagesFromServerMetrics(
  base: StageRow[],
  metrics: ExecutionMetricsRow | undefined,
  taskStatus: string | undefined
): StageRow[] {
  if (!metrics) return base
  const rows = base.map((r) => ({ ...r }))
  const nt = metrics.node_timings || {}
  for (const [name, raw] of Object.entries(nt)) {
    const dur = (raw as { duration_seconds?: number }).duration_seconds
    const tstr = typeof dur === "number" ? `${dur}s` : "—"
    const n = name.toLowerCase()
    if (n.includes("master") || n.includes("planner")) {
      rows[0] = { ...rows[0], time: tstr, pipelineStatus: "Done", pct: 100 }
    } else if (n.includes("decompos")) {
      rows[1] = { ...rows[1], time: tstr, pipelineStatus: "Done", pct: 100 }
    } else if (n.includes("aggregat")) {
      rows[5] = { ...rows[5], time: tstr, pipelineStatus: "Done", pct: 100 }
    } else if (n.includes("supervis")) {
      rows[6] = { ...rows[6], time: tstr, pipelineStatus: "Done", pct: 100 }
    }
  }
  const agents = metrics.agent_executions || []
  for (let i = 0; i < Math.min(3, agents.length); i++) {
    const ex = agents[i]
    const idx = 2 + i
    if (idx >= rows.length) break
    const ok = ex.success !== false
    rows[idx] = {
      ...rows[idx],
      pipelineStatus: ok ? "Done" : "Waiting",
      llm: ex.provider || rows[idx].llm,
      time: typeof ex.duration_seconds === "number" ? `${ex.duration_seconds}s` : rows[idx].time,
      pct: ok ? 100 : rows[idx].pct,
    }
  }
  if (taskStatus === "completed") {
    return rows.map((r) => ({
      ...r,
      pipelineStatus: "Done" as PipelineStatus,
      pct: 100,
      time: r.time === "—" && metrics.execution_time_seconds ? `${metrics.execution_time_seconds}s` : r.time,
    }))
  }
  if (taskStatus === "failed") {
    return rows.map((r, i) =>
      i === rows.length - 1
        ? { ...r, pipelineStatus: "Waiting" as PipelineStatus, pct: 0 }
        : { ...r, pipelineStatus: "Done" as PipelineStatus, pct: 100 }
    )
  }
  return rows
}

const PARALLEL_STAGE_IDS = new Set(["a1", "a2", "a3"])

export function ExecutePipelineView({ taskId: taskIdProp }: { taskId?: string | null } = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resolvedTaskId = taskIdProp ?? searchParams.get("taskId")
  const { data: taskFromApi } = useTask(resolvedTaskId, Boolean(resolvedTaskId))
  const { data: metricsPayload } = useTaskMetrics(resolvedTaskId, Boolean(resolvedTaskId))
  const { data: templatesData, isLoading: templatesLoading } = useAgentTemplates()
  const { data: ragFiles, isLoading: ragLoading } = useRagFiles()
  const ragList = useMemo(() => (Array.isArray(ragFiles) ? ragFiles : []), [ragFiles])
  const createTask = useCreateTask()

  const [mode, setMode] = useState("Auto")
  const [selectedLLM, setSelectedLLM] = useState<string>("GPT-4o")
  const [advanced, setAdvanced] = useState(false)
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Final Output")
  const [hitlEnabled, setHitlEnabled] = useState(true)
  const [stages, setStages] = useState<StageRow[]>(() => INITIAL_STAGES.map((s) => ({ ...s })))
  const [runState, setRunState] = useState<"idle" | "running" | "paused_hitl" | "done">("idle")
  const viewingLiveTask = Boolean(resolvedTaskId)

  useEffect(() => {
    if (!resolvedTaskId || !metricsPayload?.metrics) return
    const next = stagesFromServerMetrics(
      INITIAL_STAGES.map((s) => ({ ...s })),
      metricsPayload.metrics as ExecutionMetricsRow,
      taskFromApi?.status
    )
    setStages(next)
    if (taskFromApi?.status === "completed") setRunState("done")
    else if (taskFromApi?.status === "running" || taskFromApi?.status === "decomposing") setRunState("running")
    else setRunState("idle")
  }, [resolvedTaskId, metricsPayload, taskFromApi?.status])
  const [maxAgents, setMaxAgents] = useState(3)
  const [temperature, setTemperature] = useState(0.7)
  const [taskDraft, setTaskDraft] = useState("")
  const [runContext, setRunContext] = useState<PipelineRunContext>(() => loadStoredRunContext(ragList.length))
  /** Per parallel worker row: multiple executor templates */
  const [stageAgentTemplates, setStageAgentTemplates] = useState<Record<string, string[]>>({
    a1: [],
    a2: [],
    a3: [],
  })

  useEffect(() => {
    setRunContext(loadStoredRunContext(ragList.length))
  }, [ragList.length])

  const timersRef = useRef<number[]>([])
  const hitlRef = useRef(hitlEnabled)
  hitlRef.current = hitlEnabled
  const beginStageRef = useRef<(index: number) => void>(() => {})

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  const nodes: Node<AgentNodeData>[] = useMemo(() => {
    const byNode = new Map<string, PipelineStatus>()
    stages.forEach((s) => byNode.set(s.nodeId, s.pipelineStatus))
    return NODE_LAYOUT.map((n) => ({
      id: n.id,
      type: "agent",
      position: n.position,
      data: {
        label: n.label,
        emoji: n.emoji,
        status: pipelineToDagStatus(byNode.get(n.id) ?? "Waiting"),
      },
    }))
  }, [stages])

  const edges: Edge[] = useMemo(() => {
    const runningId = stages.find((s) => s.pipelineStatus === "Running")?.nodeId
    return EDGE_TEMPLATE.map((e) => {
      const anim = e.target === runningId || e.source === runningId
      return {
        ...e,
        animated: anim,
        style: {
          ...e.style,
          stroke:
            anim
              ? "hsl(var(--violet))"
              : pipelineToDagStatus(
                  stages.find((s) => s.nodeId === e.target)?.pipelineStatus ?? "Waiting"
                ) === "done"
                ? "#4ade80"
                : "hsl(var(--border))",
        },
      }
    })
  }, [stages])

  const nodeTypes = useMemo(() => ({ agent: AgentNode }), [])

  const resetDemo = useCallback(() => {
    clearTimers()
    if (viewingLiveTask && metricsPayload?.metrics && taskFromApi) {
      setStages(
        stagesFromServerMetrics(
          INITIAL_STAGES.map((s) => ({ ...s })),
          metricsPayload.metrics as ExecutionMetricsRow,
          taskFromApi.status
        )
      )
      setRunState(taskFromApi.status === "completed" ? "done" : "idle")
      return
    }
    setRunState("idle")
    setStages(
      INITIAL_STAGES.map((s) => ({
        ...s,
        humanValidation: "none" as HumanValidationStatus,
        validationNotes: "",
      }))
    )
  }, [clearTimers, viewingLiveTask, metricsPayload, taskFromApi])

  const completeStageAfterWork = useCallback((index: number) => {
    const time = `${(0.5 + Math.random() * 1.2).toFixed(1)}s`
    setStages((prev) => {
      const next = [...prev]
      if (index < 0 || index >= next.length) return prev
      next[index] = {
        ...next[index],
        pipelineStatus: "Done",
        pct: 100,
        time,
        humanValidation: hitlRef.current ? "pending" : next[index].humanValidation,
      }
      return next
    })
    if (hitlRef.current) {
      setRunState("paused_hitl")
      return
    }
    if (index + 1 < INITIAL_STAGES.length) {
      const t = window.setTimeout(() => beginStageRef.current(index + 1), 400)
      timersRef.current.push(t)
    } else {
      setRunState("done")
    }
  }, [])

  const beginStage = useCallback((index: number) => {
    if (index >= INITIAL_STAGES.length) {
      setRunState("done")
      return
    }
    setRunState("running")
    setStages((prev) => {
      const next = [...prev]
      for (let i = 0; i < next.length; i++) {
        if (i < index) {
          next[i] = {
            ...next[i],
            pipelineStatus: "Done",
            pct: 100,
            time: next[i].time === "—" ? `${(0.4 + i * 0.2).toFixed(1)}s` : next[i].time,
          }
        } else if (i === index) {
          next[i] = {
            ...next[i],
            pipelineStatus: "Running",
            pct: 18,
            time: "—",
          }
        } else {
          next[i] = { ...next[i], pipelineStatus: "Waiting", pct: 0, time: "—" }
        }
      }
      return next
    })
    const t = window.setTimeout(() => completeStageAfterWork(index), STAGE_MS)
    timersRef.current.push(t)
  }, [completeStageAfterWork])

  beginStageRef.current = beginStage

  const handleApprove = useCallback(
    (stageIndex: number) => {
      const stageId = stages[stageIndex]?.id
      if (viewingLiveTask && resolvedTaskId) {
        void tasksService.humanContinue(resolvedTaskId, { action: "approve", stage: stageId })
      }
      setStages((prev) => {
        const next = [...prev]
        if (stageIndex < 0 || stageIndex >= next.length) return prev
        next[stageIndex] = {
          ...next[stageIndex],
          humanValidation: "approved",
        }
        if (stageIndex + 1 < next.length) {
          next[stageIndex + 1] = {
            ...next[stageIndex + 1],
            pipelineStatus: "Running",
            pct: 22,
            time: "—",
          }
        }
        return next
      })

      setRunState("running")
      if (stageIndex + 1 < INITIAL_STAGES.length) {
        const t = window.setTimeout(() => beginStageRef.current(stageIndex + 1), 350)
        timersRef.current.push(t)
      } else {
        setRunState("done")
      }
    },
    [resolvedTaskId, stages, viewingLiveTask]
  )

  const handleReject = useCallback((stageId: string) => {
    if (viewingLiveTask && resolvedTaskId) {
      void tasksService.humanContinue(resolvedTaskId, { action: "reject", stage: stageId })
    }
    setStages((prev) =>
      prev.map((s) =>
        s.id === stageId ? { ...s, humanValidation: "rejected" } : s
      )
    )
    clearTimers()
    setRunState("idle")
  }, [clearTimers, resolvedTaskId, viewingLiveTask])

  const handleRequestRevision = useCallback((stageId: string, notes: string) => {
    if (viewingLiveTask && resolvedTaskId) {
      void tasksService.humanContinue(resolvedTaskId, { action: "revise", stage: stageId, notes })
    }
    setStages((prev) =>
      prev.map((s) =>
        s.id === stageId
          ? {
              ...s,
              humanValidation: "revision_requested",
              validationNotes: notes,
              pipelineStatus: "Running",
              pct: 12,
              time: "—",
            }
          : s
      )
    )
    setRunState("running")
    const t = window.setTimeout(() => {
      setStages((prev) =>
        prev.map((s) =>
          s.id === stageId
            ? {
                ...s,
                pipelineStatus: "Done",
                pct: 100,
                time: `${(1 + Math.random()).toFixed(1)}s`,
                humanValidation: "pending",
              }
            : s
        )
      )
      setRunState("paused_hitl")
    }, STAGE_MS)
    timersRef.current.push(t)
  }, [resolvedTaskId, viewingLiveTask])

  const mergeParallelTemplatesIntoContext = useCallback(
    (ctx: PipelineRunContext): PipelineRunContext => {
      const parallelSet = new Set(ctx.templateIds.parallel || [])
      for (const sid of PARALLEL_STAGE_IDS) {
        for (const id of stageAgentTemplates[sid] || []) parallelSet.add(id)
      }
      return {
        ...ctx,
        templateIds: {
          ...ctx.templateIds,
          parallel: parallelSet.size > 0 ? [...parallelSet] : ctx.templateIds.parallel || [],
        },
      }
    },
    [stageAgentTemplates]
  )

  const runPipeline = useCallback(() => {
    const text = taskDraft.trim()
    if (!viewingLiveTask && text) {
      const merged = mergeParallelTemplatesIntoContext(runContext)
      persistStoredRunContext(merged)
      const ctxOpts = runContextToTaskOptions(merged)
      const body = buildCreateTaskDefaults({
        task: text,
        ...ctxOpts,
      })
      createTask.mutate(body, {
        onSuccess: (data) => {
          if (data?.task_id) {
            router.push(`${ROUTES.taskExecute}?taskId=${encodeURIComponent(data.task_id)}`)
          }
        },
      })
      return
    }

    clearTimers()
    setRunState("running")
    setStages(
      INITIAL_STAGES.map((s) => ({
        ...s,
        pipelineStatus: "Waiting",
        pct: 0,
        time: "—",
        humanValidation: "none" as HumanValidationStatus,
        validationNotes: "",
      }))
    )
    const t = window.setTimeout(() => beginStage(0), 200)
    timersRef.current.push(t)
  }, [
    beginStage,
    clearTimers,
    createTask,
    hitlEnabled,
    maxAgents,
    mergeParallelTemplatesIntoContext,
    mode,
    router,
    runContext,
    taskDraft,
    viewingLiveTask,
  ])

  const waitingForApproval = stages.some((s) => s.humanValidation === "pending")

  const parallelExecutorTemplates = useMemo(() => {
    return (templatesData?.templates || []).filter((t) => (t.template_id || "").trim())
  }, [templatesData?.templates])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <div className="space-y-4">
        <Card accent="amber">
          <CardContent className="p-5 pt-5">
            <h2 className="text-foreground font-semibold text-sm mb-3">Task Description</h2>
            {viewingLiveTask && (
              <p className="text-[11px] text-muted-foreground mb-2">
                Viewing task <span className="font-mono text-foreground">{resolvedTaskId}</span>
                {taskFromApi?.status ? ` · ${taskFromApi.status}` : ""}
              </p>
            )}
            <textarea
              rows={5}
              readOnly={viewingLiveTask}
              value={viewingLiveTask ? (taskFromApi?.task ?? "") : taskDraft}
              placeholder="Describe the task you want to execute..."
              onChange={(e) => setTaskDraft(e.target.value)}
              className="w-full bg-background/80 border border-border rounded-lg px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-amber/40 resize-none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider mb-3">
              Execution Mode
            </div>
            <div className="flex gap-2">
              {(["Auto", "Sequential", "Parallel"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-medium transition-all border",
                    mode === m
                      ? "bg-amber/15 text-amber border-amber/30"
                      : "bg-muted/40 text-muted-foreground border-border hover:border-amber/20"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-amber/20 bg-amber/5 p-3">
              <Checkbox
                id="hitl"
                checked={hitlEnabled}
                onChange={(e) => setHitlEnabled(e.target.checked)}
              />
              <div className="space-y-1">
                <Label htmlFor="hitl" className="text-xs font-medium text-foreground cursor-pointer flex items-center gap-2">
                  <UserCheck className="h-3.5 w-3.5 text-amber" />
                  Human validation at each stage
                </Label>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  When enabled, the pipeline pauses after every stage so you can approve, reject, or request a revision before the next step runs.
                </p>
              </div>
            </div>

            <div className="text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">LLM Provider</div>
            <div className="grid grid-cols-3 gap-2">
              {llmProviders.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setSelectedLLM(l)}
                  className={cn(
                    "py-2 px-3 rounded-lg text-[11px] font-medium transition-all border text-center",
                    selectedLLM === l
                      ? "bg-amber/15 text-amber border-amber/30"
                      : "bg-muted/40 text-muted-foreground border-border hover:border-amber/20"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {!viewingLiveTask && (
          <ChatContextPanel
            value={runContext}
            onChange={(next) => {
              setRunContext(next)
              persistStoredRunContext(next)
            }}
            ragFiles={ragList}
            ragLoading={ragLoading}
            templates={templatesData?.templates}
            templatesLoading={templatesLoading}
            disabled={createTask.isPending}
          />
        )}

        <Card>
          <CardContent className="p-4">
            <button
              type="button"
              onClick={() => setAdvanced((a) => !a)}
              className="flex items-center justify-between w-full text-foreground text-xs font-medium"
            >
              <span>Advanced Options</span>
              {advanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {advanced && (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Max Agents</span>
                    <span>{maxAgents}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={maxAgents}
                    onChange={(e) => setMaxAgents(Number(e.target.value))}
                    className="w-full accent-amber"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Temperature</span>
                    <span>{temperature.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={Math.round(temperature * 10)}
                    onChange={(e) => setTemperature(Number(e.target.value) / 10)}
                    className="w-full accent-amber"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button
            className="flex-1 justify-center bg-amber text-amber-foreground hover:bg-amber/90 min-w-[140px]"
            onClick={runPipeline}
            disabled={
              viewingLiveTask
                ? runState === "running" || runState === "paused_hitl"
                : createTask.isPending || !taskDraft.trim()
            }
            title={
              viewingLiveTask
                ? "Approve stages below while the live task runs"
                : "Creates a task with Memory + template selections, then opens the live view"
            }
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            {createTask.isPending
              ? "Starting…"
              : viewingLiveTask
                ? runState === "running"
                  ? "Running…"
                  : runState === "paused_hitl"
                    ? "Awaiting approval…"
                    : "Run Pipeline"
                : "Run with context"}
          </Button>
          <Button variant="outline" className="flex-1 justify-center border-border min-w-[140px]" onClick={resetDemo}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            {viewingLiveTask ? "Reload task view" : "Reset demo"}
          </Button>
          <Button variant="ghost" className="flex-1 justify-center min-w-[140px]">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save as Template
          </Button>
        </div>

        {hitlEnabled && waitingForApproval && (
          <p className="text-[11px] text-amber flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
            Paused for human validation — use the actions in the stage table.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-foreground font-semibold text-sm mb-3">Pipeline DAG</h2>
            <div className="h-[260px] rounded-lg overflow-hidden bg-muted/20 border border-border/50">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                panOnDrag={false}
                zoomOnScroll={false}
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                proOptions={{ hideAttribution: true }}
              >
                <Background color="hsl(var(--border))" gap={20} size={1} />
              </ReactFlow>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-foreground font-semibold text-sm mb-3">Stage Progress</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[640px]">
                <thead>
                  <tr className="text-muted-foreground text-[10px] uppercase tracking-wider">
                    <th className="text-left pb-2 pr-2">Stage</th>
                    <th className="text-left pb-2 pr-2">Status</th>
                    <th className="text-left pb-2 pr-2">LLM</th>
                    <th className="text-left pb-2 pr-2">Time</th>
                    <th className="text-left pb-2 pr-2">Progress</th>
                    <th className="text-left pb-2 pr-2">Human gate</th>
                    <th className="text-left pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stages.map((s, stageIndex) => (
                    <StageTableRow
                      key={s.id}
                      row={s}
                      hitlEnabled={hitlEnabled}
                      parallelTemplates={parallelExecutorTemplates}
                      stageTemplateIds={stageAgentTemplates[s.id]}
                      onStageTemplatesChange={
                        PARALLEL_STAGE_IDS.has(s.id)
                          ? (ids) =>
                              setStageAgentTemplates((prev) => ({ ...prev, [s.id]: ids }))
                          : undefined
                      }
                      onApprove={() => handleApprove(stageIndex)}
                      onReject={() => handleReject(s.id)}
                      onRequestRevision={(notes) => handleRequestRevision(s.id, notes)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex gap-1 mb-4 border-b border-border pb-3 flex-wrap">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    activeTab === t ? "bg-amber/15 text-amber" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            {activeTab === "Final Output" && (
              <pre className="bg-muted/50 rounded-lg p-4 text-xs text-emerald overflow-x-auto leading-relaxed font-mono border border-border/50">
                {`{
  "status": "partial",
  "confidence": 0.87,
  "pipeline_id": "pipe_20240115_1042",
  "completed_stages": ["master", "decomposer", "agent_1"],
  "human_gates": ${JSON.stringify(
    Object.fromEntries(
      stages.map((x) => [
        x.id,
        hitlEnabled
          ? { validation: x.humanValidation, notes: x.validationNotes || undefined }
          : "skipped",
      ])
    ),
    null,
    2
  )},
  "output": {
    "summary": "Analysis in progress...",
    "agent_1_result": {
      "findings": ["Market growth 12% YoY", "3 key segments identified"],
      "confidence": 0.92
    }
  }
}`}
              </pre>
            )}
            {activeTab === "Per-Agent" && (
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="bg-muted/40 rounded-lg p-3 border border-border/50">
                  <div className="text-emerald font-medium mb-1">Agent 1 — Completed</div>
                  <div>Analyzed 1,240 data points across 3 segments…</div>
                </div>
                <div className="bg-muted/40 rounded-lg p-3 border border-border/50">
                  <div className="text-violet font-medium mb-1">Agent 2 — Running (62%)</div>
                  <div>Processing competitor analysis…</div>
                </div>
              </div>
            )}
            {activeTab === "Conflicts" && (
              <div className="text-xs text-muted-foreground text-center py-6">No conflicts detected yet.</div>
            )}
            {activeTab === "Validation" && (
              <div className="text-xs text-muted-foreground space-y-2">
                <p>
                  Automated checks (schema, policy, tool outputs) will appear here when the backend is connected.
                </p>
                <p className="text-[11px] text-muted-foreground/80">
                  With human-in-the-loop enabled, your per-stage decisions are recorded alongside automated validation results.
                </p>
              </div>
            )}
            {activeTab === "Human gates" && (
              <ul className="text-xs space-y-2 text-muted-foreground">
                {stages.map((s) => (
                  <li key={s.id} className="flex justify-between gap-4 border-b border-border/40 pb-2 last:border-0">
                    <span className="text-foreground font-medium">{s.stage}</span>
                    <span className="shrink-0">
                      {hitlEnabled ? (
                        <>
                          {s.humanValidation === "approved" && (
                            <span className="text-emerald inline-flex items-center gap-1">
                              <Check className="h-3 w-3" /> Approved
                            </span>
                          )}
                          {s.humanValidation === "rejected" && (
                            <span className="text-destructive inline-flex items-center gap-1">
                              <X className="h-3 w-3" /> Rejected
                            </span>
                          )}
                          {s.humanValidation === "pending" && (
                            <span className="text-amber">Awaiting decision</span>
                          )}
                          {s.humanValidation === "revision_requested" && (
                            <span className="text-cyan">Revision requested</span>
                          )}
                          {s.humanValidation === "none" && <span className="text-muted-foreground">—</span>}
                        </>
                      ) : (
                        <span className="text-muted-foreground">Skipped (HITL off)</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StageTableRow({
  row,
  hitlEnabled,
  parallelTemplates,
  stageTemplateIds,
  onStageTemplatesChange,
  onApprove,
  onReject,
  onRequestRevision,
}: {
  row: StageRow
  hitlEnabled: boolean
  parallelTemplates: AgentTemplateApi[]
  stageTemplateIds?: string[]
  onStageTemplatesChange?: (ids: string[]) => void
  onApprove: () => void
  onReject: () => void
  onRequestRevision: (notes: string) => void
}) {
  const [draftNotes, setDraftNotes] = useState("")
  const [agentsOpen, setAgentsOpen] = useState(false)

  const showHitlActions =
    hitlEnabled && row.humanValidation === "pending" && row.pipelineStatus === "Done"

  const showAgentPicker = Boolean(onStageTemplatesChange) && parallelTemplates.length > 0

  return (
    <>
      <tr className="border-t border-border/50 align-top">
        <td className="py-2 pr-2 text-foreground font-medium">
          <div>{row.stage}</div>
          {showAgentPicker && (
            <button
              type="button"
              className="text-[10px] text-amber hover:underline mt-0.5"
              onClick={() => setAgentsOpen((v) => !v)}
            >
              {(stageTemplateIds?.length || 0) > 0
                ? `${stageTemplateIds?.length} agent(s)`
                : "Assign agents"}
            </button>
          )}
        </td>
        <td className="py-2 pr-2">
          <PipelineStatusBadge status={row.pipelineStatus} />
        </td>
        <td className="py-2 pr-2 text-muted-foreground">{row.llm}</td>
        <td className="py-2 pr-2 text-muted-foreground font-mono">{row.time}</td>
        <td className="py-2 pr-2 w-28">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${row.pct}%`,
                background:
                  row.pipelineStatus === "Done"
                    ? "#4ade80"
                    : row.pipelineStatus === "Running"
                      ? "hsl(var(--violet))"
                      : "hsl(var(--border))",
              }}
            />
          </div>
        </td>
        <td className="py-2 pr-2">
          <HumanGateBadge hitlEnabled={hitlEnabled} status={row.humanValidation} />
        </td>
        <td className="py-2">
          {showHitlActions ? (
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[10px] px-2 border-emerald/30 text-emerald hover:bg-emerald/10"
                onClick={onApprove}
              >
                <Check className="h-3 w-3 mr-0.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[10px] px-2 border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={onReject}
              >
                <X className="h-3 w-3 mr-0.5" />
                Reject
              </Button>
            </div>
          ) : hitlEnabled && row.humanValidation === "revision_requested" ? (
            <span className="text-[10px] text-cyan">Re-running…</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </td>
      </tr>
      {showAgentPicker && agentsOpen && (
        <tr className="border-0">
          <td colSpan={7} className="pb-2 pt-0">
            <div className="rounded-lg border border-border/50 bg-muted/20 p-2 max-h-28 overflow-y-auto space-y-1">
              <p className="text-[10px] text-muted-foreground mb-1">Executor templates for this worker</p>
              {parallelTemplates.map((t) => {
                const id = t.template_id || ""
                if (!id) return null
                const checked = (stageTemplateIds || []).includes(id)
                return (
                  <label key={id} className="flex items-center gap-2 text-[10px] cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={checked}
                      onChange={() => {
                        const cur = stageTemplateIds || []
                        onStageTemplatesChange?.(
                          checked ? cur.filter((x) => x !== id) : [...cur, id]
                        )
                      }}
                    />
                    <span className="truncate">{t.name || id}</span>
                  </label>
                )
              })}
            </div>
          </td>
        </tr>
      )}
      {showHitlActions && (
        <tr className="border-0">
          <td colSpan={7} className="pb-3 pt-0 px-0">
            <div className="ml-0 rounded-lg border border-amber/20 bg-muted/30 p-3 space-y-2">
              <Label className="text-[10px] text-muted-foreground">Optional feedback if you request a revision</Label>
              <Textarea
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                placeholder="What should change before continuing?"
                rows={2}
                className="text-xs bg-background border-border"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[10px] border-border"
                onClick={() => onRequestRevision(draftNotes)}
              >
                Request revision &amp; re-run stage
              </Button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
