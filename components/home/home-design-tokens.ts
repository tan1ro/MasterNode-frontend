/** Landing page palette from Figma export — scoped to home components. */
export const HOME_COLORS = {
  ink: "#0D0D10",
  panel: "#0C0810",
  panelDeep: "#050609",
  headline: "#F0F2F8",
  body: "#8B92A9",
  lime: "#B0F900",
  cyan: "#00FFFE",
  cyanSoft: "#2DCFCF",
  orange: "#FFA600",
  purple: "#8750CC",
  green: "#00D27E",
  gold: "#F5C842",
  blue: "#3B82F6",
} as const

export type HomeCapability = {
  title: string
  lead: string
  body: string
  why: string
  accent: string
  border: string
}

export const HOME_CAPABILITIES: readonly HomeCapability[] = [
  {
    title: "Collaborative Agent Teams",
    lead: "Multiple AI specialists work together on one objective.",
    body: "Research, analysis, strategy and execution agents coordinate instead of operating as isolated chatbots.",
    why: "Handles complex workflows that a single assistant struggles with.",
    accent: HOME_COLORS.lime,
    border: "rgba(176, 249, 0, 0.50)",
  },
  {
    title: "Domain-Specific Assistants",
    lead: "Bring specialized expertise into every workflow.",
    body: "Configure assistants around specific business functions, roles, knowledge and operating processes.",
    why: "More relevant outputs without repeatedly explaining the context.",
    accent: HOME_COLORS.purple,
    border: "rgba(135, 80, 204, 0.51)",
  },
  {
    title: "Memory & Knowledge Hub",
    lead: "Give AI persistent access to your business context.",
    body: "Connect documents, previous work and organizational knowledge so agents can retrieve the information they need.",
    why: "Less repetitive prompting. More consistent, context-aware work.",
    accent: HOME_COLORS.orange,
    border: "rgba(255, 166, 0, 0.61)",
  },
  {
    title: "Model-Agnostic AI Layer",
    lead: "Use the right model for the right task.",
    body: "Switch between leading AI models without rebuilding your workflows.",
    why: "Avoids lock-in and lets the platform optimize for capability, cost and speed.",
    accent: HOME_COLORS.cyan,
    border: "rgba(0, 255, 254, 0.63)",
  },
  {
    title: "Workflow Execution & Tracking",
    lead: "Watch the work happen from request to delivery.",
    body: "Track agent execution, review progress and receive structured, downloadable business outputs.",
    why: "Turns opaque AI responses into an observable workflow.",
    accent: HOME_COLORS.green,
    border: "rgba(0, 210, 126, 0.55)",
  },
]

/** Landing stats — values tied to multi-LLM same-prompt suite / parallel mocks (see docs/benchmarks-report.html). */
export const HOME_STATS = [
  { value: "100%", label: "Eval pass rate", accent: HOME_COLORS.lime },
  { value: "2.5×", label: "Parallel speedup", accent: HOME_COLORS.purple },
  { value: "91", label: "Effect score", accent: HOME_COLORS.orange },
  { value: "+67pp", label: "vs other LLMs", accent: HOME_COLORS.cyan },
] as const
