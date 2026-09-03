/**
 * Normalize pipeline plan markdown when the LLM returns JSON blobs or malformed frontmatter.
 */

export function looksLikeJsonPlanBlob(text: string): boolean {
  const trimmed = (text || "").trim()
  if (!trimmed.startsWith("{")) return false
  return (
    trimmed.includes('"plan_markdown"') ||
    trimmed.includes('"## Objective"') ||
    trimmed.includes('"name"') ||
    trimmed.includes('"overview"')
  )
}

/** Strip wrapping ``` / ```yaml fences LLMs often wrap plan markdown in. */
export function unwrapPlanMarkdownFence(text: string): string {
  let s = (text || "").trim()
  if (!s) return s

  // Full fence with optional language tag (yaml|yml|markdown|md|plan).
  const fenced = s.match(/^```(?:ya?ml|markdown|md|plan)?\s*\n?([\s\S]*?)\n?```$/i)
  if (fenced?.[1]) return fenced[1].trim()

  // Opening fence only (closing fence missing).
  if (/^```(?:ya?ml|markdown|md|plan)?\b/i.test(s)) {
    s = s.replace(/^```(?:ya?ml|markdown|md|plan)?\s*/i, "").trim()
    s = s.replace(/\n?```\s*$/i, "").trim()
  }

  return s
}

/** True when text looks like raw YAML/frontmatter dump rather than a human overview. */
export function looksLikeRawPlanDump(text: string): boolean {
  const t = (text || "").trim()
  if (!t) return true
  if (t.includes("```")) return true
  if (/^ya?ml\b/i.test(t)) return true
  // Smashed one-liner with multiple yaml keys.
  if (!t.includes("\n") && /\bname\s*:\s*.+\boverview\s*:/i.test(t)) return true
  // Frontmatter block used as a single field value (no markdown body sections).
  if (
    /^---/.test(t) &&
    /\b(?:name|overview|todos)\s*:/i.test(t) &&
    !/\n##\s+/.test(t) &&
    t.length < 800
  ) {
    return true
  }
  return false
}

/**
 * Pull `name` / `overview` from messy single-line or multi-line YAML without
 * requiring a valid `---` frontmatter block.
 */
export function extractLooseYamlPlanFields(source: string): {
  name?: string
  overview?: string
} {
  const text = unwrapPlanMarkdownFence(source)
  if (!text) return {}

  const NEXT_KEY = "name|title|overview|summary|todos|objective|modules"
  const smashedField = (key: string): string | undefined => {
    const re = new RegExp(
      `(?:^|[\\s\`])${key}\\s*:\\s*(.+?)(?=\\s+(?:${NEXT_KEY})\\s*:|\\s*---|$)`,
      "i"
    )
    const match = text.match(re)
    if (!match?.[1]) return undefined
    return match[1].trim().replace(/^["']|["']$/g, "") || undefined
  }

  const lineField = (key: string): string | undefined => {
    const match = text.match(new RegExp(`(?:^|\\n)\\s*${key}\\s*:\\s*([^\\n]+)`, "i"))
    if (!match?.[1]) return undefined
    const value = match[1].trim().replace(/^["']|["']$/g, "")
    if (key === "name" && /\boverview\s*:/i.test(value)) return undefined
    return value || undefined
  }

  const pick = (key: "name" | "title" | "overview" | "summary") => {
    if (!text.includes("\n")) return smashedField(key)
    return lineField(key) || smashedField(key)
  }

  const name = pick("name") || pick("title")
  const overview = pick("overview") || pick("summary")
  return {
    name: name && !looksLikeRawPlanDump(name) ? name : undefined,
    overview: overview && !looksLikeRawPlanDump(overview) ? overview : undefined,
  }
}

/** Ensure plan text starts with `---` frontmatter when it has name/overview keys. */
export function ensureYamlFrontmatterWrapper(text: string): string {
  const trimmed = unwrapPlanMarkdownFence(text).trim()
  if (!trimmed) return trimmed
  if (trimmed.startsWith("---")) return trimmed

  const hasYamlKeys =
    /^(?:name|title|overview)\s*:/im.test(trimmed) || /\boverview\s*:/i.test(trimmed)
  if (!hasYamlKeys) return trimmed

  const loose = extractLooseYamlPlanFields(trimmed)
  if (!loose.name && !loose.overview) return trimmed

  // Smashed one-liner — rebuild clean frontmatter.
  if (!trimmed.includes("\n") && (loose.name || loose.overview)) {
    const overview = (loose.overview || "").replace(/\n/g, " ")
    const name = loose.name || "Pipeline plan"
    return `---\nname: ${name}\noverview: ${overview}\n---\n\n# ${name}\n`
  }

  // Multi-line: split yaml header from markdown body at first ## or blank+# heading.
  const bodySplit = trimmed.search(/\n(?=##\s|#\s)/)
  if (bodySplit >= 0) {
    const yamlPart = trimmed.slice(0, bodySplit).trim()
    const bodyPart = trimmed.slice(bodySplit).trim()
    if (/^(?:name|title|overview)\s*:/im.test(yamlPart)) {
      return `---\n${yamlPart}\n---\n\n${bodyPart}`
    }
  }

  // Already has a closing --- somewhere — prefix opening fence.
  if (/\n---\s*(\n|$)/.test(trimmed)) {
    return `---\n${trimmed.replace(/^\s*---\s*/, "")}`
  }

  return trimmed
}

/** LLMs often emit invalid JSON (orphan `"---",`, trailing commas, bad escapes). */
export function sanitizePlanJsonText(text: string): string {
  let s = (text || "").trim()
  if (!s.startsWith("{")) return s
  // Remove bare `"---",` tokens that break JSON.parse.
  s = s.replace(/,\s*"\s*---\s*"\s*,/g, ",")
  s = s.replace(/,\s*"\s*---\s*"\s*(?=[,}])/g, "")
  // Trailing commas before closing braces/brackets.
  s = s.replace(/,\s*([}\]])/g, "$1")
  return s
}

function decodeJsonStringFragment(raw: string): string {
  return raw
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")
}

function extractJsonStringValue(source: string, key: string): string | undefined {
  const re = new RegExp(`"${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`)
  const match = source.match(re)
  if (!match?.[1]) return undefined
  return decodeJsonStringFragment(match[1]).trim() || undefined
}

function extractJsonStringArray(source: string, key: string): string[] {
  const re = new RegExp(`"${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\s*:\\s*\\[([^\\]]*)\\]`)
  const match = source.match(re)
  if (!match?.[1]) return []
  return [...match[1].matchAll(/"((?:\\.|[^"\\])*)"/g)]
    .map((m) => decodeJsonStringFragment(m[1]).trim())
    .filter(Boolean)
}

function extractTodosFromLooseJson(source: string): NormalizedPlanJsonFields["todos"] {
  const todos: NonNullable<NormalizedPlanJsonFields["todos"]> = []
  const re =
    /\{\s*"task"\s*:\s*"((?:\\.|[^"\\])*)"\s*,\s*"status"\s*:\s*"((?:\\.|[^"\\])*)"\s*\}/g
  let match: RegExpExecArray | null
  while ((match = re.exec(source)) !== null) {
    const task = decodeJsonStringFragment(match[1]).trim()
    const status = decodeJsonStringFragment(match[2]).trim()
    if (task) todos.push({ task, status })
  }
  return todos
}

/** Regex fallback when JSON.parse fails on LLM output. */
export function extractPlanFieldsFromLooseJson(source: string): NormalizedPlanJsonFields {
  const name = extractJsonStringValue(source, "name") || extractJsonStringValue(source, "title")
  const overview =
    extractJsonStringValue(source, "overview") || extractJsonStringValue(source, "summary")
  const objective =
    extractJsonStringValue(source, "## Objective") ||
    extractJsonStringValue(source, "Objective") ||
    extractJsonStringValue(source, "objective")

  const requiredRaw =
    extractJsonStringValue(source, "## Required Inputs") ||
    extractJsonStringValue(source, "Required Inputs")
  const requiredInputs = requiredRaw
    ? requiredRaw
        .split(/\n/)
        .map((line) => line.replace(/^-\s+/, "").trim())
        .filter(Boolean)
    : []

  const modules =
    extractJsonStringArray(source, "modules").length > 0
      ? extractJsonStringArray(source, "modules")
      : extractJsonStringArray(source, "## Selected Modules")

  const deliverablesRaw =
    extractJsonStringValue(source, "## Expected Deliverables") ||
    extractJsonStringValue(source, "Expected Deliverables")
  const deliverables = deliverablesRaw
    ? deliverablesRaw
        .split(/\n/)
        .map((line) => line.replace(/^-\s+/, "").trim())
        .filter(Boolean)
    : extractJsonStringArray(source, "deliverables")

  const todos = extractTodosFromLooseJson(source)

  return { name, overview, objective, requiredInputs, modules, deliverables, todos }
}

export function tryParsePlanJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = (text || "").trim()
  if (!trimmed.startsWith("{")) return null
  const attempts = [trimmed, sanitizePlanJsonText(trimmed)]
  for (const candidate of attempts) {
    try {
      const data = JSON.parse(candidate) as unknown
      if (data && typeof data === "object" && !Array.isArray(data)) {
        return data as Record<string, unknown>
      }
    } catch {
      // try next strategy
    }
  }
  const loose = extractPlanFieldsFromLooseJson(trimmed)
  if (loose.name || loose.overview || loose.objective || (loose.todos?.length ?? 0) > 0) {
    return {
      name: loose.name,
      overview: loose.overview,
      "## Objective": loose.objective,
      "## Required Inputs": loose.requiredInputs?.join("\n"),
      modules: loose.modules,
      "## Expected Deliverables": loose.deliverables?.join("\n"),
      todos: loose.todos?.map((t, i) => ({
        id: `step-${i + 1}`,
        task: t.task,
        status: t.status,
      })),
    }
  }
  return null
}

export interface NormalizedPlanJsonFields {
  name?: string
  overview?: string
  objective?: string
  requiredInputs?: string[]
  modules?: string[]
  deliverables?: string[]
  outline?: string[]
  clarificationUpdates?: string[]
  yourChoices?: string[]
  todos?: Array<{ id?: string; content?: string; task?: string; status?: string }>
}

function bulletLines(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n")
}

function todosYaml(
  todos: Array<{ id?: string; content?: string; task?: string; status?: string }>
): string {
  return todos
    .map((t, i) => {
      const id = String(t.id || `step-${i + 1}`).trim()
      const content = String(t.content || t.task || "").trim()
      const status = String(t.status || "pending").trim()
      return `  - id: ${id}\n    content: ${content}\n    status: ${status}`
    })
    .join("\n")
}

export function extractPlanFieldsFromJsonObject(data: Record<string, unknown>): NormalizedPlanJsonFields {
  const name = String(data.name || data.title || "").trim() || undefined
  const overview = String(data.overview || data.summary || "").trim() || undefined
  const objective =
    String(
      data.objective ||
        data["## Objective"] ||
        data["Objective"] ||
        ""
    ).trim() || undefined

  const requiredRaw =
    data.required_inputs ||
    data["## Required Inputs"] ||
    data["Required Inputs"] ||
    data.requiredInputs
  let requiredInputs: string[] = []
  if (Array.isArray(requiredRaw)) {
    requiredInputs = requiredRaw.map((x) => String(x).trim()).filter(Boolean)
  } else if (typeof requiredRaw === "string" && requiredRaw.trim()) {
    requiredInputs = requiredRaw
      .split(/\n/)
      .map((line) => line.replace(/^-\s+/, "").trim())
      .filter(Boolean)
  }

  const modulesRaw = data.modules || data["## Selected Modules"] || data["Selected Modules"]
  const modules = Array.isArray(modulesRaw)
    ? modulesRaw.map((m) => String(m).trim()).filter(Boolean)
    : []

  const deliverablesRaw =
    data.deliverables ||
    data["## Expected Deliverables"] ||
    data["Expected Deliverables"] ||
    data.expected_deliverables
  let deliverables: string[] = []
  if (Array.isArray(deliverablesRaw)) {
    deliverables = deliverablesRaw.map((x) => String(x).trim()).filter(Boolean)
  } else if (typeof deliverablesRaw === "string" && deliverablesRaw.trim()) {
    deliverables = deliverablesRaw
      .split(/\n/)
      .map((line) => line.replace(/^-\s+/, "").trim())
      .filter(Boolean)
  }

  const todosRaw = data.todos
  const todos = Array.isArray(todosRaw)
    ? todosRaw
        .filter((t): t is Record<string, unknown> => Boolean(t) && typeof t === "object")
        .map((t) => ({
          id: t.id ? String(t.id) : undefined,
          content: t.content ? String(t.content) : undefined,
          task: t.task ? String(t.task) : undefined,
          status: t.status ? String(t.status) : undefined,
        }))
    : []

  return { name, overview, objective, requiredInputs, modules, deliverables, todos }
}

export function buildPlanMarkdownFromFields(fields: NormalizedPlanJsonFields): string {
  const name = fields.name || "Pipeline plan"
  const overview =
    fields.overview || "Review the build plan, answer clarifications, then run the pipeline."
  const yamlTodos =
    fields.todos && fields.todos.length > 0
      ? todosYaml(fields.todos)
      : `  - id: analyze\n    content: Analyze requirements\n    status: completed\n  - id: build\n    content: Implement deliverables\n    status: in_progress`

  const sections: string[] = [
    "## Objective",
    fields.objective || overview,
    "",
    "## Required Inputs",
  ]
  if (fields.requiredInputs && fields.requiredInputs.length > 0) {
    sections.push(bulletLines(fields.requiredInputs))
  } else {
    sections.push("- User request (provided)")
  }
  if (fields.outline && fields.outline.length > 0) {
    sections.push("", "## Outline", bulletLines(fields.outline))
  }
  sections.push("", "## Selected Modules")
  if (fields.modules && fields.modules.length > 0) {
    sections.push(bulletLines(fields.modules))
  }
  sections.push("", "## Expected Deliverables")
  if (fields.deliverables && fields.deliverables.length > 0) {
    sections.push(bulletLines(fields.deliverables))
  } else {
    sections.push("- Source files surfaced in the code browser")
  }
  if (fields.clarificationUpdates && fields.clarificationUpdates.length > 0) {
    sections.push("", "## Clarification updates", bulletLines(fields.clarificationUpdates))
  }
  if (fields.yourChoices && fields.yourChoices.length > 0) {
    sections.push("", "## Your choices", bulletLines(fields.yourChoices))
  }

  return (
    `---\nname: ${name}\noverview: ${overview.replace(/\n/g, " ")}\ntodos:\n${yamlTodos}\n---\n\n` +
    `# ${name}\n\n${sections.join("\n")}`
  )
}

function rebuildMarkdownFromPlanJson(
  data: Record<string, unknown>,
  options?: { modulesFromPayload?: string[] }
): string {
  const nested = String(data.plan_markdown || data.markdown || "").trim()
  const fields = extractPlanFieldsFromJsonObject(data)
  if (options?.modulesFromPayload?.length && fields.modules?.length === 0) {
    fields.modules = options.modulesFromPayload
  }
  if (nested.length >= 80 && nested.includes("## Objective") && !looksLikeJsonPlanBlob(nested)) {
    return nested
  }
  return buildPlanMarkdownFromFields(fields)
}

/** If markdown is a JSON blob or too-short frontmatter, rebuild canonical plan markdown. */
export function normalizePlanMarkdown(
  markdown: string,
  options?: { modulesFromPayload?: string[] }
): string {
  let trimmed = unwrapPlanMarkdownFence(markdown || "")
  if (!trimmed) return trimmed

  trimmed = ensureYamlFrontmatterWrapper(trimmed)

  if (looksLikeJsonPlanBlob(trimmed)) {
    const data = tryParsePlanJsonObject(trimmed)
    if (data) return rebuildMarkdownFromPlanJson(data, options)
  }

  const fmEnd = trimmed.indexOf("\n---", 3)
  const body =
    trimmed.startsWith("---") && fmEnd >= 0 ? trimmed.slice(fmEnd + 4).trim() : trimmed
  if (looksLikeJsonPlanBlob(body)) {
    const data = tryParsePlanJsonObject(body)
    if (data) return rebuildMarkdownFromPlanJson(data, options)
  }

  if (trimmed.startsWith("---") && fmEnd >= 0) {
    const yamlBlock = trimmed.slice(3, fmEnd).trim()
    if (yamlBlock.length < 20 && !body.includes("## Objective")) {
      return trimmed
    }
  }

  // Last resort: rebuild from loose name/overview when still an unparsed dump.
  if (
    !trimmed.startsWith("---") &&
    (trimmed.includes("```") || looksLikeRawPlanDump(trimmed) || /\boverview\s*:/i.test(trimmed))
  ) {
    const loose = extractLooseYamlPlanFields(trimmed)
    if (loose.name || loose.overview) {
      return buildPlanMarkdownFromFields({
        name: loose.name,
        overview: loose.overview,
        modules: options?.modulesFromPayload,
      })
    }
  }

  return trimmed
}
