import {
  extractLooseYamlPlanFields,
  looksLikeJsonPlanBlob,
  looksLikeRawPlanDump,
  normalizePlanMarkdown,
  buildPlanMarkdownFromFields,
  type NormalizedPlanJsonFields,
} from "@/lib/pipeline-plan-normalize"

export type PlanTodoStatus = "pending" | "in_progress" | "completed" | "cancelled"

export interface ParsedPlanTodo {
  id: string
  content: string
  status: PlanTodoStatus
}

export interface ParsedPlanView {
  filename: string
  title: string
  overview: string
  todos: ParsedPlanTodo[]
  objective?: string
  requiredInputs: string[]
  outline: string[]
  modules: string[]
  deliverables: string[]
  clarificationUpdates: string[]
  yourChoices: string[]
}

function parseMarkdownSection(body: string, heading: string): string {
  const re = new RegExp(`##\\s*${heading}\\s*\\n+([\\s\\S]*?)(?=\\n##|\\n#|$)`, "i")
  const match = body.match(re)
  if (!match) return ""
  return match[1].replace(/^-\s+/gm, "").replace(/\n+/g, " ").trim()
}

function parseMarkdownBulletList(body: string, heading: string): string[] {
  const re = new RegExp(`##\\s*${heading}\\s*\\n+([\\s\\S]*?)(?=\\n##|\\n#|$)`, "i")
  const match = body.match(re)
  if (!match) return []
  return [...match[1].matchAll(/^-\s+(.+)$/gm)]
    .map((m) => m[1].trim())
    .filter(Boolean)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
}

function normalizeTodoStatus(raw: unknown): PlanTodoStatus {
  const s = String(raw || "pending")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
  if (s === "in-progress" || s === "in progress" || s === "running") return "in_progress"
  if (s === "completed" || s === "done") return "completed"
  if (s === "cancelled" || s === "canceled") return "cancelled"
  return "pending"
}

function parseYamlFrontmatter(markdown: string): {
  meta: Record<string, unknown>
  body: string
} | null {
  const trimmed = markdown.trimStart()
  if (!trimmed.startsWith("---")) return null
  const end = trimmed.indexOf("\n---", 3)
  if (end < 0) return null
  const yamlBlock = trimmed.slice(3, end).trim()
  const body = trimmed.slice(end + 4).trimStart()
  const meta: Record<string, unknown> = {}

  let currentKey: string | null = null
  let inTodos = false
  let currentTodo: Record<string, unknown> | null = null
  const todos: Record<string, unknown>[] = []

  for (const line of yamlBlock.split("\n")) {
    if (inTodos) {
      if (/^\s{2}-\s/.test(line)) {
        if (currentTodo) todos.push(currentTodo)
        currentTodo = {}
        const rest = line.replace(/^\s{2}-\s+/, "").trim()
        const kv = rest.match(/^([\w-]+):\s*(.*)$/)
        if (kv) currentTodo[kv[1]] = kv[2].trim()
        continue
      }
      if (/^\s{4}([\w-]+):\s*(.*)$/.test(line) && currentTodo) {
        const kv = line.match(/^\s{4}([\w-]+):\s*(.*)$/)
        if (kv) currentTodo[kv[1]] = kv[2].trim()
        continue
      }
      if (!/^\s/.test(line)) {
        if (currentTodo) todos.push(currentTodo)
        inTodos = false
        currentTodo = null
      } else {
        continue
      }
    }

    const top = line.match(/^([\w-]+):\s*(.*)$/)
    if (!top) continue
    const [, key, value] = top
    if (key === "todos" && !value) {
      inTodos = true
      currentTodo = null
      continue
    }
    meta[key] = value
  }
  if (inTodos && currentTodo) todos.push(currentTodo)
  if (todos.length > 0) meta.todos = todos

  return { meta, body }
}

function parseCheckboxTodos(text: string): ParsedPlanTodo[] {
  const todos: ParsedPlanTodo[] = []
  const re = /^-\s+\[([ xX])\]\s+(.+)$/gm
  let match: RegExpExecArray | null
  let index = 0
  while ((match = re.exec(text)) !== null) {
    const checked = match[1].toLowerCase() === "x"
    todos.push({
      id: `todo-${index + 1}`,
      content: match[2].trim(),
      status: checked ? "completed" : "pending",
    })
    index += 1
  }
  return todos
}

