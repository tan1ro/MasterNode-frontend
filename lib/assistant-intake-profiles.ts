import type { AgentTemplateApi } from "@/types/api"

/** Standard academics course-planning inputs (Bloom planner, outline, etc.). */
export const ACADEMICS_COURSE_PLANNER_FIELDS = [
  "course",
  "outcomes",
  "audience",
  "credits",
  "ltp",
] as const

/** Explicit intake order / field set per assistant template. */
export const TEMPLATE_INTAKE_PROFILES: Record<string, readonly string[]> = {
  "sample-academics-bloom-course-planner": ACADEMICS_COURSE_PLANNER_FIELDS,
  "sample-academics-course-outline": ACADEMICS_COURSE_PLANNER_FIELDS,
  "sample-academics-exam-blueprint": [
    "course",
    "outcomes",
    "constraints",
    "audience",
    "credits",
  ],
  "sample-academics-lesson-planner": ["course", "topic", "duration", "audience", "outcomes"],
  "sample-academics-assignment-designer": ["assignment", "outcomes", "scale", "audience"],
  "sample-academics-lab-practical-planner": ["lab", "equipment", "outcomes", "audience", "constraints"],
  "sample-academics-quiz-generator": ["topic", "bloom_level", "count", "audience"],
  "sample-academics-course-packaging": ["course", "weeks", "platform", "audience", "outcomes"],
  "sample-academics-outcome-framework": ["outcome", "course", "audience"],
  "sample-academics-curriculum-mapper": ["outcomes", "brief", "constraints", "audience"],
  "sample-academics-attainment-tracker": ["outcomes", "data", "thresholds", "course"],
  "sample-academics-placement-coordinator": ["program", "cohort", "season"],
  "sample-academics-study-coach": ["subjects", "exam_date", "level", "constraints"],
  "sample-market-intel-engine": ["market", "product", "geo", "goal"],
  "sample-marketing-competitor-financials": ["competitors", "market", "our_product", "goal"],
  "sample-marketing-icp-mapping": ["segments", "product", "market", "goal"],
  "sample-marketing-positioning-messaging": ["product", "audience", "competitors", "goal"],
  "sample-marketing-product-launch": ["product", "launch_date", "audience", "channels", "goal"],
  "sample-academics-syllabus-auditor": ["syllabus", "mapping", "course", "outcomes"],
  "sample-academics-research-methodology": ["question", "databases", "inclusion", "field"],
  "sample-academics-thesis-planner": ["thesis", "committee", "format", "deadline"],
  "sample-sales-rfp-response": ["rfp", "solution", "deadline"],
  "sample-sales-discovery-facilitator": ["prospect", "product", "stage"],
  "sample-sales-needs-analysis": ["customer", "requirements", "product"],
  "sample-sales-proposal-sow": ["deal", "scope", "pricing"],
  "sample-sales-stakeholder-engagement": ["account", "deal", "contacts"],
  "sample-sales-demo-presenter": ["prospect", "use_case", "product"],
  "sample-sales-roi-business-case": ["customer", "solution", "metrics"],
  "sample-sales-negotiation-coach": ["deal", "terms", "objections"],
  "sample-legal-contract-risk-lens": ["contract", "role", "commercial", "context"],
  "sample-legal-dpia-privacy-risk": ["processing", "data", "jurisdiction", "context"],
}

function toStringVariables(variables: unknown[] | undefined): string[] {
  if (!Array.isArray(variables)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of variables) {
    const name = String(raw ?? "").trim()
    if (!name || seen.has(name)) continue
    seen.add(name)
    out.push(name)
  }
  return out
}

function mergeFieldNames(primary: readonly string[], fallback: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const name of [...primary, ...fallback]) {
    const key = name.trim()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(key)
  }
  return out
}

/** Resolve which variables to collect for an assistant (profile → category heuristic → template vars). */
export function resolveIntakeFieldNames(template: AgentTemplateApi | null | undefined): string[] {
  if (!template) return []
  const id = String(template.template_id ?? "").trim()
  const fromTemplate = toStringVariables(template.variables)

  if (id && TEMPLATE_INTAKE_PROFILES[id]) {
    return mergeFieldNames(TEMPLATE_INTAKE_PROFILES[id], fromTemplate)
  }

  const category = String(template.category ?? "").toLowerCase()
  if (
    category === "academics" &&
    fromTemplate.includes("course") &&
    fromTemplate.length <= 3 &&
    !fromTemplate.includes("syllabus")
  ) {
    return mergeFieldNames(ACADEMICS_COURSE_PLANNER_FIELDS, fromTemplate)
  }

  if (
    (category === "sales_marketing" || category === "marketing") &&
    fromTemplate.includes("product") &&
    fromTemplate.length <= 3
  ) {
    return mergeFieldNames(["product", "audience", "market", "goal"], fromTemplate)
  }

  return fromTemplate
}