function parseSectionBulletsAsTodos(body: string): ParsedPlanTodo[] {
  const sections = ["## Steps", "## Approach", "## Structure", "## Outline", "## Deliverables"]
  for (const heading of sections) {
    const idx = body.indexOf(heading)
    if (idx < 0) continue
    const slice = body.slice(idx + heading.length)
    const nextHeading = slice.search(/\n##\s+/)
    const block = nextHeading >= 0 ? slice.slice(0, nextHeading) : slice
    const bullets = [...block.matchAll(/^-\s+(.+)$/gm)].map((m) => m[1].trim()).filter(Boolean)
    if (bullets.length > 0) {
      return bullets.map((content, i) => ({
        id: `step-${i + 1}`,
        content,
        status: i === 0 ? "in_progress" : "pending",
      }))
    }
  }
  return []
}

function extractTitle(body: string, metaName?: string): string {
  const fromMeta = metaName?.trim()
  if (fromMeta && !looksLikeRawPlanDump(fromMeta)) return fromMeta
  const loose = extractLooseYamlPlanFields(body)
  if (loose.name) return loose.name
  const h1 = body.match(/^#\s+(.+)$/m)
  if (h1 && !looksLikeRawPlanDump(h1[1])) return h1[1].trim()
  return "Pipeline plan"
}

function extractOverview(body: string, metaOverview?: string): string {
  const fromMeta = metaOverview?.trim()
  if (fromMeta && !looksLikeRawPlanDump(fromMeta) && !looksLikeJsonPlanBlob(fromMeta)) {
    return fromMeta
  }
  const loose = extractLooseYamlPlanFields(body)
  if (loose.overview) return loose.overview
  if (looksLikeJsonPlanBlob(body) || looksLikeRawPlanDump(body)) {
    return "Review the steps below, edit if needed, then continue to run the pipeline."
  }
  const goal = body.match(/##\s*Goal\s*\n+([\s\S]*?)(?=\n##|\n#|$)/i)
  if (goal) {
    const text = goal[1].replace(/^-\s+/gm, "").replace(/\n+/g, " ").trim()
    if (text && !looksLikeRawPlanDump(text)) return text
  }
  const paragraphs = body
    .replace(/^#.+$/m, "")
    .replace(/^##.+$/gm, "")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/^[-*]\s+/gm, "").replace(/\n+/g, " ").trim())
    .filter((p) => p.length > 40 && !looksLikeRawPlanDump(p))
  return paragraphs[0] || "Review the steps below, edit if needed, then continue to run the pipeline."
}

function todosFromMeta(metaTodos: unknown): ParsedPlanTodo[] {
  if (!Array.isArray(metaTodos)) return []
  return metaTodos
    .map((item, index) => {
      if (!item || typeof item !== "object") return null
      const row = item as Record<string, unknown>
      const content = String(row.content || row.task || row.title || row.text || "").trim()
      if (!content) return null
      return {
        id: String(row.id || `todo-${index + 1}`),
        content,
        status: normalizeTodoStatus(row.status),
      }
    })
    .filter((t): t is ParsedPlanTodo => t !== null)
}

export function parsePipelinePlanMarkdown(
  markdown: string,
  options?: { taskId?: string; intentKind?: string; modulesFromPayload?: string[] }
): ParsedPlanView {
  const normalized = normalizePlanMarkdown(markdown, {
    modulesFromPayload: options?.modulesFromPayload,
  })
  const fm = parseYamlFrontmatter(normalized)
  const body = fm?.body ?? normalized
  const meta = fm?.meta ?? {}

  const title = extractTitle(body, String(meta.name || ""))
  const overview = extractOverview(body, String(meta.overview || ""))
  const taskSuffix = (options?.taskId || "").replace(/^api-/, "").slice(0, 12)
  const filename = taskSuffix
    ? `${slugify(title) || "pipeline-plan"}_${taskSuffix}.plan.md`
    : `${slugify(title) || "pipeline-plan"}.plan.md`

  let todos = todosFromMeta(meta.todos)
  if (todos.length === 0) todos = parseCheckboxTodos(body)
  if (todos.length === 0) todos = parseSectionBulletsAsTodos(body)

  if (todos.length === 0) {
    todos = [
      {
        id: "execute",
        content: `Run ${options?.intentKind || "pipeline"} deliverable generation`,
        status: "in_progress",
      },
      {
        id: "validate",
        content: "Validate output and surface in chat",
        status: "pending",
      },
    ]
  }

  const hasActive = todos.some((t) => t.status === "in_progress")
  if (!hasActive) {
    const firstPending = todos.findIndex((t) => t.status === "pending")
    if (firstPending >= 0) {
      todos = todos.map((t, i) =>
        i === firstPending ? { ...t, status: "in_progress" as const } : t
      )
    }
  }

  return {
    filename,
    title,
    overview,
    todos,
    ...parsePlanStructuredSections(normalized, options?.modulesFromPayload),
  }
}

const DEFAULT_MODULES = [
  "Master",
  "Requirement Extractor",
  "Planner",
  "Prompt Builder",
  "Validator",
  "Output Generator",
]

export function parsePlanStructuredSections(
  markdown: string,
  modulesFromPayload?: string[]
): Pick<
  ParsedPlanView,
  | "objective"
  | "requiredInputs"
  | "outline"
  | "modules"
  | "deliverables"
  | "clarificationUpdates"
  | "yourChoices"
> {
  const normalized = normalizePlanMarkdown(markdown, { modulesFromPayload })
  const fm = parseYamlFrontmatter(normalized)
  const body = fm?.body ?? normalized
  const objective = parseMarkdownSection(body, "Objective")
  const requiredInputs = parseMarkdownBulletList(body, "Required Inputs")
  const outline = parseMarkdownBulletList(body, "Outline")
  const modules =
    parseMarkdownBulletList(body, "Selected Modules").length > 0
      ? parseMarkdownBulletList(body, "Selected Modules")
      : modulesFromPayload?.length
        ? modulesFromPayload
        : DEFAULT_MODULES
  const deliverables = parseMarkdownBulletList(body, "Expected Deliverables")
  const clarificationUpdates = parseMarkdownBulletList(body, "Clarification updates")
  const yourChoices = parseMarkdownBulletList(body, "Your choices")
  return {
    objective,
    requiredInputs,
    outline,
    modules,
    deliverables,
    clarificationUpdates,
    yourChoices,
  }
}

export function planTodoCounts(todos: ParsedPlanTodo[]): {
  remaining: number
  completed: number
  total: number
} {
  const completed = todos.filter((t) => t.status === "completed").length
  const remaining = todos.filter(
    (t) => t.status === "pending" || t.status === "in_progress"
  ).length
  return { remaining, completed, total: todos.length }
}

/** Convert a parsed plan view into fields suitable for form editing / markdown rebuild. */
export function parsedPlanToEditorFields(
  view: ParsedPlanView
): NormalizedPlanJsonFields {
  return {
    name: view.title,
    overview: view.overview,
    objective: view.objective,
    requiredInputs: view.requiredInputs,
    outline: view.outline,
    modules: view.modules,
    deliverables: view.deliverables,
    clarificationUpdates: view.clarificationUpdates,
    yourChoices: view.yourChoices,
    todos: view.todos.map((todo) => ({
      id: todo.id,
      content: todo.content,
      status: todo.status,
    })),
  }
}

/** Rebuild canonical plan markdown from the friendly editor fields. */
export function buildPlanMarkdownFromEditorFields(
  fields: NormalizedPlanJsonFields
): string {
  return buildPlanMarkdownFromFields(fields)
}

/**
 * Drive plan todo statuses from pipeline stage progress so the checklist
 * ticks one-by-one as stages complete.
 */
export function syncPlanTodosToStageProgress(
  todos: ParsedPlanTodo[],
  completedStages: number,
  options?: { allDone?: boolean; isActive?: boolean }
): ParsedPlanTodo[] {
  const actionable = todos.filter((todo) => todo.status !== "cancelled")
  if (actionable.length === 0) return todos

  const doneCount = options?.allDone
    ? actionable.length
    : Math.min(actionable.length, Math.max(0, Math.floor(completedStages)))

  const isActive = options?.isActive !== false && !options?.allDone
  const inProgressIndex =
    isActive && doneCount < actionable.length ? doneCount : -1

  let ordinal = 0
  return todos.map((todo) => {
    if (todo.status === "cancelled") return todo
    const index = ordinal
    ordinal += 1
    if (index < doneCount) return { ...todo, status: "completed" as const }
    if (index === inProgressIndex) return { ...todo, status: "in_progress" as const }
    return { ...todo, status: "pending" as const }
  })
}

export function visiblePlanTodos(todos: ParsedPlanTodo[]): ParsedPlanTodo[] {
  const open = todos.filter((t) => t.status !== "completed" && t.status !== "cancelled")
  return open.length > 0 ? open : todos.slice(-2)
}
